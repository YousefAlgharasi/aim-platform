import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/theme/theme.dart';
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

  String? _titleFor(String? courseId) {
    if (courseId == null) return null;
    for (final course in widget.courses) {
      if (course.courseId == courseId) return course.title;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final levelCode =
        PlacementMockData.cefrCodes[widget.result.estimatedLevel] ??
            widget.result.estimatedLevel.toUpperCase();
    final levelName =
        PlacementMockData.cefrDisplayNames[widget.result.estimatedLevel] ??
            widget.result.estimatedLevel;
    final recommendedTitle = _titleFor(widget.result.recommendedCourseId);

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
          Column(
            children: [
              Text(
                levelCode.isNotEmpty ? levelCode : 'B1',
                style: AimTextStyles.display.copyWith(
                  fontSize: 64,
                  fontWeight: AimFontWeights.extrabold,
                  color: AimColors.primary500,
                  height: 1,
                ),
              ),
              const SizedBox(height: AimSpacing.space4),
              Text(
                levelName.isNotEmpty ? levelName : 'intermediate',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space20),
          Text(
            'Great Job! 🎉',
            style: AimTextStyles.h2.copyWith(
              color: surfaces.textPrimary,
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'Strong listening and grammar skills detected. Start here for the best experience.',
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
                title: 'Start from zero (A1)',
                subtitle: 'Build your foundation from scratch.',
                icon: '🌱',
                isSelected: _startChoice == 'zero',
                onTap: () => setState(() => _startChoice = 'zero'),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              PlacementOptionCard(
                title: 'Start from level ($levelCode)',
                subtitle: 'Jump straight to advanced tracks',
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
            'Select your plan',
            style: AimTextStyles.title.copyWith(
              color: surfaces.textSecondary,
            ),
          ),
          const SizedBox(height: AimSpacing.space12),

          Column(
            children: [
              PlacementOptionCard(
                title: 'Free plan',
                subtitle: 'Standard lessons, daily limits',
                trailingValue: '0\$/mo',
                isSelected: _planChoice == 'free',
                onTap: () => setState(() => _planChoice = 'free'),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              PlacementOptionCard(
                title: 'AIM plus',
                subtitle: 'Unlimited AI tutor, advanced tracks',
                trailingValue: '12.99\$/mo',
                isSelected: _planChoice == 'plus',
                onTap: () => setState(() => _planChoice = 'plus'),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space32),

          PlacementPrimaryButton(
            label: 'Unlock My Course',
            onPressed: () {
              if (widget.result.recommendedCourseId != null) {
                context.push(
                  AppRoutePaths.courseChapters,
                  extra: {
                    'courseId': widget.result.recommendedCourseId,
                    'courseTitle': recommendedTitle ?? '',
                  },
                );
              } else {
                context.go(AppRoutePaths.home);
              }
            },
          ),
        ],
      ),
    );
  }
}
