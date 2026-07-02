// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Courses" (courseList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/06-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/06-screen.png
// Endpoint: GET /curriculum/courses (CourseModel fields only)
// Widgets: AIMTopAppBar, AIMFullScreenLoading, AIMFullScreenError,
//   AIMEmptyState, CourseListTile
//
// Phase 6 — P6-073
// CourseListPage — displays published courses from the backend.
//
// Loads via [coursesProvider] on first build. Tapping a course navigates
// to the chapter list (P6-074) passing the backend-supplied course ID.
//
// NOTE — header level badge / filter chips / per-course progress:
// the design shows a header-level student level badge ("Level B1"), filter
// chips ("All courses"/"In progress"/"Completed"), and rich per-course
// cards (level badge, progress bar, lesson count, status chip). None of
// those have a backing field on the backend's CourseModel (no level, no
// per-student progress, no lesson count, no completion flag — see
// services/backend-api/src/features/curriculum/courses). Per product
// direction they render clearly-marked mock values ([MockCourseProgress]
// per row, [_kMockStudentLevel] in the header) so the screen matches the
// design pixel-for-pixel; the filter chips filter against the same mocked
// statuses. Swap for real fields once the backend exposes them. Course
// title and description remain 100% backend-real.
//
// Security rules:
// - Flutter never computes status, sortOrder, or difficulty.
// - Bearer token from authFlowProvider; never stored here.
// - courseId passed to next screen is always backend-supplied from the
//   CourseModel; never constructed from user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Uses Directionality-aware Row/Column/ListView.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - CourseListTile chevron mirrors via Directionality.of(context).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

/// Published course list screen.
///
/// Auto-loads on first build using the bearer token from [authFlowProvider].
/// Tapping a course navigates to the chapter list, passing the
/// backend-supplied [CourseModel.id].
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
    ref.read(coursesProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(coursesProvider.notifier).refresh(bearerToken: token);
  }

  void _onCourseTap(CourseModel course) {
    // Navigate to the chapter list, passing the backend-supplied course.id.
    // courseId is never constructed from user input.
    Navigator.of(context).pushNamed(
      AppRoutePaths.courseChapters,
      arguments: {'courseId': course.id, 'courseTitle': course.title},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(coursesProvider);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: switch (state) {
          AppAsyncLoading() => const AIMFullScreenLoading(
              semanticLabel: 'Loading courses',
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
          AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Loading courses',
            ),
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

/// Mocked header level badge — see file-level NOTE. No endpoint exposes the
/// student's CEFR level on this screen.
const String _kMockStudentLevel = 'Level B1';

enum _CourseFilter { all, inProgress, completed }

class _CourseListContent extends StatefulWidget {
  const _CourseListContent({
    required this.courses,
    required this.onRefresh,
    required this.onTap,
  });

  final List<CourseModel> courses;
  final Future<void> Function() onRefresh;
  final void Function(CourseModel) onTap;

  @override
  State<_CourseListContent> createState() => _CourseListContentState();
}

class _CourseListContentState extends State<_CourseListContent> {
  _CourseFilter _filter = _CourseFilter.all;

  /// Filters against the same deterministic [MockCourseProgress] statuses
  /// the tiles render — see file-level NOTE on mocked progress.
  bool _matchesFilter(int index) {
    final mock = MockCourseProgress.forIndex(index);
    return switch (_filter) {
      _CourseFilter.all => true,
      _CourseFilter.inProgress => mock.inProgress,
      _CourseFilter.completed => mock.completed,
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    if (widget.courses.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.menu_book_outlined),
        title: 'No courses available',
        subtitle: 'Published courses will appear here.',
      );
    }

    final visibleIndexes = [
      for (var i = 0; i < widget.courses.length; i++)
        if (_matchesFilter(i)) i,
    ];

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
                  'Courses',
                  style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary),
                ),
              ),
              AIMBadge(
                tone: AIMBadgeTone.primary,
                variant: AIMBadgeVariant.soft,
                pill: true,
                dot: true,
                child: const Text(_kMockStudentLevel),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Level up your English, step by step',
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
                  child: const Text('All courses'),
                ),
                const SizedBox(width: AimSpacing.innerGap),
                AIMChip(
                  selected: _filter == _CourseFilter.inProgress,
                  onPressed: () =>
                      setState(() => _filter = _CourseFilter.inProgress),
                  child: const Text('In progress'),
                ),
                const SizedBox(width: AimSpacing.innerGap),
                AIMChip(
                  selected: _filter == _CourseFilter.completed,
                  onPressed: () =>
                      setState(() => _filter = _CourseFilter.completed),
                  child: const Text('Completed'),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          for (final index in visibleIndexes) ...[
            CourseListTile(
              model: widget.courses[index],
              index: index,
              onTap: () => widget.onTap(widget.courses[index]),
            ),
            const SizedBox(height: AimSpacing.listItemGap),
          ],
        ],
      ),
    );
  }
}
