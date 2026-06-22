// Phase 6 — P6-073
// CourseListPage — displays published courses from the backend.
//
// Loads via [coursesProvider] on first build. Tapping a course navigates
// to the chapter list (P6-074) passing the backend-supplied course ID.
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
      appBar: const AIMTopAppBar(title: 'Courses'),
      body: switch (state) {
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
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _CourseListContent extends StatelessWidget {
  const _CourseListContent({
    required this.courses,
    required this.onRefresh,
    required this.onTap,
  });

  final List<CourseModel> courses;
  final Future<void> Function() onRefresh;
  final void Function(CourseModel) onTap;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.menu_book_outlined),
        title: 'No courses available',
        subtitle: 'Published courses will appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: courses.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          final course = courses[index];
          return CourseListTile(
            model: course,
            onTap: () => onTap(course),
          );
        },
      ),
    );
  }
}
