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
import '../../reviews/ui/due_review_actions.dart';
import '../../reviews/ui/widgets/due_review_tile.dart';
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

/// Group labels for the 6 main skills. Pronunciation and functional language
/// sit under speaking (the server decides; this is only the fallback).
const _groupSegments = {
  'gra': 'grammar', 'grammar': 'grammar',
  'voc': 'vocabulary', 'vocabulary': 'vocabulary',
  'read': 'reading', 'reading': 'reading',
  'lis': 'listening', 'listening': 'listening',
  'write': 'writing', 'writing': 'writing',
  'spe': 'speaking', 'speaking': 'speaking',
  'pho': 'speaking', 'pronunciation': 'speaking',
  'func': 'speaking', 'functional_language': 'speaking',
};

/// The main skill a weak skill belongs to: the server's mapping when we have
/// it, otherwise read from the skill key ("en.a2.gra.comparatives" -> grammar).
String recoveryGroupOf(String skillId, Map<String, RecoverySkill> recovery) {
  final mapped = recovery[skillId]?.group;
  if (mapped != null) return mapped;
  for (final seg in skillId.toLowerCase().split('.')) {
    final g = _groupSegments[seg];
    if (g != null) return g;
  }
  return 'vocabulary';
}

class _GroupLook {
  const _GroupLook(this.icon, this.tone);
  final IconData icon;
  final Color tone;
}

const _groupLooks = {
  'grammar': _GroupLook(Icons.spellcheck_rounded, AimColors.primary500),
  'vocabulary': _GroupLook(Icons.translate_rounded, AimColors.success500),
  'reading': _GroupLook(Icons.menu_book_rounded, Color(0xFFF59E0B)),
  'listening': _GroupLook(Icons.headphones_rounded, Color(0xFF7C5CF0)),
  'writing': _GroupLook(Icons.edit_rounded, Color(0xFF0EA5E9)),
  'speaking': _GroupLook(Icons.mic_rounded, Color(0xFFEC4899)),
};

String _groupLabel(BuildContext context, String group) => switch (group) {
      'grammar' => context.tr('Grammar', 'القواعد'),
      'vocabulary' => context.tr('Vocabulary', 'المفردات'),
      'reading' => context.tr('Reading', 'القراءة'),
      'listening' => context.tr('Listening', 'الاستماع'),
      'writing' => context.tr('Writing', 'الكتابة'),
      _ => context.tr('Speaking', 'المحادثة'),
    };

class _GroupStat {
  const _GroupStat({required this.group, required this.count, required this.ready, this.avg});
  final String group;
  final int count;
  final int ready;
  final double? avg;
}

/// Improve — where the student is weak and how to fix it.
/// Mirrors the web app's "Improve" page.
class ImprovePage extends ConsumerStatefulWidget {
  const ImprovePage({super.key});

  @override
  ConsumerState<ImprovePage> createState() => _ImprovePageState();
}

