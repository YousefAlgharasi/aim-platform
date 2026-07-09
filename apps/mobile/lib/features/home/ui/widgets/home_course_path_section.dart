// HomeCoursePathSection — Duolingo-style "where am I in this course" path.
//
// Replaces the Quick Start / Skill States / Focus Areas / Review Schedule
// sections on the home screen with a single at-a-glance path: course title,
// current chapter as a subtitle, and a node for each lesson in that chapter
// plus the chapter quiz. Once every lesson and the quiz are done, the
// backend-computed chapter status flips to 'completed' and the next load
// picks up the next chapter automatically — Flutter never decides when a
// chapter/course is "done", it only renders what the backend already
// computed (StudentCourse.status, ChapterProgress.status,
// LessonProgress.completed/current, ChapterQuizSummary.completed/locked,
// FinalExamSummary.unlocked).
//
// Data is composed client-side from three existing endpoints (there is no
// single combined endpoint yet):
//   GET /student/courses            → pick the current course
//   GET /student/chapters?levelId=  → pick the current chapter (+ final exam)
//   GET /student/lessons?chapterId= → lessons + quiz for that chapter
//
// Security rules:
// - courseId/levelId/chapterId/assessmentId/lessonId are always
//   backend-supplied values threaded through from prior responses — never
//   constructed from user input.
// - Flutter never computes completed/current/locked/unlocked itself; all
//   node states are read verbatim from the backend responses above.
// - Bearer token from authFlowProvider; never stored in this widget.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/theme/aim_theme_extensions.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

enum _NodeKind { lesson, quiz, finalExam }

class _PathNode {
  const _PathNode({
    required this.kind,
    required this.id,
    required this.title,
    required this.completed,
    required this.unlocked,
    required this.current,
  });

  final _NodeKind kind;
  final String id;
  final String title;
  final bool completed;

  /// Whether tapping this node is allowed (reached, not locked ahead).
  final bool unlocked;

  /// The single next-up node — highlighted distinctly from completed/locked.
  final bool current;
}

enum _LoadState { loading, success, empty, failure }

class HomeCoursePathSection extends ConsumerStatefulWidget {
  const HomeCoursePathSection({super.key});

  @override
  ConsumerState<HomeCoursePathSection> createState() =>
      _HomeCoursePathSectionState();
}

class _HomeCoursePathSectionState extends ConsumerState<HomeCoursePathSection> {
  _LoadState _state = _LoadState.loading;
  String? _courseTitle;
  String? _subtitle;
  List<_PathNode> _nodes = const [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    try {
      final coursesRepo = ref.read(studentCoursesRepositoryProvider);
      final lessonsRepo = ref.read(lessonsRepositoryProvider);

      final courses = await coursesRepo.getCourses(bearerToken: token);
      final course = _pickCurrentCourse(courses);
      if (course == null) {
        if (mounted) setState(() => _state = _LoadState.empty);
        return;
      }

      final levels =
          await lessonsRepo.getLevels(bearerToken: token, courseId: course.courseId);
      if (levels.isEmpty) {
        if (mounted) setState(() => _state = _LoadState.empty);
        return;
      }
      final levelId = levels.first.id;

      final chapters = await lessonsRepo.getChaptersWithProgress(
        bearerToken: token,
        levelId: levelId,
      );
      final finalExam =
          await lessonsRepo.getFinalExamForLevel(bearerToken: token, levelId: levelId);

      _PathNode? currentChapterIncomplete;
      for (final c in chapters) {
        if (!c.isCompleted) {
          currentChapterIncomplete = _PathNode(
            kind: _NodeKind.lesson,
            id: c.chapterId,
            title: c.title,
            completed: false,
            unlocked: true,
            current: false,
          );
          break;
        }
      }

      if (currentChapterIncomplete == null) {
        // Every chapter is done — the course's final stretch is its exam.
        if (finalExam == null) {
          if (mounted) setState(() => _state = _LoadState.empty);
          return;
        }
        if (!mounted) return;
        final l10n = AppLocalizations.of(context);
        setState(() {
          _courseTitle = course.title;
          _subtitle = course.status == StudentCourseStatus.completed
              ? l10n.homeCoursePathCompletedSubtitle
              : l10n.homeCoursePathFinalExamLabel;
          _nodes = [
            _PathNode(
              kind: _NodeKind.finalExam,
              id: finalExam.assessmentId,
              title: finalExam.title,
              completed: course.status == StudentCourseStatus.completed,
              unlocked: finalExam.unlocked,
              current: finalExam.unlocked && course.status != StudentCourseStatus.completed,
            ),
          ];
          _state = _LoadState.success;
        });
        return;
      }

      final chapterId = currentChapterIncomplete.id;
      final lessons = await lessonsRepo.getLessonsWithProgress(
        bearerToken: token,
        chapterId: chapterId,
      );
      final quiz =
          await lessonsRepo.getChapterQuiz(bearerToken: token, chapterId: chapterId);

      final nodes = <_PathNode>[
        for (final lesson in lessons)
          _PathNode(
            kind: _NodeKind.lesson,
            id: lesson.id,
            title: lesson.title,
            completed: lesson.completed,
            unlocked: lesson.completed || lesson.current,
            current: lesson.current,
          ),
        if (quiz != null)
          _PathNode(
            kind: _NodeKind.quiz,
            id: quiz.assessmentId,
            title: quiz.title,
            completed: quiz.completed,
            unlocked: !quiz.locked,
            current: !quiz.locked && !quiz.completed,
          ),
      ];

      if (!mounted) return;
      setState(() {
        _courseTitle = course.title;
        _subtitle = currentChapterIncomplete!.title;
        _nodes = nodes;
        _state = _LoadState.success;
      });
    } catch (_) {
      if (mounted) setState(() => _state = _LoadState.failure);
    }
  }

