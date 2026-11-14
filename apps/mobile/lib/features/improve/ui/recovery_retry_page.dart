// Improve recovery loop — scored retry for one weak skill.
//
// Unlike "My mistakes" (a drill), every answer here is a real attempt: the
// existing QuestionPage submits it to POST /sessions/:id/attempt, so the AIM
// engine (never Flutter) updates mastery, weakness and review schedules.
//
// Flutter NEVER calculates mastery or correctness: it only shows the engine's
// value before and after, as the backend returns it.
//
// RTL: EdgeInsetsDirectional everywhere; numbers that must stay left-to-right
// are wrapped in an LTR text direction.

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

/// Retry session for [skillKey] (`/improve/retry?skill=...`).
class RecoveryRetryPage extends ConsumerStatefulWidget {
  const RecoveryRetryPage({required this.skillKey, super.key});

  final String skillKey;

  @override
  ConsumerState<RecoveryRetryPage> createState() => _RecoveryRetryPageState();
}

class _RecoveryRetryPageState extends ConsumerState<RecoveryRetryPage> {
  RecoveryStart? _run;
  RecoverySkill? _locked;
  String? _error;
  int _index = 0;
  double? _before;
  double? _after;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  double? _masteryNow() {
    final data = switch (ref.read(aimResultsProvider)) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (data == null) return null;
    for (final s in data.skillStates) {
      if (s.skillId == widget.skillKey) return s.masteryScore;
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

  Future<void> _start() async {
    setState(() {
      _error = null;
      _locked = null;
      _run = null;
      _index = 0;
      _after = null;
    });
    _before = _masteryNow();
    try {
      final api = ref.read(learnerToolsApiProvider);
      // The overview says whether the wait is over (and when it ends), so a locked skill gets a friendly screen.
      final skills = await api.recoveryOverview();
      RecoverySkill? skill;
      for (final s in skills) {
        if (s.skillKey == widget.skillKey) skill = s;
      }
      if (skill != null && !skill.unlocked) {
        if (mounted) setState(() => _locked = skill);
        return;
      }
      final run = await api.startRecovery(widget.skillKey);
      if (!mounted) return;
      if (run.questions.isEmpty || run.sessionId.isEmpty) {
        setState(() => _error = context.tr('No questions are available for this skill yet', 'لا توجد أسئلة متاحة لهذه المهارة بعد'));
        return;
      }
      setState(() => _run = run);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e, context.tr('Could not start your retry', 'تعذّر بدء إعادة المحاولة')));
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
        setState(() => _after = _masteryNow());
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
    final titles = ref.watch(skillTitlesProvider).valueOrNull ?? const <String, String>{};
    final name = skillName(titles, widget.skillKey);
    final run = _run;

    // Mid-session the QuestionPage draws its own app bar.
    if (run != null && _index < run.questions.length) {
      final q = run.questions[_index];
      return QuestionPage(
        key: ValueKey(q.itemId),
        sessionId: run.sessionId,
        questionId: q.itemId,
        initialQuestion: _toQuestion(q),
        onNext: _next,
      );
    }

    Widget body;
    if (_locked != null) {
      body = _lockedView(context, _locked!);
    } else if (_error != null) {
      body = AIMFullScreenError(message: _error!, onRetry: _start);
    } else if (run == null) {
      body = AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    } else {
      body = _doneView(context, name);
    }

    return Scaffold(
      appBar: AIMTopAppBar(
        title: context.tr('Retry', 'إعادة المحاولة'),
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: SafeArea(top: false, child: body),
    );
  }

  Widget _lockedView(BuildContext context, RecoverySkill skill) {
    return AIMEmptyState(
      icon: const Icon(Icons.lock_clock_rounded),
      title: context.tr('Retry opens soon', 'إعادة المحاولة ستفتح قريبًا'),
      subtitle: fill(
        context.tr(
          'Spacing your retry helps you remember it for good. It opens in {n} days. Until then, learn it with the AI Teacher.',
          'التباعد في إعادة المحاولة يثبّت المعلومة. ستفتح بعد {n} أيام. حتى ذلك الحين، تعلّمها مع المعلم الذكي.',
        ),
        {'n': skill.daysLeft()},
      ),
      action: AIMButton(
        onPressed: () => context.pop(),
        child: Text(context.tr('Back to Improve', 'العودة إلى التحسين')),
      ),
    );
  }

  Widget _doneView(BuildContext context, String name) {
    final from = _before == null ? null : (_before! * 100).round().clamp(0, 100);
    final to = _after == null ? null : (_after! * 100).round().clamp(0, 100);
    final line = (from != null && to != null)
        ? fill(context.tr('Mastery {from}% → {to}%', 'الإتقان {from}% ← {to}%'), {'from': from, 'to': to})
        : context.tr('Your mastery is being updated.', 'جارٍ تحديث مستوى إتقانك.');
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: context.tr('Retry complete', 'اكتملت إعادة المحاولة'),
      // The percentages keep their left-to-right order inside Arabic text.
      subtitle: '$name\n\u2066$line\u2069',
      action: AIMButton(
        onPressed: () => context.pop(),
        child: Text(context.tr('Back to Improve', 'العودة إلى التحسين')),
      ),
    );
  }
}
