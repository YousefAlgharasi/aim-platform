// Grammar / Listening / Reading practice.
//
// Step 1 picks a skill (the server suggests the weakest one at the student's
// level). Step 2 is a real learning session: the existing QuestionPage submits
// every answer to POST /sessions/:id/attempt, so the AIM engine (never
// Flutter) updates mastery. This page only shows the engine's value before
// and after.
//
// RTL: EdgeInsetsDirectional everywhere; numbers stay left-to-right via
// Unicode isolates in the result line.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/state/app_async_state.dart';
import '../../../core/widgets/widgets.dart';
import '../../aim_results/logic/provider/aim_results_provider.dart';
import '../../auth/logic/provider/auth_context_provider.dart';
import '../../auth/logic/provider/auth_flow_provider.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import '../../question_answer/data/models/answer_option_model.dart';
import '../../question_answer/data/models/question_model.dart';
import '../../question_answer/ui/pages/question_page.dart';

const _modes = ['grammar', 'listening', 'reading'];

class SkillPracticePage extends ConsumerStatefulWidget {
  const SkillPracticePage({required this.mode, super.key});

  /// `grammar`, `listening` or `reading`.
  final String mode;

  @override
  ConsumerState<SkillPracticePage> createState() => _SkillPracticePageState();
}

class _SkillPracticePageState extends ConsumerState<SkillPracticePage> {
  List<PracticeSkill>? _skills;
  PracticeStart? _run;
  String? _starting;
  String? _error;
  int _index = 0;
  double? _before;
  double? _after;

