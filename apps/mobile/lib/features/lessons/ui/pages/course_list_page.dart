// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Courses" (courseList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/06-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/06-screen.png
// Endpoint: GET /student/courses (level badge, lesson count, real
//   per-student progress — see services/backend-api/src/features/
//   student-courses)
// Widgets: AIMFullScreenLoading, AIMFullScreenError, AIMEmptyState,
//   AIMChip, AIMBadge, CourseListTile
//
// Phase 6 — P6-073
// CourseListPage — displays published courses, with real per-student
// progress, from the backend.
//
// Loads via [studentCoursesProvider] on first build. Tapping a course
// navigates to the chapter list (P6-074) passing the backend-supplied
// course ID.
//
// All card content — title, description, levelCode, lessonCount, percent,
// status — is backend-computed by GET /student/courses. Flutter never
// computes progress percentage or completion status locally. The header
// "Level" badge shows the levelCode of the student's most-advanced
// touched course (also real, derived from the same response) — hidden
// entirely if no course has a level yet.
//
// Security rules:
// - Flutter never computes status, sortOrder, progress percent, or lesson
//   counts.
// - Bearer token from authFlowProvider; never stored here.
// - courseId passed to next screen is always backend-supplied from the
//   StudentCourseModel; never constructed from user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Uses Directionality-aware Row/Column/ListView.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - CourseListTile chevron mirrors via Directionality.of(context).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/lessons_widgets.dart';

/// Published course list screen, enriched with real per-student progress.
///
/// Auto-loads on first build using the bearer token from [authFlowProvider].
/// Tapping a course navigates to the chapter list, passing the
/// backend-supplied [StudentCourseModel.courseId].
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

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(studentCoursesProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(studentCoursesProvider.notifier).refresh(bearerToken: token);
  }

  void _onCourseTap(StudentCourseModel course) {
    // Navigate to the chapter list, passing the backend-supplied courseId.
    // courseId is never constructed from user input.
    context.push(
      AppRoutePaths.courseChapters,
      extra: {'courseId': course.courseId, 'courseTitle': course.title},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(studentCoursesProvider);
    final loadingLabel =
        AppLocalizations.of(context).lessonsLoadingCoursesSemantic;

    return Scaffold(
      body: SafeArea(
        bottom: false,
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
              onRefresh: _refresh,
              onTap: _onCourseTap,
            ),
          AppAsyncIdle() => AIMFullScreenLoading(
              semanticLabel: loadingLabel,
            ),
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

enum _CourseFilter { all, inProgress, completed }

class _CourseListContent extends StatefulWidget {
  const _CourseListContent({
    required this.courses,
    required this.onRefresh,
    required this.onTap,
  });

  final List<StudentCourseModel> courses;
  final Future<void> Function() onRefresh;
  final void Function(StudentCourseModel) onTap;

  @override
  State<_CourseListContent> createState() => _CourseListContentState();
}

class _CourseListContentState extends State<_CourseListContent> {
  _CourseFilter _filter = _CourseFilter.all;

  bool _matchesFilter(StudentCourseModel course) {
    return switch (_filter) {
      _CourseFilter.all => true,
      _CourseFilter.inProgress =>
        course.status == StudentCourseStatus.inProgress,
      _CourseFilter.completed =>
        course.status == StudentCourseStatus.completed,
    };
  }

  /// Level badge for the most-advanced course the student has touched
  /// (in-progress or completed, latest by list order), falling back to the
  /// first course's level. Real data derived from the same response —
  /// never a fabricated "current student level" field.
  String? _headerLevel(List<StudentCourseModel> courses) {
    for (final course in courses.reversed) {
      if (course.status != StudentCourseStatus.notStarted &&
          course.levelCode != null) {
        return course.levelCode;
      }
    }
    return courses.isNotEmpty ? courses.first.levelCode : null;
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    if (widget.courses.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.menu_book_outlined),
        title: l10n.lessonsNoCoursesTitle,
        subtitle: l10n.lessonsNoCoursesSubtitle,
      );
    }

    final visibleCourses = widget.courses.where(_matchesFilter).toList();
    final headerLevel = _headerLevel(widget.courses);

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.componentGap,
        ),
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  l10n.lessonsCoursesPageTitle,
                  style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary),
                ),
              ),
              if (headerLevel != null)
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  dot: true,
                  child: Text(l10n.lessonsLevelBadge(headerLevel)),
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            l10n.lessonsCoursesSubtitle,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                AIMChip(
                  selected: _filter == _CourseFilter.all,
                  onPressed: () =>
                      setState(() => _filter = _CourseFilter.all),
                  child: Text(l10n.lessonsFilterAllCourses),
                ),
                const SizedBox(width: AimSpacing.innerGap),
                AIMChip(
                  selected: _filter == _CourseFilter.inProgress,
                  onPressed: () =>
                      setState(() => _filter = _CourseFilter.inProgress),
                  child: Text(l10n.lessonsInProgressLabel),
                ),
                const SizedBox(width: AimSpacing.innerGap),
                AIMChip(
                  selected: _filter == _CourseFilter.completed,
                  onPressed: () =>
                      setState(() => _filter = _CourseFilter.completed),
                  child: Text(l10n.lessonsCompletedLabel),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          if (visibleCourses.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: AimSpacing.sectionGap),
              child: Text(
                l10n.lessonsNoCoursesFilterMessage,
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                textAlign: TextAlign.center,
              ),
            )
          else
            for (var i = 0; i < visibleCourses.length; i++) ...[
              CourseListTile(
                model: visibleCourses[i],
                index: i,
                onTap: () => widget.onTap(visibleCourses[i]),
              ),
              const SizedBox(height: AimSpacing.listItemGap),
            ],
        ],
      ),
    );
  }
}
