import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/state/app_async_state.dart';
import '../../../core/widgets/widgets.dart';
import '../../aim_results/logic/entity/aim_results_data.dart';
import '../../aim_results/logic/provider/aim_results_provider.dart';
import '../../auth/logic/provider/auth_context_provider.dart';
import '../../auth/logic/provider/auth_flow_provider.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import '../../shell/logic/main_shell_tab_provider.dart';

/// One skill the student should work on, built from the backend's AIM outputs.
/// Nothing is calculated here: severity, mastery and the suggested lesson all
/// come from the server; this only orders them for display.
class _WeakSpot {
  const _WeakSpot({
    required this.skillId,
    required this.severity,
    this.mastery,
    this.lessonId,
    this.detectedAt,
  });

  final String skillId;
  final String severity; // critical | developing | emerging
  final double? mastery;
  final String? lessonId;
  final String? detectedAt;
}

const _severityRank = {'critical': 0, 'developing': 1, 'emerging': 2};

List<_WeakSpot> _buildWeakSpots(AimResultsData data) {
  final skillById = {for (final s in data.skillStates) s.skillId: s};
  final lessonBySkill = <String, String>{};
  final recs = [...data.recommendations]..sort((a, b) => a.rank.compareTo(b.rank));
  for (final r in recs) {
    if (r.targetLessonId != null) {
      lessonBySkill.putIfAbsent(r.targetSkillId, () => r.targetLessonId!);
    }
  }

  final spots = <_WeakSpot>[];
  final seen = <String>{};
  for (final w in data.weaknessRecords) {
    final status = w.status.toLowerCase();
    if (!(status == 'open' || status == 'improving') || !seen.add(w.skillId)) {
      continue;
    }
    final sev = w.severity.toLowerCase();
    spots.add(_WeakSpot(
      skillId: w.skillId,
      severity: sev == 'critical' || sev == 'developing' ? sev : 'emerging',
      mastery: skillById[w.skillId]?.masteryScore,
      lessonId: lessonBySkill[w.skillId],
      detectedAt: w.detectedAt,
    ));
  }
  for (final s in data.skillStates) {
    if (seen.contains(s.skillId) || s.masteryScore >= 0.5) continue;
    spots.add(_WeakSpot(
      skillId: s.skillId,
      severity: s.masteryScore < 0.3 ? 'critical' : 'developing',
      mastery: s.masteryScore,
      lessonId: lessonBySkill[s.skillId],
    ));
  }
  spots.sort((a, b) {
    final bySeverity = _severityRank[a.severity]!.compareTo(_severityRank[b.severity]!);
    if (bySeverity != 0) return bySeverity;
    return (a.mastery ?? 0.5).compareTo(b.mastery ?? 0.5);
  });
  return spots;
}

