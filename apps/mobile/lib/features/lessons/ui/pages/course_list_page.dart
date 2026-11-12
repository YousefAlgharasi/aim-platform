// Phase 6 — P6-073
// CourseListPage — displays published courses, with real per-student progress.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/lessons_widgets.dart';

class CourseListPage extends ConsumerStatefulWidget {
  const CourseListPage({super.key});

  @override
  ConsumerState<CourseListPage> createState() => _CourseListPageState();
}

class _CourseListPageState extends ConsumerState<CourseListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  bool _idleLoadScheduled = false;

  /// The list can be reset underneath this screen (its provider recreated in
  /// the idle state); idle means "not asked yet", so ask instead of waiting.
  Widget _idleBody(String label) {
    if (!_idleLoadScheduled) {
      _idleLoadScheduled = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _idleLoadScheduled = false;
        if (mounted && ref.read(studentCoursesProvider) is AppAsyncIdle) _load();
      });
    }
    return AIMFullScreenLoading(semanticLabel: label);
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(studentCoursesProvider.notifier).load(bearerToken: token);
    ref.read(currentEnrollmentProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(studentCoursesProvider.notifier).refresh(bearerToken: token);
    await ref.read(currentEnrollmentProvider.notifier).load(bearerToken: token);
  }

  Future<void> _onCourseTap(StudentCourseModel course) async {
    final l10n = AppLocalizations.of(context);
    if (course.locked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.lessonsCourseLockedMessage)),
      );
      return;
    }

    if (course.needsPayment) {
      await context.push(
        AppRoutePaths.courseClaim,
        extra: {'courseId': course.courseId, 'courseTitle': course.title},
      );
      if (mounted) _refresh();
      return;
    }

    final currentEnrollment = ref.read(currentEnrollmentProvider).valueOrNull;
    final isCurrent = course.courseId == currentEnrollment?.courseId;

    if (!isCurrent) {
      final hasAnyEnrollment = currentEnrollment?.found == true;
      final message = hasAnyEnrollment
          ? l10n.lessonsSwitchCourseDialogMessage(
              currentEnrollment?.courseTitle ?? '',
              course.title,
            )
          : l10n.lessonsStartCourseDialogMessage(course.title);

      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: Text(l10n.lessonsStartCourseDialogTitle),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.lessonsStartCourseCancelButton),
            ),
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(l10n.lessonsStartCourseConfirmButton),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
      if (!mounted) return;

      final token = ref.read(authFlowProvider).accessToken;
      if (token == null || token.isEmpty) return;
      try {
        await ref.read(currentEnrollmentProvider.notifier).enroll(
              bearerToken: token,
              courseId: course.courseId,
            );
      } catch (_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.lessonsStartCourseFailedMessage)),
        );
        return;
      }
      if (!mounted) return;
    }

    context.push(
      AppRoutePaths.courseChapters,
      extra: {'courseId': course.courseId, 'courseTitle': course.title},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(studentCoursesProvider);
    final enrollmentState = ref.watch(currentEnrollmentProvider);
    final currentCourseId =
        enrollmentState.valueOrNull?.found == true ? enrollmentState.valueOrNull?.courseId : null;
    final loadingLabel = AppLocalizations.of(context).lessonsLoadingCoursesSemantic;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: SafeArea(
        child: switch (state) {
          AppAsyncLoading() => AIMFullScreenLoading(
              semanticLabel: loadingLabel,
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => _CourseListContent(
              courses: data,
              currentCourseId: currentCourseId,
              onRefresh: _refresh,
              onTap: _onCourseTap,
            ),
          AppAsyncIdle() => _idleBody(loadingLabel),
        },
      ),
    );
  }
}

enum _CourseFilter { all, inProgress, completed }

class _CourseListContent extends StatefulWidget {
  const _CourseListContent({
    required this.courses,
    required this.currentCourseId,
    required this.onRefresh,
    required this.onTap,
  });

  final List<StudentCourseModel> courses;
  final String? currentCourseId;
  final Future<void> Function() onRefresh;
  final Future<void> Function(StudentCourseModel) onTap;

  @override
  State<_CourseListContent> createState() => _CourseListContentState();
}

class _CourseListContentState extends State<_CourseListContent> {
  _CourseFilter _filter = _CourseFilter.all;

  bool _matchesFilter(StudentCourseModel course) {
    return switch (_filter) {
      _CourseFilter.all => true,
      _CourseFilter.inProgress => course.status == StudentCourseStatus.inProgress,
      _CourseFilter.completed => course.status == StudentCourseStatus.completed,
    };
  }

