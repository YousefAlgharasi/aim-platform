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
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';
import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Scaffold.of(context).openDrawer();
        },
        backgroundColor: colorScheme.primary,
        shape: const CircleBorder(),
        elevation: 6,
        child: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
      ),
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
          AppAsyncIdle() => AIMFullScreenLoading(
              semanticLabel: loadingLabel,
            ),
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
          // Top Header Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Consumer(
                builder: (context, ref, child) {
                  return GestureDetector(
                    onTap: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        ref.read(mainShellTabIndexProvider.notifier).state = 0;
                      }
                    },
                    child: Container(
                      width: 40,
                      height: 40,
                      margin: const EdgeInsets.only(right: 12),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: surfaces.surfaceSunken,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.arrow_back_rounded,
                        size: 20,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  );
                },
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.lessonsCoursesPageTitle,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.lessonsCoursesSubtitle,
                      style: TextStyle(
                        fontSize: 14,
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Level Badge Pill
              if (headerLevel.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFC7D2FE)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircleAvatar(
                        radius: 3.5,
                        backgroundColor: Color(0xFF4F46E5),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        l10n.lessonsLevelBadge(headerLevel),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF4F46E5),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          const SizedBox(height: 20),

          // Overview Hero Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F46E5), Color(0xFF7C3AED), Color(0xFF6366F1)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'LEARNING PATH',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.auto_awesome_rounded,
                      color: Color(0xFFFDE047),
                      size: 20,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Structured Curriculum',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Follow your personalized sequence from CEFR Starter to Advanced mastery.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.9),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Filter Segment Tabs
          Row(
            children: [
              _buildFilterTab(l10n.lessonsFilterAllCourses, _CourseFilter.all),
              const SizedBox(width: 10),
              _buildFilterTab(l10n.lessonsInProgressLabel, _CourseFilter.inProgress),
              const SizedBox(width: 10),
              _buildFilterTab(l10n.lessonsCompletedLabel, _CourseFilter.completed),
            ],
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
          else
            for (var i = 0; i < visibleCourses.length; i++)
              CourseListTile(
                model: visibleCourses[i],
                index: i,
                isCurrentEnrollment: widget.currentCourseId == visibleCourses[i].courseId,
                onTap: () => widget.onTap(visibleCourses[i]),
              ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String label, _CourseFilter filter) {
    final isSelected = _filter == filter;
    return InkWell(
      onTap: () => setState(() => _filter = filter),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF4F46E5) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