String _prettify(String skillId) {
  final last = skillId.split(':').last;
  final words = last
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

/// Improve — where the student is weak and how to fix it.
/// Mirrors the web app's "Improve" page.
class ImprovePage extends ConsumerStatefulWidget {
  const ImprovePage({super.key});

  @override
  ConsumerState<ImprovePage> createState() => _ImprovePageState();
}

class _ImprovePageState extends ConsumerState<ImprovePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final ctx = ref.read(authContextProvider);
    final token = ref.read(authFlowProvider).accessToken;
    final user = switch (ctx) {
      AppAsyncSuccess(:final data) => data.user,
      _ => null,
    };
    if (user == null || token == null || token.isEmpty) return;
    await ref.read(aimResultsProvider.notifier).load(bearerToken: token, studentId: user.id);
  }

  Future<void> _refresh() async {
    ref.invalidate(mistakesProvider(null));
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aimResultsProvider);
    return Scaffold(
      appBar: AIMTopAppBar(title: context.tr('Improve', 'تحسين')),
      body: SafeArea(
        top: false,
        child: switch (state) {
          AppAsyncFailure(:final message) => AIMFullScreenError(message: message, onRetry: _load),
          AppAsyncSuccess(:final data) => _content(context, data),
          _ => AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل')),
        },
      ),
    );
  }

  Widget _content(BuildContext context, AimResultsData data) {
    final surfaces = aimSurfacesOf(context);
    final mistakes = ref.watch(mistakesProvider(null)).valueOrNull;
    final spots = _buildWeakSpots(data);
    final fixed = data.weaknessRecords.where((w) => w.status.toLowerCase() == 'resolved').toList();
    final dueReviews = data.reviewSchedules.where((r) {
      final st = r.status.toLowerCase();
      final due = DateTime.tryParse(r.dueAt);
      return (st == 'due' || st == 'pending' || st == 'rescheduled') &&
          due != null &&
          !due.isAfter(DateTime.now());
    }).toList();
    final top = spots.isEmpty ? null : spots.first;
    final mistakeCount = mistakes?.total ?? 0;

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          _Hero(
            top: top,
            toWorkOn: spots.length,
            mistakes: mistakes?.total,
            reviewsDue: dueReviews.length,
            fixed: fixed.length,
            onPractice: () => top?.lessonId != null
                ? _practice(top!.lessonId!)
                : _findLesson(),
          ),
          if (mistakeCount > 0 || dueReviews.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            AIMCard(
              onTap: () => context.push('${AppRoutePaths.mistakes}?quick=1'),
              child: Padding(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            context.tr('5-minute fix session', 'جلسة إصلاح لخمس دقائق'),
                            style: AimTextStyles.bodyLg.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            mistakeCount > 0
                                ? context.tr(
                                    'Up to 5 questions you got wrong, picked for you. The fastest way to turn a mistake into a point.',
                                    'حتى 5 أسئلة أخطأت فيها، اخترناها لك. أسرع طريقة لتحويل الخطأ إلى نقطة.',
                                  )
                                : context.tr(
                                    'A few quick questions to keep your weak spots from coming back.',
                                    'بعض الأسئلة السريعة لمنع عودة نقاط ضعفك.',
                                  ),
                            style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AimSpacing.space8),
                    Text(
                      context.tr('Start', 'ابدأ'),
                      style: AimTextStyles.bodyMd.copyWith(
                        color: AimColors.primary500,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            context.tr('Weak spots', 'نقاط الضعف'),
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          if (spots.isEmpty)
            AIMEmptyState(
              icon: const Icon(Icons.check_circle_outline_rounded),
              title: context.tr('No weaknesses detected', 'لم تُرصد نقاط ضعف'),
              subtitle: context.tr(
                'Great work — no areas to improve have been detected yet.',
                'عمل رائع — لم تُرصد مجالات تحتاج إلى تحسين حتى الآن.',
              ),
            )
          else
            for (final s in spots) ...[
              _SpotCard(
                spot: s,
                mistakes: (mistakes?.items ?? const [])
                    .where((m) => m.skillIds.contains(s.skillId))
                    .toList(),
                onPractice: s.lessonId == null ? _findLesson : () => _practice(s.lessonId!),
                onReread: s.lessonId == null ? null : () => _reread(s.lessonId!),
                onAsk: s.lessonId == null ? null : () => _askTeacher(s.lessonId!, _prettify(s.skillId)),
              ),
              const SizedBox(height: AimSpacing.componentGap),
            ],
          if (dueReviews.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  context.tr('Reviews due', 'مراجعات مستحقة'),
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                ),
                TextButton(
                  onPressed: () => context.push(AppRoutePaths.reviewSchedule),
                  child: Text(context.tr('View all', 'عرض الكل')),
                ),
              ],
            ),
            AIMCard(
              child: Padding(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                child: Column(
                  children: [
                    for (final r in dueReviews.take(4))
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                _prettify(r.skillId),
                                style: AimTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w700),
                              ),
                            ),
                            Text(
                              r.dueAt.length >= 10 ? r.dueAt.substring(0, 10) : r.dueAt,
                              style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
          if (fixed.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              context.tr('Already fixed', 'تم إصلاحها'),
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: [
                for (final w in fixed.take(12))
                  Chip(
                    avatar: const Icon(Icons.check_rounded, size: 16, color: AimColors.success500),
                    label: Text(_prettify(w.skillId)),
                  ),
              ],
            ),
          ],
          const SizedBox(height: 72),
        ],
      ),
    );
  }

  void _practice(String lessonId) =>
      context.push(AppRoutePaths.practiceSession, extra: {'lessonId': lessonId, 'lessonTitle': ''});

  void _reread(String lessonId) =>
      context.push(AppRoutePaths.lessonDetail, extra: {'lessonId': lessonId, 'lessonTitle': ''});

  void _askTeacher(String lessonId, String title) => context.push(
        AppRoutePaths.aiTeacherChat,
        extra: {'contextRef': 'lesson:$lessonId', 'lessonTitle': title},
      );

  void _findLesson() {
    ref.read(mainShellTabIndexProvider.notifier).state = 1;
    context.go(AppRoutePaths.mainShell);
  }
}

class _Hero extends StatelessWidget {
  const _Hero({
    required this.top,
    required this.toWorkOn,
    required this.mistakes,
    required this.reviewsDue,
    required this.fixed,
    required this.onPractice,
  });

  final _WeakSpot? top;
  final int toWorkOn;
  final int? mistakes;
  final int reviewsDue;
  final int fixed;
  final VoidCallback onPractice;