  String? _headerLevel(List<StudentCourseModel> courses) {
    for (final course in courses.reversed) {
      if (course.status != StudentCourseStatus.notStarted && course.levelCode != null) {
        return course.levelCode;
      }
    }
    return courses.isNotEmpty ? courses.first.levelCode : 'STARTER';
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    if (widget.courses.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.menu_book_outlined),
        title: l10n.lessonsNoCoursesTitle,
        subtitle: l10n.lessonsNoCoursesSubtitle,
      );
    }

    final visibleCourses = widget.courses.where(_matchesFilter).toList();
    final headerLevel = _headerLevel(widget.courses) ?? 'STARTER';

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // A main screen: the heading sits under the app frame's AIM bar
          // (logo, avatar and the light/dark switch live in the frame).
          PageTitleBar(
            title: l10n.lessonsCoursesPageTitle,
            action: headerLevel.isEmpty
                ? null
                : Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: colorScheme.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: colorScheme.primary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircleAvatar(radius: 3, backgroundColor: colorScheme.primary),
                        const SizedBox(width: 6),
                        Text(
                          l10n.lessonsLevelBadge(headerLevel),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),

          const SizedBox(height: 20),

          // Overview Hero Banner
          _buildHero(context, l10n),

          const SizedBox(height: 20),

          // Filter Segment Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
            children: [
              _buildFilterTab(l10n.lessonsFilterAllCourses, _CourseFilter.all, Icons.auto_stories_rounded),
              const SizedBox(width: 10),
              _buildFilterTab(l10n.lessonsInProgressLabel, _CourseFilter.inProgress, Icons.schedule_rounded),
              const SizedBox(width: 10),
              _buildFilterTab(l10n.lessonsCompletedLabel, _CourseFilter.completed, Icons.check_circle_outline_rounded),
            ],
          ),
          ),

          const SizedBox(height: 20),

          // Courses List Tiles
          if (visibleCourses.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 40),
              child: Center(
                child: Text(
                  l10n.lessonsNoCoursesFilterMessage,
                  style: TextStyle(fontSize: 14, color: surfaces.textSecondary),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else ...[
            for (var i = 0; i < visibleCourses.length; i++)
              CourseListTile(
                model: visibleCourses[i],
                index: i,
                isCurrentEnrollment: widget.currentCourseId == visibleCourses[i].courseId,
                onTap: () => widget.onTap(visibleCourses[i]),
              ),

            // Prototype "NEXT UP · LOCKED COURSE" Card
            if (widget.courses.any((c) => c.locked)) ...[
              const SizedBox(height: 8),
              Builder(
                builder: (context) {
                  final lockedCourse = widget.courses.firstWhere((c) => c.locked);
                  final activeCourse = widget.courses.firstWhere((c) => !c.locked, orElse: () => widget.courses.first);

                  return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: surfaces.surfaceSunken.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: surfaces.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.lock_outline_rounded,
                              size: 16,
                              color: surfaces.textMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              l10n.lessonsNextUpLockedCourse,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: surfaces.textMuted,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          lockedCourse.title,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: surfaces.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          l10n.lessonsUnlockNextCourseCondition(activeCourse.title),
                          style: TextStyle(
                            fontSize: 13,
                            color: surfaces.textSecondary,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ],

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  /// The course the hero button opens: the current one, else the first
  /// unlocked course that is not finished.
  StudentCourseModel? _startCourse() {
    for (final c in widget.courses) {
      if (c.courseId == widget.currentCourseId && !c.locked) return c;
    }
    for (final c in widget.courses) {
      if (!c.locked && c.status != StudentCourseStatus.completed) return c;
    }
    return null;
  }

  Widget _buildHero(BuildContext context, AppLocalizations l10n) {
    final start = _startCourse();
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: AlignmentDirectional.topStart,
          end: AlignmentDirectional.bottomEnd,
          colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6), Color(0xFF60A5FA)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500.withValues(alpha: 0.30),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          PositionedDirectional(
            end: -24,
            top: -24,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.10),
              ),
            ),
          ),
          PositionedDirectional(
            end: 18,
            bottom: 14,
            child: Icon(
              Icons.school_rounded,
              size: 56,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.route_rounded, size: 13, color: Colors.white),
                      const SizedBox(width: 5),
                      Text(
                        l10n.lessonsLearningPathHeader,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.lessonsStructuredCurriculumHeader,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsetsDirectional.only(end: 70),
                  child: Text(
                    l10n.lessonsPersonalizedSequenceSubtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.92),
                      height: 1.3,
                    ),
                  ),
                ),
                if (start != null) ...[
                  const SizedBox(height: 12),
                  Material(
                    color: Colors.white,
                    shape: const StadiumBorder(),
                    child: InkWell(
                      customBorder: const StadiumBorder(),
                      onTap: () => widget.onTap(start),
                      child: Padding(
                        padding: const EdgeInsetsDirectional.fromSTEB(18, 8, 12, 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              l10n.lessonsStartLearningNow,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: AimColors.primary500,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Icon(
                              rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                              size: 20,
                              color: AimColors.primary500,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String label, _CourseFilter filter, IconData icon) {
    final isSelected = _filter == filter;
    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);
    final fg = isSelected ? Colors.white : surfaces.textSecondary;
    return Padding(
      padding: const EdgeInsetsDirectional.only(end: 10),
      child: InkWell(
        onTap: () => setState(() => _filter = filter),
        borderRadius: BorderRadius.circular(24),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? colorScheme.primary : surfaces.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isSelected ? colorScheme.primary : surfaces.border,
            ),
            boxShadow: [
              BoxShadow(
                color: colorScheme.primary.withValues(alpha: isSelected ? 0.28 : 0.06),
                blurRadius: isSelected ? 12 : 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18, color: fg),
              const SizedBox(width: 7),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  color: fg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
