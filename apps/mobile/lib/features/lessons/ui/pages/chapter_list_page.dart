// Phase 6 — P6-074
// ChapterListPage — displays chapters for a backend-supplied course.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lessons_entities.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';

enum ChapterListFilter { all, inProgress, completed }

class ChapterListPage extends ConsumerStatefulWidget {
  const ChapterListPage({
    required this.courseId,
    required this.courseTitle,
    super.key,
  });

  final String courseId;
  final String courseTitle;

  @override
  ConsumerState<ChapterListPage> createState() => _ChapterListPageState();
}

class _ChapterListPageState extends ConsumerState<ChapterListPage> {
  ChapterListFilter _filter = ChapterListFilter.all;
  FinalExamSummary? _finalExam;
  // No static accordion expansion needed; tapping card opens LessonListPage

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      _loadFinalExam();
    });
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(chaptersProvider.notifier).loadForCourse(
          bearerToken: token,
          courseId: widget.courseId,
        );
  }

  Future<void> _loadFinalExam() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    final repository = ref.read(lessonsRepositoryProvider);
    final levels = await repository.getLevels(
      bearerToken: token,
      courseId: widget.courseId,
    );
    if (levels.isEmpty || !mounted) return;
    final finalExam = await repository.getFinalExamForLevel(
      bearerToken: token,
      levelId: levels.first.id,
    );
    if (mounted) setState(() => _finalExam = finalExam);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(chaptersProvider.notifier).loadForCourse(
          bearerToken: token,
          courseId: widget.courseId,
        );
    await _loadFinalExam();
  }


  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chaptersProvider);

    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);

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
        child: Column(
          children: [
            // App Bar Header (Back button + Course Title matching prototype)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: surfaces.surface,
                border: Border(bottom: BorderSide(color: surfaces.border)),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/main');
                      }
                    },
                    icon: Icon(Icons.arrow_back_rounded, color: surfaces.textSecondary, size: 22),
                    style: IconButton.styleFrom(
                      backgroundColor: surfaces.surfaceSunken,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      widget.courseTitle,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                        letterSpacing: -0.3,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: switch (state) {
                AppAsyncLoading() => const AIMFullScreenLoading(),
                AppAsyncFailure(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: _load,
                  ),
                AppAsyncSuccess(:final data) => _buildBody(context, data),
                AppAsyncIdle() => const AIMFullScreenLoading(),
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, List<ChapterProgress> chapters) {
    if (chapters.isEmpty) {
      return RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          children: const [
            AIMEmptyState(
              icon: Icon(Icons.layers_outlined),
              title: 'No chapters available',
              subtitle: 'Check back later for new chapters.',
            ),
          ],
        ),
      );
    }

    final overallPercent = (chapters.fold<int>(0, (sum, c) => sum + c.percent) / chapters.length).round();
    final totalLessons = chapters.fold<int>(0, (sum, c) => sum + c.lessonCount);
    final isExamPassed = (_finalExam?.passed ?? false) || (overallPercent == 100);

    final visibleChapters = <(int, ChapterProgress)>[
      for (final (index, ch) in chapters.indexed)
        if (_filter == ChapterListFilter.all ||
            (_filter == ChapterListFilter.completed && ch.isCompleted) ||
            (_filter == ChapterListFilter.inProgress && ch.isInProgress))
          (index, ch),
    ];

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // Banner Hero: Course Overview matching prototype
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF7C3AED)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Pill badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'COURSE OVERVIEW',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Course Title
                Text(
                  widget.courseTitle,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${chapters.length} chapters · $totalLessons Total Lessons',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 20),

                // Course Progress Bar
                Row(
                  children: [
                    Text(
                      'Course Progress',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.95),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '$overallPercent%',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: overallPercent / 100,
                    minHeight: 8,
                    backgroundColor: Colors.black.withValues(alpha: 0.2),
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Filter Segment Tabs
          Row(
            children: [
              _buildFilterTab('All chapters', ChapterListFilter.all),
              const SizedBox(width: 8),
              _buildFilterTab('In progress', ChapterListFilter.inProgress),
              const SizedBox(width: 8),
              _buildFilterTab('Completed', ChapterListFilter.completed),
            ],
          ),

          const SizedBox(height: 20),

          // Course Chapters Section Header
          Builder(
            builder: (context) {
              final surfaces = aimSurfacesOf(context);
              return Row(
                children: [
                  Text(
                    'Course Chapters',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textPrimary,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${chapters.length} chapters',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: surfaces.textMuted,
                    ),
                  ),
                ],
              );
            },
          ),

          const SizedBox(height: 14),

          // Chapters List (Expandable Accordion Cards)
          for (final (index, chapter) in visibleChapters) ...[
            _ExpandableChapterCard(chapter: chapter, index: index),
            const SizedBox(height: 12),
          ],

          const SizedBox(height: 16),

          // Next Up Locked Course Card or Final Exam Card
          if (_filter == ChapterListFilter.all ||
              (_filter == ChapterListFilter.inProgress && !isExamPassed) ||
              (_filter == ChapterListFilter.completed && isExamPassed))
            _buildNextUpCard(isExamPassed: isExamPassed),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String label, ChapterListFilter filter) {
    final isSelected = _filter == filter;
    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);
    return InkWell(
      onTap: () => setState(() => _filter = filter),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        decoration: BoxDecoration(
          color: isSelected ? colorScheme.primary : surfaces.surfaceSunken,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? colorScheme.primary : surfaces.border,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: colorScheme.primary.withValues(alpha: 0.2),
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
            color: isSelected ? Colors.white : surfaces.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildNextUpCard({bool isExamPassed = false}) {
    final surfaces = aimSurfacesOf(context);
    final exam = _finalExam;

    if (exam == null) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: surfaces.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: surfaces.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.lock_outline_rounded, size: 16, color: surfaces.textSecondary),
                const SizedBox(width: 6),
                Text(
                  'NEXT UP · LOCKED COURSE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: surfaces.textSecondary,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Next Course Level',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: surfaces.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Unlocks automatically once you complete all chapters in this course.',
              style: TextStyle(
                fontSize: 13,
                color: surfaces.textSecondary,
                height: 1.3,
              ),
            ),
          ],
        ),
      );
    }

    final isPassed = exam.passed || isExamPassed;
    final isUnlocked = exam.unlocked || isPassed;

    final cardBg = isPassed
        ? const Color(0xFFDCFCE7)
        : (isUnlocked ? AimColors.primary500.withValues(alpha: 0.06) : surfaces.surface);
    final borderColor = isPassed
        ? const Color(0xFF22C55E)
        : (isUnlocked ? AimColors.primary500 : surfaces.border);
    final badgeColor = isPassed
        ? const Color(0xFF16A34A)
        : (isUnlocked ? const Color(0xFFD97706) : surfaces.textSecondary);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isUnlocked
            ? () {
                if (isPassed) {
                  context.push(
                    AppRoutePaths.assessmentResultHistory,
                    extra: {'assessmentId': exam.assessmentId},
                  );
                } else {
                  context.push(
                    AppRoutePaths.assessmentDetail,
                    extra: {
                      'assessmentId': exam.assessmentId,
                      'assessmentTitle': exam.title,
                    },
                  );
                }
              }
            : null,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: borderColor,
              width: (isUnlocked || isPassed) ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: surfaces.textPrimary.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isPassed
                              ? Icons.check_circle_rounded
                              : (isUnlocked
                                  ? Icons.emoji_events_rounded
                                  : Icons.lock_outline_rounded),
                          size: 16,
                          color: badgeColor,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          isPassed
                              ? 'FINAL EXAM PASSED · ${exam.score ?? 100}%'
                              : 'FINAL LEVEL EXAM',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: badgeColor,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      exam.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isPassed
                          ? 'Final level exam completed and passed.'
                          : (isUnlocked
                              ? 'Tap to start your final level exam.'
                              : 'Complete all chapters in this level to unlock your final level assessment.'),
                      style: TextStyle(
                        fontSize: 13,
                        color: isPassed
                            ? const Color(0xFF15803D)
                            : (isUnlocked
                                ? AimColors.primary500
                                : surfaces.textSecondary),
                        height: 1.3,
                        fontWeight: (isUnlocked || isPassed)
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              if (isUnlocked || isPassed)
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 18,
                  color: isPassed ? const Color(0xFF16A34A) : AimColors.primary500,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExpandableChapterCard extends ConsumerStatefulWidget {
  const _ExpandableChapterCard({
    required this.chapter,
    required this.index,
  });

  final ChapterProgress chapter;
  final int index;

  @override
  ConsumerState<_ExpandableChapterCard> createState() => _ExpandableChapterCardState();
}

class _ExpandableChapterCardState extends ConsumerState<_ExpandableChapterCard> {
  late bool _isExpanded;
  List<LessonProgress>? _lessons;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.chapter.isInProgress;
    if (_isExpanded) {
      _fetchLessons();
    }
  }

  Future<void> _fetchLessons() async {
    if (_lessons != null || _isLoading) return;
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final repository = ref.read(lessonsRepositoryProvider);
      final list = await repository.getLessonsWithProgress(
        bearerToken: token,
        chapterId: widget.chapter.chapterId,
      );
      if (mounted) {
        setState(() {
          _lessons = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _toggleExpand() {
    setState(() => _isExpanded = !_isExpanded);
    if (_isExpanded && _lessons == null) {
      _fetchLessons();
    }
  }

  String _getSkillKind(String title, int index) {
    final lower = title.toLowerCase();
    if (lower.contains('speak') || lower.contains('talk') || lower.contains('pronounc') || lower.contains('voice')) {
      return 'SPEAKING';
    } else if (lower.contains('listen') || lower.contains('audio') || lower.contains('hear')) {
      return 'LISTENING';
    } else if (lower.contains('vocab') || lower.contains('word') || lower.contains('phrase') || lower.contains('name') || lower.contains('greeting')) {
      return 'VOCAB';
    } else if (lower.contains('grammar') || lower.contains('rule') || lower.contains('verb') || lower.contains('sentence')) {
      return 'GRAMMAR';
    }
    const kinds = ['LISTENING', 'SPEAKING', 'VOCAB', 'GRAMMAR'];
    return kinds[index % kinds.length];
  }

  IconData _getSkillIcon(String skillKind, bool completed, bool isCurrent) {
    if (completed) return Icons.check_rounded;
    if (skillKind == 'SPEAKING') return Icons.mic_none_rounded;
    if (skillKind == 'LISTENING') return Icons.headphones_rounded;
    if (skillKind == 'VOCAB') return Icons.style_rounded;
    return Icons.menu_book_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final chapter = widget.chapter;
    final index = widget.index;
    final isCompleted = chapter.isCompleted;
    final isLocked = chapter.status == 'locked';
    final chNum = index + 1;
    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);

    return Container(
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: surfaces.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: surfaces.textPrimary.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Chapter Header Tile
          InkWell(
            onTap: _toggleExpand,
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Chapter Number Badge
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? const Color(0xFF10B981)
                          : (isLocked ? surfaces.surfaceSunken : colorScheme.primaryContainer),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: isCompleted
                          ? [
                              BoxShadow(
                                color: const Color(0xFF10B981).withValues(alpha: 0.25),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(Icons.check_rounded, color: Colors.white, size: 24)
                          : Text(
                              'Ch.$chNum',
                              style: TextStyle(
                                color: isLocked ? surfaces.textMuted : colorScheme.primary,
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Title & Description & Progress Bar
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                chapter.title,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: isLocked ? surfaces.textMuted : surfaces.textPrimary,
                                  letterSpacing: -0.2,
                                ),
                              ),
                            ),
                            if (isCompleted)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDCFCE7),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'DONE',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF166534),
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              )
                            else if (chapter.isInProgress)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: colorScheme.primaryContainer,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'IN PROGRESS',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: colorScheme.primary,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              )
                            else if (isLocked)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: surfaces.surfaceSunken,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'LOCKED',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: surfaces.textMuted,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        if (chapter.description != null && chapter.description!.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Text(
                            chapter.description!,
                            style: TextStyle(
                              fontSize: 12,
                              color: surfaces.textSecondary,
                              height: 1.3,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: 12),

                        // Progress Bar + Expand Chevron
                        Row(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: chapter.lessonCount > 0
                                      ? (chapter.completedLessonCount / chapter.lessonCount)
                                      : 0,
                                  minHeight: 6,
                                  backgroundColor: surfaces.surfaceSunken,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    isCompleted
                                        ? const Color(0xFF10B981)
                                        : colorScheme.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              '${chapter.completedLessonCount}/${chapter.lessonCount} lessons',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: surfaces.textSecondary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: surfaces.surfaceSunken,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _isExpanded
                                    ? Icons.keyboard_arrow_up_rounded
                                    : Icons.keyboard_arrow_down_rounded,
                                size: 18,
                                color: surfaces.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Expanded Lessons List Section
          if (_isExpanded) ...[
            Divider(height: 1, color: surfaces.border.withValues(alpha: 0.6)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LESSONS IN THIS CHAPTER',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (_isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  else if (_lessons == null || _lessons!.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        'No lessons available in this chapter.',
                        style: TextStyle(
                          fontSize: 13,
                          color: surfaces.textMuted,
                        ),
                      ),
                    )
                  else
                    for (final (lIndex, lesson) in _lessons!.indexed) ...[
                      Builder(
                        builder: (context) {
                          final skillKind = _getSkillKind(lesson.title, lIndex);
                          final iconData = _getSkillIcon(skillKind, lesson.completed, lesson.current);
                          final lessonNum = lIndex + 1;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            decoration: BoxDecoration(
                              color: lesson.current
                                  ? colorScheme.primaryContainer.withValues(alpha: 0.3)
                                  : surfaces.surfaceSunken.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: lesson.current
                                    ? colorScheme.primary.withValues(alpha: 0.5)
                                    : (lesson.completed
                                        ? const Color(0xFF10B981).withValues(alpha: 0.3)
                                        : surfaces.border),
                                width: lesson.current ? 1.5 : 1.0,
                              ),
                            ),
                            child: InkWell(
                              onTap: () {
                                context.push(
                                  AppRoutePaths.lessonDetail,
                                  extra: {
                                    'lessonId': lesson.id,
                                    'lessonTitle': lesson.title,
                                  },
                                );
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  children: [
                                    // Lesson Icon Pill matching screenshot
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: lesson.completed
                                            ? const Color(0xFFD1FAE5)
                                            : (lesson.current
                                                ? colorScheme.primaryContainer
                                                : surfaces.surface),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      alignment: Alignment.center,
                                      child: Icon(
                                        iconData,
                                        size: 20,
                                        color: lesson.completed
                                            ? const Color(0xFF10B981)
                                            : (lesson.current
                                                ? colorScheme.primary
                                                : surfaces.textSecondary),
                                      ),
                                    ),
                                    const SizedBox(width: 12),

                                    // Lesson Title & Kind Pills
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                'LESSON $lessonNum',
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w800,
                                                  color: surfaces.textMuted,
                                                  letterSpacing: 0.5,
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 1.5,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: colorScheme.primary.withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  skillKind,
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w800,
                                                    color: colorScheme.primary,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            lesson.title,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w700,
                                              color: surfaces.textPrimary,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Trailing chevron
                                    Icon(
                                      Icons.chevron_right_rounded,
                                      size: 20,
                                      color: surfaces.textMuted,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
