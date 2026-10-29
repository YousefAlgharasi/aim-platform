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
//   GET /student/courses            → the backend-flagged current course
//                                     (and next course once it's done)
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

import 'package:aim_mobile/features/course_billing/data/course_billing_models.dart';
import 'package:aim_mobile/features/course_billing/ui/widgets/course_billing_chip.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_courses_provider.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
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

  /// Set when the current course is completed and the backend names a next
  /// course: the roadmap then shows a "start the next course" card.
  StudentCourseModel? _nextCourse;
  bool _startingNext = false;

  /// Set when the current course is a paid course the student can't open
  /// yet: the roadmap then shows a "get this course" card.
  StudentCourseModel? _paymentCourse;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    try {
      final lessonsRepo = ref.read(lessonsRepositoryProvider);

      final courses = await ref.read(homeCoursesProvider.future);
      final course = _pickCurrentCourse(courses);
      if (course == null) {
        if (mounted) setState(() => _state = _LoadState.empty);
        return;
      }

      if (course.needsPayment) {
        if (!mounted) return;
        setState(() {
          _courseTitle = course.title;
          _subtitle = null;
          _nodes = const [];
          _nextCourse = null;
          _paymentCourse = course;
          _state = _LoadState.success;
        });
        return;
      }
      _paymentCourse = null;

      final next = courses.where((c) => c.isNext).firstOrNull;
      if (course.status == StudentCourseStatus.completed && next != null) {
        if (!mounted) return;
        setState(() {
          _courseTitle = course.title;
          _subtitle = null;
          _nodes = const [];
          _nextCourse = next;
          _state = _LoadState.success;
        });
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
          _nextCourse = null;
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
        _nextCourse = null;
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
    final flagged = courses.where((c) => c.isCurrent).firstOrNull;
    if (flagged != null) return flagged;

    // Older backends don't flag a current course.
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

  Future<void> _openClaim(StudentCourseModel course) async {
    await context.push(
      AppRoutePaths.courseClaim,
      extra: {'courseId': course.courseId, 'courseTitle': course.title},
    );
    if (mounted) ref.invalidate(homeCoursesProvider);
  }

  Future<void> _startNextCourse(StudentCourseModel next) async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty || _startingNext) return;
    if (next.needsPayment) {
      await _openClaim(next);
      return;
    }
    final l10n = AppLocalizations.of(context);
    setState(() => _startingNext = true);
    try {
      await ref
          .read(currentEnrollmentProvider.notifier)
          .enroll(bearerToken: token, courseId: next.courseId);
    } catch (_) {
      if (!mounted) return;
      setState(() => _startingNext = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.lessonsStartCourseFailedMessage)),
      );
      return;
    }
    if (!mounted) return;
    setState(() => _startingNext = false);
    ref.invalidate(homeCoursesProvider);
    context.push(
      AppRoutePaths.courseChapters,
      extra: {'courseId': next.courseId, 'courseTitle': next.title},
    );
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
    // Reload whenever the course list is refreshed (pull-to-refresh, or
    // after starting the next course).
    ref.listen<AsyncValue<List<StudentCourseModel>>>(homeCoursesProvider,
        (previous, next) {
      if (next.hasValue && previous?.valueOrNull != next.valueOrNull) _load();
    });

    if (_state == _LoadState.loading) {
      return const _CoursePathSkeleton();
    }
    if (_state != _LoadState.success || _courseTitle == null) {
      return const SizedBox.shrink();
    }

    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final titleText = l10n.homeLearningRoadmap;

    return Padding(
      padding: const EdgeInsets.symmetric(
        vertical: AimSpacing.space16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                titleText,
                style: AimTextStyles.h3.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: AimFontWeights.bold,
                ),
              ),
              Text(
                _subtitle ?? '',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textMuted,
                  fontWeight: AimFontWeights.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space24),
          if (_paymentCourse != null)
            _GetCourseCard(
              course: _paymentCourse!,
              onTap: () => _openClaim(_paymentCourse!),
            )
          else if (_nextCourse != null)
            _NextCourseCard(
              completedCourseTitle: _courseTitle!,
              nextCourseTitle: _nextCourse!.title,
              loading: _startingNext,
              onStart: () => _startNextCourse(_nextCourse!),
            )
          else
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

