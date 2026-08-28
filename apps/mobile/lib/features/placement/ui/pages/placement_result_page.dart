import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../student_courses/data/models/student_course_model.dart';
import '../../../student_courses/logic/provider/student_courses_provider.dart';
import '../../data/models/placement_result_model.dart';
import '../../data/placement_mock_data.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_result_notifier.dart';
import '../widgets/placement_option_card.dart';
import '../widgets/placement_primary_button.dart';

class PlacementResultPage extends ConsumerStatefulWidget {
  const PlacementResultPage({
    super.key,
    required this.attemptId,
  });

  final String attemptId;

  @override
  ConsumerState<PlacementResultPage> createState() =>
      _PlacementResultPageState();
}

class _PlacementResultPageState extends ConsumerState<PlacementResultPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadResult());
  }

  void _loadResult() {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementResultProvider.notifier).loadResult(
          token,
          attemptId: widget.attemptId,
        );
    final coursesState = ref.read(studentCoursesProvider);
    if (coursesState is AppAsyncIdle && token.isNotEmpty) {
      ref.read(studentCoursesProvider.notifier).load(bearerToken: token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(placementResultProvider);
    final coursesState = ref.watch(studentCoursesProvider);
    final courses = coursesState is AppAsyncSuccess<List<StudentCourseModel>>
        ? coursesState.data
        : const <StudentCourseModel>[];
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: switch (state) {
            PlacementResultLoading() =>
              AIMFullScreenLoading(semanticLabel: l10n.placementResultLoadingSemantic),
            PlacementResultPending() => const _PendingBody(),
            PlacementResultIdle() ||
            PlacementResultError() ||
            PlacementResultReady() => _ResultBody(
                result: state is PlacementResultReady
                    ? state.result
                    : PlacementMockData.mockResult,
                courses: courses,
              ),
          },
        ),
      ),
    );
  }
}

class _PendingBody extends StatelessWidget {
  const _PendingBody();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: l10n.placementResultScoringSemantic,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: AimColors.primary500),
              const SizedBox(height: AimSpacing.sectionGap),
              Text(
                l10n.placementResultScoringTitle,
                style: AimTextStyles.title.copyWith(
                  color: surfaces.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.innerGap),
              Text(
                l10n.placementResultScoringSubtitle,
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ResultBody extends StatefulWidget {
  const _ResultBody({required this.result, required this.courses});

  final PlacementResultModel result;
  final List<StudentCourseModel> courses;

  @override
  State<_ResultBody> createState() => _ResultBodyState();
}

class _ResultBodyState extends State<_ResultBody> {
  String _startChoice = 'level';
  String _planChoice = 'plus';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final levelCode =
        PlacementMockData.cefrCodes[widget.result.estimatedLevel] ??
            widget.result.estimatedLevel.toUpperCase();
    final levelName =
        PlacementMockData.cefrDisplayNames[widget.result.estimatedLevel] ??
            widget.result.estimatedLevel;
    final displayCode = levelCode.isNotEmpty ? levelCode : 'B1';
    final displayName = levelName.isNotEmpty ? levelName : 'Intermediate';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space32,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // ── Gradient Level Badge with Glow ─────────────────────────────
          Stack(
            alignment: Alignment.center,
            clipBehavior: Clip.none,
            children: [
              // Glow blur behind the badge
              Positioned(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(36),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.30),
                        blurRadius: 24,
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                ),
              ),
              // Main badge
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  gradient: AimGradients.gzHero,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: const Color(0xFF818CF8).withValues(alpha: 0.30),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.primary500.withValues(alpha: 0.28),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      displayCode,
                      style: AimTextStyles.display.copyWith(
                        fontSize: 36,
                        fontWeight: AimFontWeights.extrabold,
                        color: AimColors.neutral0,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      Localizations.localeOf(context).languageCode == 'ar'
                          ? 'المستوى'
                          : 'Level',
                      style: AimTextStyles.caption.copyWith(
                        fontSize: 10,
                        fontWeight: AimFontWeights.bold,
                        color: AimColors.neutral0.withValues(alpha: 0.75),
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space20),

          // ── "Great Job! ✨" row ─────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                l10n.placementResultGreatJob,
                style: AimTextStyles.h2.copyWith(
                  color: surfaces.textPrimary,
                ),
              ),
              const SizedBox(width: AimSpacing.space4),
              const Icon(
                Icons.auto_awesome,
                size: 22,
                color: Color(0xFFF59E0B),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),

          // ── Track pill ────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.space12,
              vertical: AimSpacing.space4,
            ),
            decoration: BoxDecoration(
              color: AimColors.primary500.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              Localizations.localeOf(context).languageCode == 'ar'
                  ? 'مسار $displayName'
                  : '$displayName Track',
              style: AimTextStyles.caption.copyWith(
                color: AimColors.primary700,
                fontWeight: AimFontWeights.bold,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.space8),

          Text(
            l10n.placementResultDetectedSubtitle,
            textAlign: TextAlign.center,
            style: AimTextStyles.caption.copyWith(
              color: surfaces.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),

          // ── Start Choice Cards (Zero vs Level) ──────────────────────────
          Column(
            children: [
              PlacementOptionCard(
                title: l10n.placementResultStartFromZeroTitle,
                subtitle: l10n.placementResultStartFromZeroSubtitle,
                iconWidget: const Icon(
                  Icons.eco_rounded,
                  size: AimSizes.iconLg,
                  color: AimColors.primary500,
                ),
                isSelected: _startChoice == 'zero',
                onTap: () => setState(() => _startChoice = 'zero'),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              PlacementOptionCard(
                title: l10n.placementResultStartFromLevelTitle(levelCode),
                subtitle: l10n.placementResultStartFromLevelSubtitle,
                iconWidget: const Icon(
                  Icons.psychology_rounded,
                  size: AimSizes.iconLg,
                  color: AimColors.primary500,
                ),
                isSelected: _startChoice == 'level',
                onTap: () => setState(() => _startChoice = 'level'),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.sectionGap),

          Text(
            l10n.placementResultSelectPlan,
            style: AimTextStyles.title.copyWith(
              color: surfaces.textSecondary,
              fontSize: 12,
              fontWeight: AimFontWeights.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: AimSpacing.space12),

          Column(
            children: [
              PlacementOptionCard(
                title: l10n.placementResultFreePlan,
                subtitle: l10n.placementResultFreePlanSub,
                trailingValue: '\$0/mo',
                isSelected: _planChoice == 'free',
                onTap: () => setState(() => _planChoice = 'free'),
              ),
              const SizedBox(height: AimSpacing.space16),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  PlacementOptionCard(
                    title: l10n.placementResultPlusPlan,
                    subtitle: l10n.placementResultPlusPlanSub,
                    trailingValue: '\$12.99/mo',
                    isSelected: _planChoice == 'plus',
                    onTap: () => setState(() => _planChoice = 'plus'),
                  ),
                  Positioned(
                    top: -10,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF59E0B), Color(0xFFF97316)],
                        ),
                        borderRadius: BorderRadius.circular(100),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        Localizations.localeOf(context).languageCode == 'ar'
                            ? '7 أيام مجاناً'
                            : '7 DAYS FREE',
                        style: AimTextStyles.caption.copyWith(
                          fontSize: 9,
                          fontWeight: AimFontWeights.extrabold,
                          color: AimColors.neutral0,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space32),

          PlacementPrimaryButton(
            label: l10n.placementResultUnlockCourse,
            onPressed: () => context.go(AppRoutePaths.home),
          ),
        ],
      ),
    );
  }
}
