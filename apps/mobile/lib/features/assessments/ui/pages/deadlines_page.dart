// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Deadlines" (31)
//   docs/design/ui-for-all-system-mobile/screenshots/light/31-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/31-screen.png
// Endpoint: GET /student/assessments/deadlines
// Widgets: AIMCard, AIMEmptyState, AIMFullScreenLoading, AIMFullScreenError
//
// P10-056: DeadlinesPage — displays upcoming, active, late, missed, and
// closed deadlines. All deadline grouping/status is backend-derived; Flutter
// never computes status. The only local work here is display formatting of
// real timestamps (month-name dates and a relative "in N days" label).
//
// TASK-24: restyled to match design screen 31 — gradient header (back +
// "Deadlines"), small-caps muted section labels with a colored dot, and
// simple tappable cards with the assessment title plus ONE friendly
// subtitle line per bucket.
//
// Deviations from the mockup (real-data-only rules):
// - The design's closed-item subtitle is "Submitted Jun 8". There is NO
//   submission date anywhere in this payload (StudentDeadlineItem carries
//   only opensAt/closesAt/extendedClosesAt/status), so "Closed <date>" is
//   shown instead — never fabricated.
// - Section-dot colors keep the app's established status palette
//   (active=success500, upcoming=info500, late=warning500, missed=error500,
//   closed=neutral500) rather than the mockup's dot palette — a deliberate
//   deviation to stay semantically consistent with the status colors used
//   across the assessments feature.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

/// Which backend-computed bucket a tile belongs to. Set by each
/// [_DeadlineSection] from the backend's own grouping — never derived
/// locally from dates.
enum _DeadlineKind { active, upcoming, late, missed, closed }

const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/// Formats a real backend ISO timestamp as a short month-name date
/// ('Jun 27'), including the year only when it differs from the current
/// year ('Jun 27, 2027'). Falls back to the raw string on parse failure —
/// never fabricates a date.
String _formatDate(String iso) {
  final date = DateTime.tryParse(iso);
  if (date == null) return iso;
  final local = date.toLocal();
  final base = '${_months[local.month - 1]} ${local.day}';
  return local.year == DateTime.now().year ? base : '$base, ${local.year}';
}

/// Display-only relative-day label for a real backend timestamp: 'today',
/// 'tomorrow', or 'in N days'. Returns null on parse failure or for
/// non-future dates (callers then fall back to the plain date). Mirrors the
/// relative-date tone of review_page.dart's `_dueDateLabel`; purely
/// presentational — bucket/status stays backend-computed.
String? _relativeDays(String iso) {
  final date = DateTime.tryParse(iso);
  if (date == null) return null;
  final now = DateTime.now();
  final local = date.toLocal();
  final startOfToday = DateTime(now.year, now.month, now.day);
  final startOfDate = DateTime(local.year, local.month, local.day);
  final dayDiff = startOfDate.difference(startOfToday).inDays;
  if (dayDiff == 0) return 'today';
  if (dayDiff == 1) return 'tomorrow';
  if (dayDiff > 1) return 'in $dayDiff days';
  return null;
}

class DeadlinesPage extends ConsumerStatefulWidget {
  const DeadlinesPage({super.key});

  @override
  ConsumerState<DeadlinesPage> createState() => _DeadlinesPageState();
}