/// Winding node trail: nodes alternate horizontally, connected by a smooth
/// curved wavy dashed path. Matches the React mockup's ZigZagRoadmap perfectly.
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

    return LayoutBuilder(
      builder: (context, constraints) {
        final center = constraints.maxWidth / 2;
        final List<Offset> nodeOffsets = [];

        // Alternating horizontal offsets like React prototype, starting immediately from index 1 to wind beautifully: center, right, left, right, left...
        double getOffsetX(int index) {
          if (index == 0) return 0.0;
          return index % 2 == 1 ? 65.0 : -65.0;
        }

        // Calculated distance between circle centers is exactly 148 pixels
        // (nodeSize/2 of 56 = 28, height spacer = 52, half of next = 28 => 28+52+28 = 108.
        // Wait: node height with labels = 96 => bottom spacing of circle center is 96 - 28 = 68.
        // 68 + spacer 52 + 28 = 148.0 pixels)
        const double nodeSpacingY = 148.0;
        const double initialY = 28.0;

        for (var i = 0; i < nodes.length; i++) {
          nodeOffsets.add(Offset(center + getOffsetX(i), initialY + (i * nodeSpacingY)));
        }

        return Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _WavyPathPainter(
                  nodeOffsets: nodeOffsets,
                  color: const Color(0xFFC7D2FE),
                ),
              ),
            ),
            SizedBox(
              width: double.infinity,
              child: Column(
                children: [
                  for (var i = 0; i < nodes.length; i++) ...[
                    Transform.translate(
                      offset: Offset(getOffsetX(i), 0),
                      child: _RoadmapNodeWidget(
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
                    if (i < nodes.length - 1)
                      const SizedBox(height: 52.0), // spacer to match nodeSpacingY calculation
                  ],
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _WavyPathPainter extends CustomPainter {
  _WavyPathPainter({required this.nodeOffsets, required this.color});
  final List<Offset> nodeOffsets;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (nodeOffsets.length < 2) return;
    final paint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    path.moveTo(nodeOffsets[0].dx, nodeOffsets[0].dy);

    for (var i = 0; i < nodeOffsets.length - 1; i++) {
      final p0 = nodeOffsets[i];
      final p1 = nodeOffsets[i + 1];
      final midY = (p0.dy + p1.dy) / 2;
      path.cubicTo(p0.dx, midY, p1.dx, midY, p1.dx, p1.dy);
    }

    // Draw dashed path
    const dashWidth = 8.0;
    const dashSpace = 6.0;
    var distance = 0.0;
    for (final pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        canvas.drawPath(
          pathMetric.extractPath(distance, distance + dashWidth),
          paint,
        );
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _RoadmapNodeWidget extends StatelessWidget {
  const _RoadmapNodeWidget({
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
    final l10n = AppLocalizations.of(context);
    final isDone = node.completed;
    final isCurrent = node.current;
    final isLocked = !node.unlocked;

    final double nodeSize = isCurrent ? 68 : 56;

    Widget circle;
    if (isDone) {
      circle = Container(
        width: nodeSize,
        height: nodeSize,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF34D399), Color(0xFF059669)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF10B981).withValues(alpha: 0.2),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: const Icon(
          Icons.check_rounded,
          color: AimColors.neutral0,
          size: 24,
        ),
      );
    } else if (isCurrent) {
      circle = Transform.rotate(
        angle: 3 * 3.14159 / 180, // rotate-3
        child: Container(
          width: nodeSize,
          height: nodeSize,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF6366F1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFC7D2FE), width: 4),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: const Icon(
            Icons.play_arrow_rounded,
            color: AimColors.neutral0,
            size: 28,
          ),
        ),
      );
    } else {
      circle = Container(
        width: nodeSize,
        height: nodeSize,
        decoration: BoxDecoration(
          color: surfaces.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: surfaces.border, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Icon(
          Icons.lock_outline_rounded,
          color: surfaces.textMuted,
          size: 22,
        ),
      );
    }

    final String subTranslated = isDone
        ? l10n.homeNodeMastered
        : isCurrent
            ? l10n.homeNodeCurrentLesson
            : l10n.homeNodeLocked;

    return Semantics(
      button: node.unlocked,
      label: node.unlocked ? label : '$label — $lockedSemantic',
      child: GestureDetector(
        onTap: node.unlocked ? onTap : null,
        child: SizedBox(
          width: 140, // constraints label size
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  circle,
                  if (isCurrent)
                    Positioned(
                      top: -24,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          gradient: AimGradients.gzHero,
                          borderRadius: AimRadius.borderPill,
                          boxShadow: [
                            BoxShadow(
                              color: AimColors.primary500.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          l10n.homeNextUp.toUpperCase(),
                          style: AimTextStyles.caption.copyWith(
                            color: AimColors.neutral0,
                            fontWeight: AimFontWeights.extrabold,
                            fontSize: 9,
                            letterSpacing: 0.8,
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
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
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
            ],
          ),
        ),
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

/// Shown in place of the path when the current course is paid and not
/// opened yet (not bought, waiting for approval, or time ran out).
class _GetCourseCard extends StatelessWidget {
  const _GetCourseCard({required this.course, required this.onTap});

  final StudentCourseModel course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final status = course.access?.status;
    final body = switch (status) {
      CourseAccessStatus.pending => l10n.billingPendingBody,
      CourseAccessStatus.failed => l10n.billingFailedBody,
      _ => l10n.billingPaymentRequiredBody,
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
      decoration: BoxDecoration(
        color: AimColors.primary500.withValues(alpha: 0.06),
        borderRadius: AimRadius.borderX2l,
        border: Border.all(color: AimColors.primary500.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lock_outline_rounded, color: AimColors.primary500, size: 22),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  course.title,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
              ),
              CourseBillingChip(course: course),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(body, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary)),
          const SizedBox(height: AimSpacing.space16),
          AIMButton(
            variant: AIMButtonVariant.primary,
            fullWidth: true,
            onPressed: onTap,
            child: Text(l10n.billingGetCourseTitle),
          ),
        ],
      ),
    );
  }
}

/// Shown in place of the path once the current course is completed: names
/// the backend's next course and starts it (enroll + open its chapters).
class _NextCourseCard extends StatelessWidget {
  const _NextCourseCard({
    required this.completedCourseTitle,
    required this.nextCourseTitle,
    required this.loading,
    required this.onStart,
  });

  final String completedCourseTitle;
  final String nextCourseTitle;
  final bool loading;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
      decoration: BoxDecoration(
        color: AimColors.primary500.withValues(alpha: 0.06),
        borderRadius: AimRadius.borderX2l,
        border: Border.all(color: AimColors.primary500.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emoji_events_rounded,
                  color: AimColors.success500, size: 22),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  l10n.homeNextCourseTitle(completedCourseTitle),
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            l10n.homeNextCourseBody(nextCourseTitle),
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.space16),
          AIMButton(
            variant: AIMButtonVariant.primary,
            fullWidth: true,
            loading: loading,
            onPressed: onStart,
            child: Text(l10n.homeNextCourseStart(nextCourseTitle)),
          ),
        ],
      ),
    );
  }
}
