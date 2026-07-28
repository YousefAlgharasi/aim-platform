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
      padding: const EdgeInsets.symmetric(
        vertical: AimSpacing.cardPaddingLg,
        horizontal: AimSpacing.space8,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            surfaces.surface,
            Color.lerp(surfaces.surface, AimColors.gzPurple, 0.05)!,
          ],
        ),
        borderRadius: AimRadius.borderX2l,
        boxShadow: AimShadows.card,
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
          DecoratedBox(
            decoration: BoxDecoration(
              color: aimSoftFillsOf(context).primary,
              borderRadius: AimRadius.borderPill,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.space12,
                vertical: AimSpacing.space4,
              ),
              child: Text(
                _subtitle ?? '',
                textAlign: TextAlign.center,
                style: AimTextStyles.bodySm.copyWith(
                  color: aimSoftFillsOf(context).onPrimary,
                  fontWeight: AimFontWeights.semibold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
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

/// Winding node trail: nodes alternate across three horizontal lanes,
/// connected by a smooth curved line (solid + lit where the path has been
/// walked, dashed + muted ahead) — a livelier, Duolingo-style skill path
/// instead of a plain straight connector.
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

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        for (var i = 0; i < nodes.length; i++) ...[
          _RoadmapNodeWidget(
            node: nodes[i],
            label: switch (nodes[i].kind) {
              _NodeKind.lesson => nodes[i].title,
              _NodeKind.quiz => quizLabel,
              _NodeKind.finalExam => finalExamLabel,
            },
            lockedSemantic: lockedSemantic,
            onTap: () => onTapNode(nodes[i]),
            isLast: i == nodes.length - 1,
            nextIsDone: i < nodes.length - 1 && nodes[i + 1].completed,
          ),
        ],
      ],
    );
  }
}

class _RoadmapNodeWidget extends StatelessWidget {
  const _RoadmapNodeWidget({
    required this.node,
    required this.label,
    required this.lockedSemantic,
    required this.onTap,
    required this.isLast,
    required this.nextIsDone,
  });

  final _PathNode node;
  final String label;
  final String lockedSemantic;
  final VoidCallback onTap;
  final bool isLast;
  final bool nextIsDone;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final isDone = node.completed;
    final isCurrent = node.current;
    final isLocked = !node.unlocked;

    final double nodeSize = isCurrent ? 64 : 52;

    Widget circle;
    if (isDone) {
      circle = Container(
        width: nodeSize,
        height: nodeSize,
        decoration: const BoxDecoration(
          color: Color(0xFF22C55E),
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: const Icon(
          Icons.check_rounded,
          color: AimColors.neutral0,
          size: 22,
        ),
      );
    } else if (isCurrent) {
      circle = Container(
        width: nodeSize,
        height: nodeSize,
        decoration: BoxDecoration(
          color: AimColors.primary500,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AimColors.primary500.withValues(alpha: 0.25),
              blurRadius: 24,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: const Icon(
          Icons.play_arrow_rounded,
          color: AimColors.neutral0,
          size: 24,
        ),
      );
    } else {
      circle = SizedBox(
        width: nodeSize,
        height: nodeSize,
        child: CustomPaint(
          painter: _DashedCirclePainter(color: surfaces.border),
          child: Center(
            child: Icon(
              Icons.lock_outline_rounded,
              color: surfaces.textMuted,
              size: 20,
            ),
          ),
        ),
      );
    }

    final locale = Localizations.localeOf(context).languageCode;
    final isAr = locale == 'ar';
    final String subTranslated = isDone
        ? (isAr ? 'متقن' : 'Mastered')
        : isCurrent
            ? (isAr ? 'الدرس الحالي' : 'Current Lesson')
            : (isAr ? 'مغلق' : 'Locked');

    return Semantics(
      button: node.unlocked,
      label: node.unlocked ? label : '$label — $lockedSemantic',
      child: GestureDetector(
        onTap: node.unlocked ? onTap : null,
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                circle,
                if (isCurrent)
                  Positioned(
                    top: -22,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AimColors.primary500,
                        borderRadius: AimRadius.borderPill,
                      ),
                      child: Text(
                        l10n.homeNextUp,
                        style: AimTextStyles.caption.copyWith(
                          color: AimColors.neutral0,
                          fontWeight: AimFontWeights.bold,
                          fontSize: 10,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AimTextStyles.bodySm.copyWith(
                color: isLocked ? surfaces.textMuted : surfaces.textPrimary,
                fontWeight: isCurrent ? AimFontWeights.bold : AimFontWeights.semibold,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: AimSpacing.space2),
            Text(
              subTranslated,
              textAlign: TextAlign.center,
              style: AimTextStyles.caption.copyWith(
                color: isDone
                    ? const Color(0xFF22C55E)
                    : isCurrent
                        ? AimColors.primary500
                        : surfaces.textMuted,
                fontWeight: AimFontWeights.semibold,
                fontSize: 11,
              ),
            ),
            if (!isLast) _buildLine(isDone, surfaces.border),
          ],
        ),
      ),
    );
  }

  Widget _buildLine(bool isDone, Color borderStrong) {
    if (isDone) {
      return Container(
        width: 2,
        height: 36,
        color: const Color(0xFF86EFAC),
        margin: const EdgeInsets.symmetric(vertical: 6),
      );
    } else {
      return Container(
        width: 2,
        height: 36,
        margin: const EdgeInsets.symmetric(vertical: 6),
        child: CustomPaint(
          painter: _DashedLinePainter(color: borderStrong),
        ),
      );
    }
  }
}

class _DashedLinePainter extends CustomPainter {
  _DashedLinePainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    const dashHeight = 5.0;
    const dashSpace = 5.0;
    var startY = 0.0;
    while (startY < size.height) {
      canvas.drawLine(Offset(size.width / 2, startY), Offset(size.width / 2, startY + dashHeight), paint);
      startY += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class _DashedCirclePainter extends CustomPainter {
  _DashedCirclePainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final double radius = size.width / 2;
    const double dashWidth = 6.0;
    const double dashSpace = 4.0;
    final double circumference = 2 * 3.1415926535 * radius;
    final int dashCount = (circumference / (dashWidth + dashSpace)).floor();

    for (var i = 0; i < dashCount; i++) {
      final double startAngle = (i * (dashWidth + dashSpace) / circumference) * 2 * 3.1415926535;
      final double sweepAngle = (dashWidth / circumference) * 2 * 3.1415926535;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(radius, radius), radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
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