class _ImprovePageState extends ConsumerState<ImprovePage> {
  bool _showAll = false;
  String? _group;

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
    ref.invalidate(dueReviewsProvider);
    ref.invalidate(recoveryProvider);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aimResultsProvider);
    return Scaffold(
      body: Column(
        children: [
          // A main screen: the heading sits under the app frame's AIM bar.
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.space16,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: PageTitleBar(title: context.tr('Improve', 'تحسين')),
          ),
          Expanded(
            child: SafeArea(
              top: false,
              child: switch (state) {
                AppAsyncFailure(:final message) => AIMFullScreenError(message: message, onRetry: _load),
                AppAsyncSuccess(:final data) => _content(context, data),
                _ => AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل')),
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _content(BuildContext context, AimResultsData data) {
    final surfaces = aimSurfacesOf(context);
    final mistakes = ref.watch(mistakesProvider(null)).valueOrNull;
    final titles = ref.watch(skillTitlesProvider).valueOrNull ?? const <String, String>{};
    final allSpots = _buildWeakSpots(data);
    final recovery = {
      for (final r in ref.watch(recoveryProvider).valueOrNull ?? const <RecoverySkill>[]) r.skillKey: r,
    };
    final groupStats = [
      for (final g in recoveryGroups)
        () {
          final inGroup = allSpots.where((sp) => recoveryGroupOf(sp.skillId, recovery) == g).toList();
          final scored = inGroup.where((sp) => sp.mastery != null).toList();
          return _GroupStat(
            group: g,
            count: inGroup.length,
            avg: scored.isEmpty ? null : scored.fold<double>(0, (n, sp) => n + sp.mastery!) / scored.length,
            ready: inGroup.where((sp) {
              final r = recovery[sp.skillId];
              return r != null && r.unlocked && r.openMistakes > 0;
            }).length,
          );
        }(),
    ];
    final spots = _group == null
        ? allSpots
        : allSpots.where((sp) => recoveryGroupOf(sp.skillId, recovery) == _group).toList();
    final fixed = data.weaknessRecords.where((w) => w.status.toLowerCase() == 'resolved').toList();
    // Due reviews for weak skills only, straight from the backend.
    final dueReviews = ref.watch(dueReviewsProvider).valueOrNull ?? const <DueReview>[];
    final top = allSpots.isEmpty ? null : allSpots.first;
    final mistakeCount = mistakes?.total ?? 0;

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          _Hero(
            top: top,
            topName: top == null ? '' : skillName(titles, top.skillId),
            toWorkOn: allSpots.length,
            onPractice: () => top?.lessonId != null
                ? _practice(top!.lessonId!)
                : _findLesson(),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          _StatGrid(
            tiles: [
              _StatTile(
                icon: Icons.track_changes_rounded,
                tone: AimColors.primary500,
                value: '${allSpots.length}',
                label: context.tr('To work on', 'تحتاج عملاً'),
                onTap: allSpots.length > 3 ? () => setState(() => _showAll = true) : null,
              ),
              _StatTile(
                icon: Icons.refresh_rounded,
                tone: AimColors.success500,
                value: mistakes?.total.toString() ?? '—',
                label: context.tr('Mistakes to retry', 'أخطاء لإعادتها'),
                onTap: () => context.push(AppRoutePaths.mistakes),
              ),
              _StatTile(
                icon: Icons.calendar_month_rounded,
                tone: const Color(0xFFF59E0B),
                value: ref.watch(dueReviewsProvider).hasValue ? '${dueReviews.length}' : '—',
                label: context.tr('Reviews due', 'مراجعات مستحقة'),
                onTap: () => context.push(AppRoutePaths.reviewSchedule),
              ),
              _StatTile(
                icon: Icons.check_circle_rounded,
                tone: const Color(0xFF7C5CF0),
                value: '${fixed.length}',
                label: context.tr('Already fixed', 'تم إصلاحها'),
              ),
            ],
          ),
          if (mistakeCount > 0 || dueReviews.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            _FixSessionCard(
              hasMistakes: mistakeCount > 0,
              onTap: () => context.push('${AppRoutePaths.mistakes}?quick=1'),
            ),
          ],
          if (allSpots.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            _GroupGrid(
              stats: groupStats,
              selected: _group,
              onSelect: (g) => setState(() {
                _group = _group == g ? null : g;
                _showAll = false;
              }),
            ),
          ],
          const SizedBox(height: AimSpacing.sectionGap),
          Row(
            children: [
              const Icon(Icons.track_changes_rounded, size: 22, color: AimColors.primary500),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.tr('Weak spots', 'نقاط الضعف'),
                  style: AimTextStyles.h3.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              if (spots.length > 3 && _group == null)
                TextButton(
                  onPressed: () => setState(() => _showAll = !_showAll),
                  child: Text(_showAll
                      ? context.tr('Show less', 'عرض أقل')
                      : context.tr('See all', 'عرض الكل')),
                ),
            ],
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
            for (final s in (_showAll || _group != null ? spots : spots.take(3))) ...[
              _SpotCard(
                spot: s,
                title: skillName(titles, s.skillId),
                mistakes: (mistakes?.items ?? const [])
                    .where((m) => m.skillIds.contains(s.skillId))
                    .toList(),
                recovery: recovery[s.skillId],
                onRetry: () => context.push(
                  '${AppRoutePaths.recoveryRetry}?skill=${Uri.encodeQueryComponent(s.skillId)}',
                ),
                onPractice: s.lessonId == null ? _findLesson : () => _practice(s.lessonId!),
                onReread: s.lessonId == null ? null : () => _reread(s.lessonId!),
                onAsk: s.lessonId == null ? null : () => _askTeacher(s.lessonId!, skillName(titles, s.skillId)),
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
            for (final r in dueReviews.take(4)) ...[
              DueReviewTile(
                name: dueReviewName(r, titles),
                dueAt: r.dueAt,
                severity: r.severity,
                onTap: () => openDueReview(context, ref, r),
              ),
              const SizedBox(height: AimSpacing.componentGap),
            ],
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
                    label: Text(skillName(titles, w.skillId)),
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
    required this.topName,
    required this.toWorkOn,
    required this.onPractice,
  });

  final _WeakSpot? top;
  final String topName;
  final int toWorkOn;
  final VoidCallback onPractice;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final chevron = rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded;
    return Container(
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (top != null) ...[
                      Container(
                        padding: const EdgeInsetsDirectional.symmetric(
                            horizontal: 10, vertical: 4),
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
                                context.tr('Start with this', 'ابدأ بهذا'),
                                style: AimTextStyles.caption.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space8),
                      Text(
                        topName,
                        style: AimTextStyles.h2.copyWith(color: Colors.white),
                      ),
                    ] else
                      Text(
                        context.tr(
                          'No weak spots right now. Keep learning to stay sharp.',
                          'لا توجد نقاط ضعف حالياً. واصل التعلم لتبقى متميزاً.',
                        ),
                        style: AimTextStyles.bodyLg
                            .copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Icon(Icons.menu_book_rounded,
                  size: 44, color: Colors.white.withValues(alpha: 0.85)),
            ],
          ),
          const SizedBox(height: AimSpacing.space12),
          Material(
            color: Colors.white,
            shape: const StadiumBorder(),
            child: InkWell(
              customBorder: const StadiumBorder(),
              onTap: onPractice,
              child: Padding(
                padding: const EdgeInsetsDirectional.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.search_rounded, color: AimColors.primary500),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        top?.lessonId != null
                            ? context.tr('Practice now', 'تدرّب الآن')
                            : context.tr('Find a lesson', 'ابحث عن درس'),
                        textAlign: TextAlign.center,
                        style: AimTextStyles.bodyMd.copyWith(
                          color: AimColors.primary500,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    Icon(chevron, color: AimColors.primary500),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A tinted stat tile with a round icon, a number and a label.
/// The four figures in an equal 2x2 grid: every tile has exactly the same
/// width and height, with the same gap across and down. The height is fixed
/// (and grows only with the user's text size), so numbers with more digits or
/// labels that wrap never make one tile bigger than the others.
class _StatGrid extends StatelessWidget {
  const _StatGrid({required this.tiles});

  final List<Widget> tiles;

  static const double _baseHeight = 76;
  static const double _gap = AimSpacing.componentGap;

  @override
  Widget build(BuildContext context) {
    final scale = MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 2.0);
    final height = _baseHeight * scale;
    Widget row(Widget a, Widget b) => SizedBox(
          height: height,
          child: Row(
            children: [
              Expanded(child: a),
              const SizedBox(width: _gap),
              Expanded(child: b),
            ],
          ),
        );
    return Column(
      children: [
        row(tiles[0], tiles[1]),
        const SizedBox(height: _gap),
        row(tiles[2], tiles[3]),
      ],
    );
  }
}

/// A tinted stat tile with a round icon, a number and a label. It fills
/// whatever size its grid cell gives it; the arrow slot is always reserved so
/// labels wrap at the same width in every tile.
class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.tone,
    required this.value,
    required this.label,
    this.onTap,
  });

  final IconData icon;
  final Color tone;
  final String value;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final radius = BorderRadius.circular(AimRadius.lg);
    return Semantics(
      button: onTap != null,
      label: '$value $label',
      child: Material(
        color: Color.alphaBlend(tone.withValues(alpha: dark ? 0.14 : 0.08), surfaces.surface),
        shape: RoundedRectangleBorder(
          borderRadius: radius,
          side: BorderSide(color: tone.withValues(alpha: dark ? 0.30 : 0.22)),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: dark ? 0.25 : 0.16),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 22, color: tone),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        value,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.h3.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        label,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 20,
                  child: onTap == null
                      ? null
                      : Icon(
                          rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                          size: 20,
                          color: surfaces.textMuted,
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// "5-minute fix session": a short call to action with a Start pill.
class _FixSessionCard extends StatelessWidget {
  const _FixSessionCard({required this.hasMistakes, required this.onTap});

  final bool hasMistakes;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      button: true,
      label: context.tr('5-minute fix session', 'جلسة إصلاح لخمس دقائق'),
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
                  color: AimColors.primary500.withValues(alpha: dark ? 0.16 : 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, size: 36, color: AimColors.primary500),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.tr('5-minute fix session', 'جلسة إصلاح لخمس دقائق'),
                        style: AimTextStyles.bodyLg.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        hasMistakes
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
                Container(
                  padding: const EdgeInsetsDirectional.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
                    ),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        context.tr('Start', 'ابدأ'),
                        style: AimTextStyles.bodyMd.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.play_circle_fill_rounded, size: 18, color: Colors.white),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// One weak spot: a compact row (icon, name, status, mastery bar) that opens
/// to show what was missed and the ways to fix it.
class _SpotCard extends StatefulWidget {
  const _SpotCard({
    required this.spot,
    required this.title,
    required this.mistakes,
    required this.onPractice,
    required this.onReread,
    required this.onAsk,
    required this.onRetry,
    this.recovery,
  });

  final RecoverySkill? recovery;
  final VoidCallback onRetry;
  final _WeakSpot spot;
  final String title;
  final List<MistakeItem> mistakes;
  final VoidCallback onPractice;
  final VoidCallback? onReread;
  final VoidCallback? onAsk;

  @override
  State<_SpotCard> createState() => _SpotCardState();
}

class _SpotCardState extends State<_SpotCard> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final spot = widget.spot;
    final mistakes = widget.mistakes;
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final (String label, Color tone) = switch (spot.severity) {
      'critical' => (context.tr('Needs focus', 'يحتاج تركيزاً'), AimColors.error500),
      'developing' => (context.tr('Getting there', 'في تحسّن'), const Color(0xFFE08A00)),
      _ => (context.tr('Just spotted', 'اكتُشف للتو'), surfaces.textMuted),
    };
    final pct = spot.mastery == null ? null : (spot.mastery! * 100).round().clamp(0, 100);
    final title = widget.title;

    return Container(
      decoration: BoxDecoration(
        color: surfaces.surface,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Semantics(
            button: true,
            expanded: _open,
            label: title,
            child: InkWell(
              borderRadius: BorderRadius.circular(AimRadius.lg),
              onTap: () => setState(() => _open = !_open),
              child: Padding(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AimColors.primary500.withValues(alpha: dark ? 0.22 : 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.menu_book_rounded,
                          size: 24, color: AimColors.primary500),
                    ),
                    const SizedBox(width: AimSpacing.space12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  title,
                                  style: AimTextStyles.bodyLg.copyWith(
                                    color: surfaces.textPrimary,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              const SizedBox(width: AimSpacing.space8),
                              Container(
                                padding: const EdgeInsetsDirectional.symmetric(
                                    horizontal: 10, vertical: 3),
                                decoration: BoxDecoration(
                                  color: tone.withValues(alpha: 0.14),
                                  borderRadius: BorderRadius.circular(100),
                                ),
                                child: Text(
                                  label,
                                  style: AimTextStyles.caption
                                      .copyWith(color: tone, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                          if (pct != null) ...[
                            const SizedBox(height: AimSpacing.space8),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: LinearProgressIndicator(
                                      value: (pct < 3 ? 3 : pct) / 100,
                                      minHeight: 8,
                                      color: AimColors.primary500,
                                      backgroundColor: surfaces.surfaceSunken,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  '$pct%',
                                  textDirection: TextDirection.ltr,
                                  style: AimTextStyles.bodySm.copyWith(
                                    color: surfaces.textPrimary,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      _open ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                      color: surfaces.textMuted,
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_open)
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                  AimSpacing.space12, 0, AimSpacing.space12, AimSpacing.space12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    spot.detectedAt != null && spot.detectedAt!.length >= 10
                        ? fill(context.tr('Detected {date}', 'رُصدت {date}'),
                            {'date': spot.detectedAt!.substring(0, 10)})
                        : context.tr('Your recent answers on this skill were low.',
                            'كانت إجاباتك الأخيرة في هذه المهارة ضعيفة.'),
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
                              child: Text(m.prompt,
                                  style: AimTextStyles.bodySm
                                      .copyWith(color: surfaces.textSecondary)),
                            ),
                          if (widget.recovery == null)
                          GestureDetector(
                            onTap: () => context.push(
                              '${AppRoutePaths.mistakes}?skill=${Uri.encodeQueryComponent(spot.skillId)}',
                            ),
                            child: Text(
                              mistakes.length > 2
                                  ? fill(
                                      context.tr('See all {n} and fix them',
                                          'اعرض الأسئلة الـ {n} وصحّحها'),
                                      {'n': mistakes.length})
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
                  if (widget.recovery != null && widget.recovery!.openMistakes > 0) ...[
                    const SizedBox(height: AimSpacing.space12),
                    _RecoverySteps(recovery: widget.recovery!, onRetry: widget.onRetry),
                  ],
                  const SizedBox(height: AimSpacing.space12),
                  Wrap(
                    spacing: AimSpacing.space8,
                    runSpacing: AimSpacing.space8,
                    children: [
                      AIMButton(
                        size: AIMButtonSize.small,
                        onPressed: widget.onPractice,
                        child: Text(spot.lessonId != null
                            ? context.tr('Practice now', 'تدرّب الآن')
                            : context.tr('Find a lesson', 'ابحث عن درس')),
                      ),
                      if (widget.onReread != null)
                        AIMButton(
                          size: AIMButtonSize.small,
                          variant: AIMButtonVariant.secondary,
                          onPressed: widget.onReread,
                          child: Text(context.tr('Re-read the lesson', 'أعد قراءة الدرس')),
                        ),
                      if (widget.onAsk != null)
                        AIMButton(
                          size: AIMButtonSize.small,
                          variant: AIMButtonVariant.secondary,
                          onPressed: widget.onAsk,
                          child: Text(context.tr('Ask AI Teacher', 'اسأل المعلم الذكي')),
                        ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// The three recovery steps for one weak skill: Learn, wait for the server's
/// 3-day gap, then Retry. The server decides when the retry unlocks.
class _RecoverySteps extends StatelessWidget {
  const _RecoverySteps({required this.recovery, required this.onRetry});

  final RecoverySkill recovery;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final unlocked = recovery.unlocked;

    Widget step(String text, Color tone, {bool on = true}) => Container(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: on ? tone.withValues(alpha: 0.14) : surfaces.surface,
            borderRadius: BorderRadius.circular(100),
          ),
          child: Text(
            text,
            style: AimTextStyles.caption.copyWith(
              color: on ? tone : surfaces.textMuted,
              fontWeight: FontWeight.w700,
            ),
          ),
        );

    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: BorderRadius.circular(AimRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: AimSpacing.space8,
            runSpacing: AimSpacing.space8,
            children: [
              step('1 · ${context.tr('Learn', 'تعلّم')}', AimColors.primary500),
              step(
                unlocked
                    ? '2 · ✓ ${context.tr('Ready', 'جاهز')}'
                    : '2 · ${context.tr('Wait', 'انتظر')}',
                unlocked ? AimColors.success500 : surfaces.textMuted,
                on: unlocked,
              ),
              step('3 · ${context.tr('Retry', 'أعد المحاولة')}', AimColors.primary500, on: unlocked),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          if (unlocked)
            AIMButton(
              size: AIMButtonSize.small,
              onPressed: onRetry,
              child: Text(context.tr('Retry now', 'أعد المحاولة الآن')),
            )
          else
            Text(
              fill(
                context.tr(
                  'Retry opens in {n} days. Spacing it out helps you remember. Learn it with the AI Teacher in the meantime.',
                  'تفتح إعادة المحاولة بعد {n} أيام. التباعد يساعدك على التذكّر. تعلّمها مع المعلم الذكي في هذه الأثناء.',
                ),
                {'n': recovery.daysLeft()},
              ),
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
        ],
      ),
    );
  }
}

/// The 6 main skills as an equal 2-column grid. Tapping one filters the weak
/// spots below to that skill group; tapping it again clears the filter.
class _GroupGrid extends StatelessWidget {
  const _GroupGrid({required this.stats, required this.selected, required this.onSelect});

  final List<_GroupStat> stats;
  final String? selected;
  final ValueChanged<String> onSelect;

  static const double _baseHeight = 96;

  @override
  Widget build(BuildContext context) {
    final scale = MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 2.0);
    final height = _baseHeight * scale;
    Widget tile(_GroupStat g) => _GroupTile(
          stat: g,
          selected: selected == g.group,
          onTap: g.count == 0 ? null : () => onSelect(g.group),
        );
    return Column(
      children: [
        for (var i = 0; i < stats.length; i += 2) ...[
          if (i > 0) const SizedBox(height: AimSpacing.componentGap),
          SizedBox(
            height: height,
            child: Row(
              children: [
                Expanded(child: tile(stats[i])),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(child: i + 1 < stats.length ? tile(stats[i + 1]) : const SizedBox.shrink()),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _GroupTile extends StatelessWidget {
  const _GroupTile({required this.stat, required this.selected, required this.onTap});

  final _GroupStat stat;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final look = _groupLooks[stat.group]!;
    final label = _groupLabel(context, stat.group);
    final pct = stat.avg == null ? null : (stat.avg! * 100).round().clamp(0, 100);
    final detail = stat.count == 0
        ? context.tr('All good', 'كل شيء جيد')
        : [
            fill(context.tr('{n} to work on', '{n} للعمل عليها'), {'n': stat.count}),
            if (pct != null) '$pct%',
          ].join(' · ');
    return Semantics(
      button: onTap != null,
      selected: selected,
      label: '$label, $detail',
      child: Opacity(
        opacity: stat.count == 0 ? 0.6 : 1,
        child: Material(
          color: Color.alphaBlend(
            look.tone.withValues(alpha: selected ? (dark ? 0.26 : 0.16) : (dark ? 0.14 : 0.08)),
            surfaces.surface,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AimRadius.lg),
            side: BorderSide(
              color: look.tone.withValues(alpha: selected ? 0.9 : (dark ? 0.30 : 0.22)),
              width: selected ? 1.5 : 1,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 8),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: look.tone.withValues(alpha: dark ? 0.25 : 0.16),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(look.icon, size: 20, color: look.tone),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AimTextStyles.bodyMd.copyWith(
                            color: surfaces.textPrimary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          detail,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                        ),
                        if (stat.ready > 0)
                          Text(
                            fill(context.tr('{n} ready to retry', '{n} جاهزة لإعادة المحاولة'), {'n': stat.ready}),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AimTextStyles.caption.copyWith(
                              color: AimColors.success500,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