class _DeadlinesPageState extends ConsumerState<DeadlinesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(deadlinesProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(deadlinesProvider.notifier).refresh(bearerToken: token);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(deadlinesProvider);

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _DeadlinesHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading deadlines',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => _DeadlinesContent(
                  deadlines: data,
                  onRefresh: _refresh,
                ),
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading deadlines',
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [AttemptPage]/[SubmitAttemptPage]'s
/// back-button/title pattern (design screen 31's top bar).
class _DeadlinesHeader extends StatelessWidget {
  const _DeadlinesHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Text(
                'Deadlines',
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Body content ────────────────────────────────────────────────────────────

class _DeadlinesContent extends StatelessWidget {
  const _DeadlinesContent({
    required this.deadlines,
    required this.onRefresh,
  });

  final StudentDeadlines deadlines;
  final Future<void> Function() onRefresh;

  bool get _isEmpty =>
      deadlines.active.isEmpty &&
      deadlines.upcoming.isEmpty &&
      deadlines.late.isEmpty &&
      deadlines.missed.isEmpty &&
      deadlines.closed.isEmpty;

  @override
  Widget build(BuildContext context) {
    if (_isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.event_available_outlined),
        title: 'No deadlines',
        subtitle: 'Your assessment deadlines will appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          if (deadlines.active.isNotEmpty)
            _DeadlineSection(
              title: 'Active',
              color: AimColors.success500,
              kind: _DeadlineKind.active,
              items: deadlines.active,
            ),
          if (deadlines.upcoming.isNotEmpty)
            _DeadlineSection(
              title: 'Upcoming',
              color: AimColors.info500,
              kind: _DeadlineKind.upcoming,
              items: deadlines.upcoming,
            ),
          if (deadlines.late.isNotEmpty)
            _DeadlineSection(
              title: 'Late',
              color: AimColors.warning500,
              kind: _DeadlineKind.late,
              items: deadlines.late,
            ),
          if (deadlines.missed.isNotEmpty)
            _DeadlineSection(
              title: 'Missed',
              color: AimColors.error500,
              kind: _DeadlineKind.missed,
              items: deadlines.missed,
            ),
          if (deadlines.closed.isNotEmpty)
            _DeadlineSection(
              title: 'Closed',
              color: AimColors.neutral500,
              kind: _DeadlineKind.closed,
              items: deadlines.closed,
            ),
        ],
      ),
    );
  }
}

class _DeadlineSection extends StatelessWidget {
  const _DeadlineSection({
    required this.title,
    required this.color,
    required this.kind,
    required this.items,
  });

  final String title;
  final Color color;
  final _DeadlineKind kind;
  final List<StudentDeadlineItem> items;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(
            bottom: AimSpacing.space8,
            top: AimSpacing.space8,
          ),
          child: Row(
            children: [
              Container(
                width: AimSpacing.space8,
                height: AimSpacing.space8,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              // Small-caps muted section label (design screen 31).
              Text(
                title.toUpperCase(),
                style: AimTextStyles.label.copyWith(
                  color: surfaces.textMuted,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
            child: _DeadlineTile(item: item, kind: kind),
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
      ],
    );
  }
}

class _DeadlineTile extends StatelessWidget {
  const _DeadlineTile({
    required this.item,
    required this.kind,
  });

  final StudentDeadlineItem item;
  final _DeadlineKind kind;

  /// One friendly subtitle line per backend bucket (design screen 31), all
  /// formatted from REAL timestamps — the bucket itself is never recomputed
  /// locally.
  String _subtitle() {
    switch (kind) {
      case _DeadlineKind.active:
        // "Due in 2 days · Jun 27"; on parse failure _relativeDays returns
        // null and only the (raw-string-fallback) date is shown.
        final relative = _relativeDays(item.closesAt);
        final date = _formatDate(item.closesAt);
        return relative != null ? 'Due $relative · $date' : 'Due $date';
      case _DeadlineKind.upcoming:
        return 'Opens ${_formatDate(item.opensAt)}';
      case _DeadlineKind.late:
        // extendedClosesAt is a real backend field (a granted extension,
        // previously dropped silently) — surface it when present.
        final extended = item.extendedClosesAt;
        return extended != null
            ? 'Extended to ${_formatDate(extended)}'
            : 'Was due ${_formatDate(item.closesAt)}';
      case _DeadlineKind.missed:
      case _DeadlineKind.closed:
        // The design's "Submitted <date>" for closed items cannot be shown —
        // no submission date exists in this payload (see file header). The
        // effective close (extension-aware) is shown instead.
        return 'Closed ${_formatDate(item.extendedClosesAt ?? item.closesAt)}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final subtitle = _subtitle();

    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: true,
      onTap: () => Navigator.of(context).pushNamed(
        AppRoutePaths.assessmentDetail,
        arguments: {
          'assessmentId': item.assessmentId,
          'assessmentTitle': item.assessmentTitle,
        },
      ),
      semanticLabel: '${item.assessmentTitle}, $subtitle',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.assessmentTitle,
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            subtitle,
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