  String get _mode => _modes.contains(widget.mode) ? widget.mode : 'grammar';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadSkills());
  }

  String _title(BuildContext context) => switch (_mode) {
        'listening' => context.tr('Listening practice', 'تدريب الاستماع'),
        'reading' => context.tr('Reading practice', 'تدريب القراءة'),
        _ => context.tr('Grammar practice', 'تدريب القواعد'),
      };

  String _blurb(BuildContext context) => switch (_mode) {
        'listening' => context.tr('Listen to a short recording, then answer questions about it.',
            'استمع إلى تسجيل قصير، ثم أجب عن الأسئلة.'),
        'reading' => context.tr('Read a short passage, then answer questions about it.',
            'اقرأ نصًا قصيرًا، ثم أجب عن الأسئلة.'),
        _ => context.tr('Short drills on one grammar point, matched to your level.',
            'تمارين قصيرة على قاعدة واحدة، مناسبة لمستواك.'),
      };

  IconData get _icon => switch (_mode) {
        'listening' => Icons.headphones_rounded,
        'reading' => Icons.menu_book_rounded,
        _ => Icons.spellcheck_rounded,
      };

  double? _masteryNow(String skillKey) {
    final data = switch (ref.read(aimResultsProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (data == null) return null;
    for (final s in data.skillStates) {
      if (s.skillId == skillKey) return s.masteryScore;
    }
    return null;
  }

  Future<void> _reloadResults() async {
    final token = ref.read(authFlowProvider).accessToken;
    final user = switch (ref.read(authContextProvider)) {
      AppAsyncSuccess(:final data) => data.user,
      _ => null,
    };
    if (user == null || token == null || token.isEmpty) return;
    await ref.read(aimResultsProvider.notifier).load(bearerToken: token, studentId: user.id);
  }

  Future<void> _loadSkills() async {
    setState(() {
      _error = null;
      _skills = null;
      _run = null;
    });
    try {
      final skills = await ref.read(learnerToolsApiProvider).practiceSkills(_mode);
      if (mounted) setState(() => _skills = skills);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e, context.tr('Could not load your practice', 'تعذّر تحميل التدريب')));
    }
  }

  Future<void> _start(PracticeSkill skill) async {
    if (_starting != null) return;
    setState(() {
      _starting = skill.skillKey;
      _error = null;
    });
    _before = _masteryNow(skill.skillKey);
    try {
      final run = await ref.read(learnerToolsApiProvider).startPractice(_mode, skill.skillKey);
      if (!mounted) return;
      if (run.questions.isEmpty || run.sessionId.isEmpty) {
        setState(() => _error = context.tr(
            'We could not prepare this practice right now. Please try again in a moment.',
            'تعذّر تجهيز هذا التدريب الآن. حاول مرة أخرى بعد قليل.'));
        return;
      }
      setState(() {
        _run = run;
        _index = 0;
        _after = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(
          e,
          context.tr('We could not prepare this practice right now. Please try again in a moment.',
              'تعذّر تجهيز هذا التدريب الآن. حاول مرة أخرى بعد قليل.')));
    } finally {
      if (mounted) setState(() => _starting = null);
    }
  }

  Future<void> _next() async {
    final run = _run;
    if (run == null) return;
    final done = _index + 1 >= run.questions.length;
    setState(() => _index++);
    if (done) {
      // The engine may need a moment after the last answer; read its updated mastery a few times.
      for (var i = 0; i < 3 && mounted; i++) {
        await Future<void>.delayed(Duration(milliseconds: i == 0 ? 800 : 2500));
        await _reloadResults();
        if (!mounted) return;
        setState(() => _after = _masteryNow(run.skillKey));
        if (_after != null && _before != null && _after != _before) break;
      }
    }
  }

  QuestionModel _toQuestion(RecoveryQuestion q) => QuestionModel(
        id: q.itemId,
        type: q.type,
        stem: q.prompt,
        difficulty: '',
        options: [
          for (var i = 0; i < q.options.length; i++)
            AnswerOptionModel(id: q.options[i].id, text: q.options[i].text, order: i),
        ],
      );

  @override
  Widget build(BuildContext context) {
    final run = _run;

    // Mid-session the QuestionPage draws its own app bar.
    if (run != null && _index < run.questions.length) {
      final q = run.questions[_index];
      return QuestionPage(
        key: ValueKey(q.itemId),
        sessionId: run.sessionId,
        questionId: q.itemId,
        initialQuestion: _toQuestion(q),
        passage: run.passage,
        onNext: _next,
      );
    }

    Widget body;
    if (run != null) {
      body = _doneView(context, run);
    } else if (_error != null && _skills == null) {
      body = AIMFullScreenError(message: _error!, onRetry: _loadSkills);
    } else if (_skills == null) {
      body = AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    } else {
      body = _pickView(context, _skills!);
    }

    return Scaffold(
      appBar: AIMTopAppBar(
        title: _title(context),
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: SafeArea(top: false, child: body),
    );
  }

  Widget _doneView(BuildContext context, PracticeStart run) {
    final from = _before == null ? null : (_before! * 100).round().clamp(0, 100);
    final to = _after == null ? null : (_after! * 100).round().clamp(0, 100);
    final line = (from != null && to != null)
        ? fill(context.tr('Mastery {from}% → {to}%', 'الإتقان {from}% ← {to}%'), {'from': from, 'to': to})
        : context.tr('Your mastery is being updated.', 'جارٍ تحديث مستوى إتقانك.');
    final skill = _skills?.where((s) => s.skillKey == run.skillKey).firstOrNull;
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: context.tr('Practice complete', 'اكتمل التدريب'),
      // The percentages keep their left-to-right order inside Arabic text.
      subtitle: '${run.title}\n\u2066$line\u2069',
      action: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (skill != null) ...[
            AIMButton(
              onPressed: () {
                setState(() => _run = null);
                _start(skill);
              },
              child: Text(context.tr('Practice again', 'تدرّب مرة أخرى')),
            ),
            const SizedBox(height: AimSpacing.space8),
          ],
          AIMButton(
            variant: AIMButtonVariant.secondary,
            onPressed: _loadSkills,
            child: Text(context.tr('Choose another skill', 'اختر مهارة أخرى')),
          ),
          const SizedBox(height: AimSpacing.space8),
          AIMButton(
            variant: AIMButtonVariant.secondary,
            onPressed: () => context.pop(),
            child: Text(context.tr('Back to Practice', 'العودة إلى التدريب')),
          ),
        ],
      ),
    );
  }

  Widget _pickView(BuildContext context, List<PracticeSkill> skills) {
    final surfaces = aimSurfacesOf(context);
    if (skills.isEmpty) {
      return AIMEmptyState(
        icon: Icon(_icon),
        title: context.tr('No practice is available for this skill area yet',
            'لا يوجد تدريب متاح لهذه المهارة بعد'),
      );
    }
    final rec = skills.where((s) => s.recommended).firstOrNull;
    return ListView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      children: [
        Text(_blurb(context), style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted)),
        const SizedBox(height: AimSpacing.componentGap),
        if (_error != null) ...[
          AIMAlertBanner(tone: AIMAlertTone.error, child: Text(_error!)),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        if (rec != null) ...[
          _RecommendedCard(skill: rec, busy: _starting == rec.skillKey, onStart: () => _start(rec)),
          const SizedBox(height: AimSpacing.sectionGap),
        ],
        Text(
          context.tr('Choose a skill', 'اختر مهارة'),
          style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        for (final s in skills) ...[
          _SkillRow(
            skill: s,
            icon: _icon,
            busy: _starting == s.skillKey,
            onTap: _starting != null ? null : () => _start(s),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        const SizedBox(height: 40),
      ],
    );
  }
}

/// The skill the server recommends: a gradient card with one big Start pill.
class _RecommendedCard extends StatelessWidget {
  const _RecommendedCard({required this.skill, required this.busy, required this.onStart});

  final PracticeSkill skill;
  final bool busy;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space12 + 2),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: AlignmentDirectional.topStart,
          end: AlignmentDirectional.bottomEnd,
          colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
        ),
        borderRadius: BorderRadius.circular(AimRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500.withValues(alpha: 0.30),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star_rounded, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    context.tr('Recommended for you', 'مقترح لك'),
                    style: AimTextStyles.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(skill.title, style: AimTextStyles.h2.copyWith(color: Colors.white)),
          const SizedBox(height: AimSpacing.space12),
          Material(
            color: Colors.white,
            shape: const StadiumBorder(),
            child: InkWell(
              customBorder: const StadiumBorder(),
              onTap: busy ? null : onStart,
              child: Padding(
                padding: const EdgeInsetsDirectional.symmetric(horizontal: 16, vertical: 12),
                child: Center(
                  child: Text(
                    busy ? context.tr('Preparing…', 'جارٍ التجهيز…') : context.tr('Start practice', 'ابدأ التدريب'),
                    style: AimTextStyles.bodyMd.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// One skill: icon, name, mastery, and a Start label (the whole row is tappable).
class _SkillRow extends StatelessWidget {
  const _SkillRow({required this.skill, required this.icon, required this.busy, required this.onTap});

  final PracticeSkill skill;
  final IconData icon;
  final bool busy;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final pct = skill.masteryScore == null ? null : (skill.masteryScore! * 100).round().clamp(0, 100);
    return Semantics(
      button: true,
      label: skill.title,
      child: Material(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        child: InkWell(
          borderRadius: BorderRadius.circular(AimRadius.lg),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
              boxShadow: [
                BoxShadow(
                  color: AimColors.primary500.withValues(alpha: dark ? 0.12 : 0.06),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.22 : 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 22, color: AimColors.primary500),
                ),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        skill.title,
                        style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        pct == null
                            ? context.tr('Not practised yet', 'لم تتدرّب عليها بعد')
                            : fill(context.tr('Mastery {pct}%', 'الإتقان {pct}%'), {'pct': pct}),
                        style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AimSpacing.space8),
                Text(
                  busy ? context.tr('Preparing…', 'جارٍ التجهيز…') : context.tr('Start', 'ابدأ'),
                  style: AimTextStyles.bodySm.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
