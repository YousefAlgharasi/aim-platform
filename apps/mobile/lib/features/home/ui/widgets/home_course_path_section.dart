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
import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/course_path_loader_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_courses_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

enum CoursePathNodeKind { lesson, quiz, finalExam }

/// One stop on the roadmap (public so the trail can be tested on its own).
class CoursePathNode {
  const CoursePathNode({
    required this.kind,
    required this.id,
    required this.title,
    required this.completed,
    required this.unlocked,
    required this.current,
  });

  final CoursePathNodeKind kind;
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
  List<CoursePathNode> _nodes = const [];

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
      final courses = await ref.read(homeCoursesProvider.future);
      final course = _pickCurrentCourse(courses);
      if (course == null) {
        if (mounted) setState(() => _state = _LoadState.empty);
        return;
      }

      if (course.locked) {
        // Above the student's unlocked level: nothing to load (the server
        // would answer 403 COURSE_LOCKED). Show the empty state, not an error.
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

      final data = await ref.read(coursePathLoaderProvider).load(
            bearerToken: token,
            courseId: course.courseId,
          );
      if (data == null) {
        if (mounted) setState(() => _state = _LoadState.empty);
        return;
      }
      final finalExam = data.finalExam;
      final activeChapterId = data.activeChapterId;

      if (activeChapterId == null) {
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
            CoursePathNode(
              kind: CoursePathNodeKind.finalExam,
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

      final lessons = data.lessons;
      final quiz = data.quiz;

      final nodes = <CoursePathNode>[
        for (final lesson in lessons)
          CoursePathNode(
            kind: CoursePathNodeKind.lesson,
            id: lesson.id,
            title: lesson.title,
            completed: lesson.completed,
            unlocked: lesson.completed || lesson.current,
            current: lesson.current,
          ),
        if (quiz != null)
          CoursePathNode(
            kind: CoursePathNodeKind.quiz,
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
        _subtitle = data.activeChapterTitle;
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

  void _openLesson(CoursePathNode node) {
    context.push(
      AppRoutePaths.lessonDetail,
      extra: {'lessonId': node.id, 'lessonTitle': node.title},
    );
  }

  void _openAssessment(CoursePathNode node) {
    context.push(
      AppRoutePaths.assessmentDetail,
      extra: {'assessmentId': node.id, 'assessmentTitle': node.title},
    );
  }

  void _onTapNode(CoursePathNode node) {
    if (!node.unlocked) return;
    switch (node.kind) {
      case CoursePathNodeKind.lesson:
        _openLesson(node);
      case CoursePathNodeKind.quiz:
      case CoursePathNodeKind.finalExam:
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
    if (_state == _LoadState.empty) {
      return const SizedBox.shrink();
    }
    if (_state == _LoadState.failure) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AimSpacing.space16),
        child: Center(
          child: TextButton(
            onPressed: _load,
            child: Text(
              AppLocalizations.of(context).commonError,
              style: AimTextStyles.bodySm.copyWith(
                color: AimColors.error500,
              ),
            ),
          ),
        ),
      );
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
              Expanded(
                child: Text(
                  titleText,
                  style: AimTextStyles.h3.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AimSpacing.space12),
              Expanded(
                flex: 0,
                child: Text(
                  _subtitle ?? '',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textMuted,
                    fontWeight: AimFontWeights.bold,
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.end,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
          CoursePathTrail(
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

/// The roadmap: stops zigzag down the path, the first on the start side, the
/// second on the end side, the third on the start side again, joined by a
/// dashed curve. Each stop's title sits on the inner side of its node, and the
/// curve only runs in the gaps between stops, so it never goes behind text.
class CoursePathTrail extends StatelessWidget {
  const CoursePathTrail({
    super.key,
    required this.nodes,
    required this.onTapNode,
    required this.quizLabel,
    required this.finalExamLabel,
    required this.lockedSemantic,
  });

  final List<CoursePathNode> nodes;
  final void Function(CoursePathNode node) onTapNode;
  final String quizLabel;
  final String finalExamLabel;
  final String lockedSemantic;

  /// Width of the column a node sits in, and its distance from the edge.
  static const double nodeBox = 56.0;
  static const double edgeInset = 6.0;

  /// Centre of a node, measured from the edge it sits on.
  static const double laneCentre = edgeInset + nodeBox / 2;

  /// Height of the curve between two stops.
  static const double linkHeight = 38.0;

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();
    final rtl = Directionality.of(context) == TextDirection.rtl;
    var lessonNumber = 0;

    final children = <Widget>[];
    for (var i = 0; i < nodes.length; i++) {
      final node = nodes[i];
      final onStart = i.isEven;
      if (node.kind == CoursePathNodeKind.lesson) lessonNumber++;
      children.add(
        _ZigStop(
          node: node,
          onStart: onStart,
          hasNext: i < nodes.length - 1,
          rtl: rtl,
          lessonNumber: node.kind == CoursePathNodeKind.lesson ? lessonNumber : null,
          label: switch (node.kind) {
            CoursePathNodeKind.lesson => node.title,
            CoursePathNodeKind.quiz => quizLabel,
            CoursePathNodeKind.finalExam => finalExamLabel,
          },
          lockedSemantic: lockedSemantic,
          onTap: () => onTapNode(node),
        ),
      );
      if (i < nodes.length - 1) {
        children.add(
          SizedBox(
            height: linkHeight,
            width: double.infinity,
            child: CustomPaint(
              painter: _LinkPainter(
                fromStart: onStart,
                rtl: rtl,
                color: node.completed
                    ? AimColors.success500.withValues(alpha: 0.55)
                    : AimColors.primary400.withValues(alpha: 0.55),
              ),
            ),
          ),
        );
      }
    }
    return Column(children: children);
  }
}

/// One stop: the node (top-aligned, on the start or end side) and its text on
/// the inner side. When the text is taller than the node, a short dashed
/// stub continues the line down to the row's bottom edge so the next curve
/// always starts where the node's line ends.
class _ZigStop extends StatelessWidget {
  const _ZigStop({
    required this.node,
    required this.onStart,
    required this.hasNext,
    required this.rtl,
    required this.lessonNumber,
    required this.label,
    required this.lockedSemantic,
    required this.onTap,
  });

  final CoursePathNode node;
  final bool onStart;
  final bool hasNext;
  final bool rtl;
  final int? lessonNumber;
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
    final size = isCurrent ? 54.0 : 46.0;

    final Widget dot;
    if (isDone) {
      dot = Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AimColors.success500, AimColors.success600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: AimColors.success500.withValues(alpha: 0.28),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Icon(Icons.check_rounded, color: AimColors.neutral0, size: 24),
      );
    } else if (isCurrent) {
      dot = Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AimColors.primary500, AimColors.primary400],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AimColors.primary200, width: 3),
          boxShadow: [
            BoxShadow(
              color: AimColors.primary500.withValues(alpha: 0.35),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(Icons.play_arrow_rounded, color: AimColors.neutral0, size: 28),
      );
    } else {
      dot = Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: surfaces.surface,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: surfaces.border, width: 2),
        ),
        child: Icon(Icons.lock_outline_rounded, color: surfaces.textMuted, size: 21),
      );
    }

    final status = isDone
        ? l10n.homeNodeMastered
        : isCurrent
            ? l10n.homeNodeCurrentLesson
            : l10n.homeNodeLocked;

    final nodeColumn = SizedBox(
      width: CoursePathTrail.nodeBox,
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          if (hasNext)
            Positioned.fill(
              top: size,
              child: CustomPaint(
                painter: _StubPainter(
                  color: isDone
                      ? AimColors.success500.withValues(alpha: 0.55)
                      : AimColors.primary400.withValues(alpha: 0.55),
                ),
              ),
            ),
          Align(alignment: Alignment.topCenter, child: dot),
        ],
      ),
    );

    final text = Expanded(
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: size),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: onStart ? CrossAxisAlignment.start : CrossAxisAlignment.end,
          children: [
            if (isCurrent)
              Container(
                margin: const EdgeInsets.only(bottom: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: const BoxDecoration(
                  gradient: AimGradients.ai,
                  borderRadius: AimRadius.borderPill,
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
              )
            else if (lessonNumber != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  fill(context.tr('Lesson {n}', 'الدرس {n}'), {'n': lessonNumber}),
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textMuted,
                    fontWeight: AimFontWeights.semibold,
                    fontSize: 11,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: onStart ? TextAlign.start : TextAlign.end,
              style: AimTextStyles.bodyMd.copyWith(
                color: isLocked ? surfaces.textMuted : surfaces.textPrimary,
                fontWeight: isCurrent ? AimFontWeights.bold : AimFontWeights.semibold,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              status,
              textAlign: onStart ? TextAlign.start : TextAlign.end,
              style: AimTextStyles.caption.copyWith(
                color: isDone
                    ? AimColors.success500
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
    );

    return Semantics(
      button: node.unlocked,
      label: node.unlocked ? label : '$label — $lockedSemantic',
      child: InkWell(
        onTap: node.unlocked ? onTap : null,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsetsDirectional.symmetric(
              horizontal: CoursePathTrail.edgeInset),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: onStart
                  ? [
                      nodeColumn,
                      const SizedBox(width: 12),
                      text,
                      // Keep the text off the opposite lane's side.
                      const SizedBox(width: CoursePathTrail.nodeBox * 0.6),
                    ]
                  : [
                      const SizedBox(width: CoursePathTrail.nodeBox * 0.6),
                      text,
                      const SizedBox(width: 12),
                      nodeColumn,
                    ],
            ),
          ),
        ),
      ),
    );
  }
}

void _drawDashed(Canvas canvas, Path path, Color color) {
  final paint = Paint()
    ..color = color
    ..strokeWidth = 3
    ..style = PaintingStyle.stroke
    ..strokeCap = StrokeCap.round;
  const dash = 7.0;
  const gap = 6.0;
  for (final metric in path.computeMetrics()) {
    var d = 0.0;
    while (d < metric.length) {
      canvas.drawPath(metric.extractPath(d, d + dash), paint);
      d += dash + gap;
    }
  }
}

/// A short vertical dashed line under a node's box.
class _StubPainter extends CustomPainter {
  _StubPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.height <= 1) return;
    final x = size.width / 2;
    _drawDashed(canvas, Path()..moveTo(x, 0)..lineTo(x, size.height), color);
  }

  @override
  bool shouldRepaint(_StubPainter old) => old.color != color;
}

/// The dashed S-curve between two stops: from the centre of one node's lane
/// to the centre of the other lane, vertical at both ends.
class _LinkPainter extends CustomPainter {
  _LinkPainter({required this.fromStart, required this.rtl, required this.color});

  final bool fromStart;
  final bool rtl;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    const startX = CoursePathTrail.laneCentre;
    final endX = w - CoursePathTrail.laneCentre;
    double px(double v) => rtl ? w - v : v;
    final x0 = px(fromStart ? startX : endX);
    final x1 = px(fromStart ? endX : startX);
    final h = size.height;
    final path = Path()
      ..moveTo(x0, 0)
      ..cubicTo(x0, h * 0.6, x1, h * 0.4, x1, h);
    _drawDashed(canvas, path, color);
  }

  @override
  bool shouldRepaint(_LinkPainter old) =>
      old.fromStart != fromStart || old.rtl != rtl || old.color != color;
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
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
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
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
