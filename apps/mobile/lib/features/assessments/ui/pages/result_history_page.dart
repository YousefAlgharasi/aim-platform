// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Result history" (30)
//   docs/design/ui-for-all-system-mobile/screenshots/light/30-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/30-screen.png
// Endpoint: GET /student/assessments/:id/history
// Widgets: AIMCard, AIMBadge, AIMEmptyState, AIMFullScreenLoading,
//   AIMFullScreenError
//
// P10-063: Result history page — displays previous attempts/results
// for an assessment.
//
// TASK-24: restyled to match design screen 30 — gradient header (back +
// "Result history" with the real assessment title as subtitle), rows with a
// leading "#N" attempt-number circle, a bold percentage, a "Jun 24, 2026 ·
// 14:02" timestamp subtitle, and a soft Passed/Failed pill.
//
// Security rules:
// - All values are backend-supplied; Flutter never computes scores or
//   pass/fail status. The row's percentage is a guarded, display-only
//   derivation of two real backend values (score / maxScore) — when
//   maxScore is 0 the raw "score / maxScore" text is shown instead. The
//   backend remains the grading authority.
// - `latePenaltyApplied` is a real backend flag (previously dropped
//   silently); it is surfaced as a subtle amber warning icon.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:aim_mobile/core/formatting/score_percent.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:intl/intl.dart' hide TextDirection;

/// Display-only formatting of a real backend value: drops the trailing ".0"
/// when a points double is integral (e.g. "17" instead of "17.0").
/// (Same file-private helper as assessment_result_page.dart.)
String _fmtPts(double v) => v == v.roundToDouble() ? '${v.round()}' : '$v';

class ResultHistoryPage extends ConsumerStatefulWidget {
  const ResultHistoryPage({
    required this.assessmentId,
    required this.assessmentTitle,
    super.key,
  });

  final String assessmentId;
  final String assessmentTitle;

  @override
  ConsumerState<ResultHistoryPage> createState() => _ResultHistoryPageState();
}

class _ResultHistoryPageState extends ConsumerState<ResultHistoryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(resultHistoryProvider.notifier).load(
          bearerToken: token,
          assessmentId: widget.assessmentId,
        );
  }

  void _onItemTap(ResultHistoryItem item) {
    context.push(
      AppRoutePaths.assessmentResult,
      extra: {
        'attemptId': item.attemptId,
        'assessmentTitle': widget.assessmentTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(resultHistoryProvider);

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _HistoryHeader(assessmentTitle: widget.assessmentTitle),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => AIMFullScreenLoading(
                  semanticLabel: AppLocalizations.of(context)
                      .assessmentsLoadingResultHistorySemantic,
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => _ResultHistoryContent(
                  history: data,
                  onItemTap: _onItemTap,
                ),
              AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: AppLocalizations.of(context)
                      .assessmentsLoadingResultHistorySemantic,
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
/// back-button/title pattern. Shows the design's static "Result history"
/// label plus the REAL assessment title as a subtitle line, so the screen
/// still identifies which assessment the history belongs to.
class _HistoryHeader extends StatelessWidget {
  const _HistoryHeader({required this.assessmentTitle});

  final String assessmentTitle;

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
              label: AppLocalizations.of(context).commonBack,
              child: InkWell(
                onTap: () => context.pop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context).assessmentsResultHistoryTitle,
                    style:
                        AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    assessmentTitle,
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Body content ────────────────────────────────────────────────────────────

class _ResultHistoryContent extends StatelessWidget {
  const _ResultHistoryContent({
    required this.history,
    required this.onItemTap,
  });

  final ResultHistory history;
  final void Function(ResultHistoryItem) onItemTap;

  @override
  Widget build(BuildContext context) {
    if (history.results.isEmpty) {
      final loc = AppLocalizations.of(context);
      return AIMEmptyState(
        icon: const Icon(Icons.history_outlined),
        title: loc.assessmentsNoResultsTitle,
        subtitle: loc.assessmentsNoResultsSubtitle,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: history.results.length,
      separatorBuilder: (_, __) =>
          const SizedBox(height: AimSpacing.listItemGap),
      itemBuilder: (context, index) {
        final item = history.results[index];
        return _ResultHistoryTile(
          item: item,
          onTap: () => onItemTap(item),
        );
      },
    );
  }
}

class _ResultHistoryTile extends StatelessWidget {
  const _ResultHistoryTile({
    required this.item,
    required this.onTap,
  });

  final ResultHistoryItem item;
  final VoidCallback onTap;

  /// Formats a real backend ISO timestamp as e.g. "Jun 24, 2026 · 14:02"
  /// (design screen 30's row subtitle: month-name date, then 24-hour time).
  /// Falls back to the raw string on parse failure — never fabricates.
  String _formatDateTime(BuildContext context, String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final locale = Localizations.localeOf(context).toString();
      final datePart = DateFormat.yMMMd(locale).format(date);
      final hour = date.hour.toString().padLeft(2, '0');
      final minute = date.minute.toString().padLeft(2, '0');
      return '$datePart · $hour:$minute';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final loc = AppLocalizations.of(context);
    final passed = item.passed;

    // Display-only formatting of two backend-supplied values — NOT score
    // computation (the backend remains the grading authority). See
    // core/formatting/score_percent.dart. Guarded so a zero maxScore never
    // divides; in that case the raw score text is shown.
    final int? percentage = scorePercent(
      numerator: item.score,
      denominator: item.maxScore,
    );
    final scoreLabel = percentage != null
        ? '$percentage%'
        : '${_fmtPts(item.score)} / ${_fmtPts(item.maxScore)}';

    // Real timestamps only: prefer submittedAt, fall back to gradedAt when
    // the backend sent no submission time (gradedAt is non-nullable).
    final timestamp =
        _formatDateTime(context, item.submittedAt ?? item.gradedAt);

    return AIMCard(
      interactive: true,
      onTap: onTap,
      semanticLabel: loc.assessmentsAttemptResultSemantic(
        item.attemptNumber,
        scoreLabel,
        passed ? loc.assessmentsPassedWord : loc.assessmentsFailedWord,
        item.latePenaltyApplied ? loc.assessmentsLatePenaltySemanticSuffix : '',
      ),
      child: Row(
        children: [
          // Leading "#N" attempt-number circle (real attemptNumber) —
          // mirrors the number-circle treatment in
          // assessment_result_page.dart's _BreakdownCard.
          SizedBox.square(
            dimension: AimSizes.avatarMd,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '#${item.attemptNumber}',
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                ),
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  scoreLabel,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  timestamp,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.space8),
          // Real backend flag, previously dropped silently — kept subtle
          // (the design shows nothing for it).
          if (item.latePenaltyApplied) ...[
            Tooltip(
              message: loc.assessmentsLatePenaltyApplied,
              child: const Icon(
                Icons.warning_amber_rounded,
                size: AimSizes.iconSm,
                color: AimColors.warning500,
              ),
            ),
            const SizedBox(width: AimSpacing.space8),
          ],
          AIMBadge(
            tone: passed ? AIMBadgeTone.success : AIMBadgeTone.error,
            pill: true,
            child: Text(
              passed ? loc.assessmentsStatusPassed : loc.assessmentsStatusFailed,
            ),
          ),
        ],
      ),
    );
  }
}
