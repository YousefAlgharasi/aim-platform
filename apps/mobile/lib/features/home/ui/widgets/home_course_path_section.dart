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

  static const double _nodeSize = 76;
  static const double _nodeBoxWidth = 108;
  static const double _rowHeight = 132;
  static const List<double> _laneFractions = [0.5, 0.21, 0.79];

  // A distinct, lively color per lesson node so completed steps don't all
  // look identical — cycled by index. Quiz/final-exam nodes always use
  // their own coral/purple treatment so they read as the chapter's "boss"
  // step regardless of where they land in this cycle.
  static const List<Gradient> _lessonPalette = [
    AimGradients.gzFire,
    AimGradients.growth,
    AimGradients.gzCoral,
    AimGradients.ai,
    AimGradients.gzLime,
  ];

  Offset _centerFor(int index, double width) {
    final lane = _laneFractions[index % _laneFractions.length];
    return Offset(lane * width, _rowHeight * index + _nodeSize / 2);
  }

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();

    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final centers = [
          for (var i = 0; i < nodes.length; i++) _centerFor(i, width),
        ];
        final height = _rowHeight * (nodes.length - 1) + _nodeSize + 56;

        return SizedBox(
          width: width,
          height: height,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: _TrailPainter(centers: centers, nodes: nodes),
                ),
              ),
              for (var i = 0; i < nodes.length; i++)
                Positioned(
                  left: centers[i].dx - _nodeBoxWidth / 2,
                  top: centers[i].dy - _nodeSize / 2,
                  width: _nodeBoxWidth,
                  child: _CoursePathNode(
                    node: nodes[i],
                    label: switch (nodes[i].kind) {
                      _NodeKind.lesson => nodes[i].title,
                      _NodeKind.quiz => quizLabel,
                      _NodeKind.finalExam => finalExamLabel,
                    },
                    lockedSemantic: lockedSemantic,
                    nodeSize: _nodeSize,
                    gradient: _lessonPalette[i % _lessonPalette.length],
                    onTap: () => onTapNode(nodes[i]),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

/// Draws the winding connector line through node centers as a sequence of
/// smooth S-curves. A completed node's outgoing segment is a solid, lit
/// gradient line; everything ahead of the student is a muted dashed line.
class _TrailPainter extends CustomPainter {
  const _TrailPainter({required this.centers, required this.nodes});

  final List<Offset> centers;
  final List<_PathNode> nodes;

  @override
  void paint(Canvas canvas, Size size) {
    for (var i = 0; i < centers.length - 1; i++) {
      final p0 = centers[i];
      final p1 = centers[i + 1];
      final midY = (p0.dy + p1.dy) / 2;
      final path = Path()
        ..moveTo(p0.dx, p0.dy)
        ..cubicTo(p0.dx, midY, p1.dx, midY, p1.dx, p1.dy);

      final walked = nodes[i].completed;
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 5
        ..strokeCap = StrokeCap.round;

      if (walked) {
        paint.shader = const LinearGradient(
          colors: [AimColors.gzLime, AimColors.accent500],
        ).createShader(Rect.fromPoints(p0, p1));
        canvas.drawPath(path, paint);
      } else {
        paint.color = AimColors.neutral300;
        _drawDashedPath(canvas, path, paint);
      }
    }
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint) {
    const dashWidth = 9.0;
    const dashSpace = 7.0;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final next = (distance + dashWidth).clamp(0.0, metric.length);
        canvas.drawPath(metric.extractPath(distance, next), paint);
        distance = next + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _TrailPainter oldDelegate) =>
      oldDelegate.centers != centers || oldDelegate.nodes != nodes;
}

class _CoursePathNode extends StatelessWidget {
  const _CoursePathNode({
    required this.node,
    required this.label,
    required this.lockedSemantic,
    required this.nodeSize,
    required this.gradient,
    required this.onTap,
  });

  final _PathNode node;
  final String label;
  final String lockedSemantic;
  final double nodeSize;
  final Gradient gradient;
  final VoidCallback onTap;

  Gradient get _bossGradient =>
      node.kind == _NodeKind.finalExam ? AimGradients.gzHero : AimGradients.gzCoral;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isBossNode = node.kind != _NodeKind.lesson;

    final Widget circle;
    if (node.completed) {
      circle = _NodeCircle(
        size: nodeSize,
        gradient: isBossNode ? _bossGradient : gradient,
        icon: Icons.check_rounded,
        iconColor: AimColors.neutral0,
        glow: false,
      );
    } else if (node.current) {
      circle = _NodeCircle(
        size: nodeSize,
        gradient: AimGradients.gzHero,
        icon: node.kind == _NodeKind.lesson ? Icons.play_arrow_rounded : Icons.quiz_rounded,
        iconColor: AimColors.neutral0,
        glow: true,
        ringed: true,
      );
    } else {
      circle = _NodeCircle(
        size: nodeSize * 0.86,
        color: AimColors.neutral200,
        icon: Icons.lock_outline_rounded,
        iconColor: AimColors.neutral500,
        glow: false,
      );
    }

    return Semantics(
      button: node.unlocked,
      label: node.unlocked ? label : '$label — $lockedSemantic',
      child: InkWell(
        onTap: node.unlocked ? onTap : null,
        borderRadius: AimRadius.borderPill,
        child: Column(
          children: [
            SizedBox(
              height: nodeSize + AimSpacing.space8,
              child: Center(child: circle),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AimTextStyles.caption.copyWith(
                color: node.unlocked ? surfaces.textPrimary : surfaces.textMuted,
                fontWeight: node.current ? AimFontWeights.bold : AimFontWeights.regular,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NodeCircle extends StatelessWidget {
  const _NodeCircle({
    required this.icon,
    required this.iconColor,
    required this.size,
    required this.glow,
    this.gradient,
    this.color,
    this.ringed = false,
  });

  final IconData icon;
  final Color iconColor;
  final double size;
  final bool glow;
  final bool ringed;
  final Gradient? gradient;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final glowColor = gradient == AimGradients.gzHero
        ? AimColors.gzPurple
        : AimColors.accent500;

    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: ringed ? Border.all(color: AimColors.neutral0, width: 4) : null,
        boxShadow: [
          if (glow)
            BoxShadow(
              color: glowColor.withValues(alpha: 0.45),
              blurRadius: 20,
              spreadRadius: 2,
            )
          else if (gradient != null)
            const BoxShadow(
              color: Color(0x1F181C26),
              offset: Offset(0, 3),
              blurRadius: 6,
            ),
        ],
      ),
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: gradient,
          color: gradient == null ? color : null,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: size * 0.42),
      ),
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