  StudentCourseModel? _pickCurrentCourse(List<StudentCourseModel> courses) {
    StudentCourseModel? inProgress;
    StudentCourseModel? notStarted;
    StudentCourseModel? completed;
    for (final c in courses) {
      if (c.locked) continue;
      switch (c.status) {
        case StudentCourseStatus.inProgress:
          inProgress ??= c;
        case StudentCourseStatus.notStarted:
          notStarted ??= c;
        case StudentCourseStatus.completed:
          completed = c;
      }
    }
    return inProgress ?? notStarted ?? completed;
  }

  void _openLesson(_PathNode node) {
    context.push(
      AppRoutePaths.lessonDetail,
      extra: {'lessonId': node.id, 'lessonTitle': node.title},
    );
  }

  void _openAssessment(_PathNode node) {
    context.push(
      AppRoutePaths.assessmentDetail,
      extra: {'assessmentId': node.id, 'assessmentTitle': node.title},
    );
  }

  void _onTapNode(_PathNode node) {
    if (!node.unlocked) return;
    switch (node.kind) {
      case _NodeKind.lesson:
        _openLesson(node);
      case _NodeKind.quiz:
      case _NodeKind.finalExam:
        _openAssessment(node);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_state == _LoadState.loading) {
      return const _CoursePathSkeleton();
    }
    if (_state != _LoadState.success || _courseTitle == null) {
      return const SizedBox.shrink();
    }

    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: AimRadius.borderX2l,
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        children: [
          Text(
            _courseTitle!,
            textAlign: TextAlign.center,
            style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            _subtitle ?? '',
            textAlign: TextAlign.center,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          _CoursePathTrail(
            nodes: _nodes,
            onTapNode: _onTapNode,
            quizLabel: l10n.homeCoursePathChapterQuizLabel,
            finalExamLabel: l10n.homeCoursePathFinalExamLabel,
            lockedSemantic: l10n.lessonsCourseLockedSemantic,
          ),
        ],
      ),
    );
  }
}

/// Zigzag node trail: alternating left/center/right offsets connected by a
/// thin vertical line, matching the reference app's winding lesson path.
class _CoursePathTrail extends StatelessWidget {
  const _CoursePathTrail({
    required this.nodes,
    required this.onTapNode,
    required this.quizLabel,
    required this.finalExamLabel,
    required this.lockedSemantic,
  });

  final List<_PathNode> nodes;
  final void Function(_PathNode node) onTapNode;
  final String quizLabel;
  final String finalExamLabel;
  final String lockedSemantic;

  static const List<Alignment> _offsets = [
    Alignment.center,
    Alignment(-0.55, 0),
    Alignment(0.55, 0),
  ];

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        for (var i = 0; i < nodes.length; i++) ...[
          if (i > 0)
            Container(
              width: 3,
              height: AimSpacing.space24,
              color: AimColors.neutral200,
            ),
          Align(
            alignment: _offsets[i % _offsets.length],
            child: _CoursePathNode(
              node: nodes[i],
              label: switch (nodes[i].kind) {
                _NodeKind.lesson => nodes[i].title,
                _NodeKind.quiz => quizLabel,
                _NodeKind.finalExam => finalExamLabel,
              },
              lockedSemantic: lockedSemantic,
              onTap: () => onTapNode(nodes[i]),
            ),
          ),
        ],
      ],
    );
  }
}

class _CoursePathNode extends StatelessWidget {
  const _CoursePathNode({
    required this.node,
    required this.label,
    required this.lockedSemantic,
    required this.onTap,
  });

  final _PathNode node;
  final String label;
  final String lockedSemantic;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final Widget circle;
    if (node.completed) {
      circle = _NodeCircle(
        gradient: node.kind == _NodeKind.lesson ? AimGradients.gzFire : AimGradients.gzLime,
        icon: Icons.check_rounded,
        iconColor: AimColors.neutral0,
      );
    } else if (node.current) {
      circle = _NodeCircle(
        gradient: AimGradients.gzHero,
        icon: node.kind == _NodeKind.lesson ? Icons.play_arrow_rounded : Icons.quiz_rounded,
        iconColor: AimColors.neutral0,
      );
    } else {
      circle = const _NodeCircle(
        color: AimColors.neutral200,
        icon: Icons.lock_outline_rounded,
        iconColor: AimColors.neutral500,
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
      child: Semantics(
        button: node.unlocked,
        label: node.unlocked ? label : '$label — $lockedSemantic',
        child: InkWell(
          onTap: node.unlocked ? onTap : null,
          borderRadius: AimRadius.borderPill,
          child: Column(
            children: [
              circle,
              const SizedBox(height: AimSpacing.space4),
              SizedBox(
                width: 88,
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.caption.copyWith(
                    color: node.unlocked ? surfaces.textPrimary : surfaces.textMuted,
                    fontWeight:
                        node.current ? AimFontWeights.bold : AimFontWeights.regular,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NodeCircle extends StatelessWidget {
  const _NodeCircle({
    required this.icon,
    required this.iconColor,
    this.gradient,
    this.color,
  });

  final IconData icon;
  final Color iconColor;
  final Gradient? gradient;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: AimSizes.avatarLg,
      height: AimSizes.avatarLg,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: gradient,
        color: gradient == null ? color : null,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: iconColor, size: AimSizes.iconMd),
    );
  }
}

class _CoursePathSkeleton extends StatelessWidget {
  const _CoursePathSkeleton();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      width: double.infinity,
      height: 220,
      padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: AimRadius.borderX2l,
      ),
    );
  }
}