  @override
  Widget build(BuildContext context) {
    Widget stat(String value, String label) => Expanded(
          child: Container(
            padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(AimRadius.md),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: AimTextStyles.h2.copyWith(color: Colors.white)),
                Text(
                  label,
                  style: AimTextStyles.caption.copyWith(color: Colors.white.withValues(alpha: 0.9)),
                ),
              ],
            ),
          ),
        );

    return Container(
      padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
      decoration: BoxDecoration(
        gradient: AimGradients.gzHero,
        borderRadius: BorderRadius.circular(AimRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (top != null) ...[
            Text(
              context.tr('Start with this', 'ابدأ بهذا'),
              style: AimTextStyles.caption.copyWith(
                color: Colors.white.withValues(alpha: 0.85),
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(_prettify(top!.skillId), style: AimTextStyles.h2.copyWith(color: Colors.white)),
            const SizedBox(height: AimSpacing.space12),
            FilledButton(
              onPressed: onPractice,
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AimColors.primary500,
                minimumSize: const Size.fromHeight(46),
                shape: const StadiumBorder(),
              ),
              child: Text(top!.lessonId != null
                  ? context.tr('Practice now', 'تدرّب الآن')
                  : context.tr('Find a lesson', 'ابحث عن درس')),
            ),
          ] else
            Text(
              context.tr(
                'No weak spots right now. Keep learning to stay sharp.',
                'لا توجد نقاط ضعف حالياً. واصل التعلم لتبقى متميزاً.',
              ),
              style: AimTextStyles.bodyLg.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          const SizedBox(height: AimSpacing.space16),
          Row(
            children: [
              stat('$toWorkOn', context.tr('To work on', 'تحتاج عملاً')),
              const SizedBox(width: AimSpacing.space8),
              stat(mistakes?.toString() ?? '—', context.tr('Mistakes to retry', 'أخطاء لإعادتها')),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Row(
            children: [
              stat('$reviewsDue', context.tr('Reviews due', 'مراجعات مستحقة')),
              const SizedBox(width: AimSpacing.space8),
              stat('$fixed', context.tr('Already fixed', 'تم إصلاحها')),
            ],
          ),
        ],
      ),
    );
  }
}

class _SpotCard extends StatelessWidget {
  const _SpotCard({
    required this.spot,
    required this.mistakes,
    required this.onPractice,
    required this.onReread,
    required this.onAsk,
  });

  final _WeakSpot spot;
  final List<MistakeItem> mistakes;
  final VoidCallback onPractice;
  final VoidCallback? onReread;
  final VoidCallback? onAsk;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final (String label, Color tone) = switch (spot.severity) {
      'critical' => (context.tr('Needs focus', 'يحتاج تركيزاً'), AimColors.error500),
      'developing' => (context.tr('Getting there', 'في تحسّن'), const Color(0xFFE08A00)),
      _ => (context.tr('Just spotted', 'اكتُشف للتو'), surfaces.textMuted),
    };
    final pct = spot.mastery == null ? null : (spot.mastery! * 100).round().clamp(0, 100);

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    _prettify(spot.skillId),
                    style: AimTextStyles.bodyLg.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: AimSpacing.space8),
                Container(
                  padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text(
                    label,
                    style: AimTextStyles.caption.copyWith(color: tone, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            if (pct != null) ...[
              const SizedBox(height: AimSpacing.space12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: (pct < 3 ? 3 : pct) / 100,
                  minHeight: 8,
                  color: tone,
                  backgroundColor: surfaces.surfaceSunken,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                fill(context.tr('Mastery {pct}%', 'الإتقان {pct}%'), {'pct': pct}),
                style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              ),
            ] else
              const SizedBox(height: AimSpacing.space4),
            const SizedBox(height: AimSpacing.space4),
            Text(
              spot.detectedAt != null && spot.detectedAt!.length >= 10
                  ? fill(context.tr('Detected {date}', 'رُصدت {date}'), {'date': spot.detectedAt!.substring(0, 10)})
                  : context.tr('Your recent answers on this skill were low.', 'كانت إجاباتك الأخيرة في هذه المهارة ضعيفة.'),
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
            if (mistakes.isNotEmpty) ...[
              const SizedBox(height: AimSpacing.space12),
              Container(
                width: double.infinity,
                padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
                decoration: BoxDecoration(
                  color: surfaces.surfaceSunken,
                  borderRadius: BorderRadius.circular(AimRadius.md),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('Questions you missed', 'أسئلة أخطأت فيها'),
                      style: AimTextStyles.caption.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    for (final m in mistakes.take(2))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(m.prompt, style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary)),
                      ),
                    GestureDetector(
                      onTap: () => context.push(
                        '${AppRoutePaths.mistakes}?skill=${Uri.encodeQueryComponent(spot.skillId)}',
                      ),
                      child: Text(
                        mistakes.length > 2
                            ? fill(context.tr('See all {n} and fix them', 'اعرض الأسئلة الـ {n} وصحّحها'), {'n': mistakes.length})
                            : context.tr('Fix them', 'صحّحها'),
                        style: AimTextStyles.bodySm.copyWith(
                          color: AimColors.primary500,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: AimSpacing.space12),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: [
                AIMButton(
                  size: AIMButtonSize.small,
                  onPressed: onPractice,
                  child: Text(spot.lessonId != null
                      ? context.tr('Practice now', 'تدرّب الآن')
                      : context.tr('Find a lesson', 'ابحث عن درس')),
                ),
                if (onReread != null)
                  AIMButton(
                    size: AIMButtonSize.small,
                    variant: AIMButtonVariant.secondary,
                    onPressed: onReread,
                    child: Text(context.tr('Re-read the lesson', 'أعد قراءة الدرس')),
                  ),
                if (onAsk != null)
                  AIMButton(
                    size: AIMButtonSize.small,
                    variant: AIMButtonVariant.secondary,
                    onPressed: onAsk,
                    child: Text(context.tr('Ask AI Teacher', 'اسأل المعلم الذكي')),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
