// UI-ONLY PLACEHOLDER — visual progress mock for ChapterListPage/LessonListPage.
//
// The design mockups (docs/design/ui-for-all-system-mobile/screenshots/
// light|dark/07-screen.png and 08-screen.png) show per-student progress:
// a chapter completion %, a lesson count per chapter, a chapter-level
// "X/Y done" counter, and per-lesson type/duration/completion state.
//
// None of that exists on the backend today — ChapterModel/LessonModel only
// carry lifecycle `status` (draft/published/archived), not per-student
// progress (see chapter_model.dart / lesson_model.dart). Rather than leave
// the screens visually broken relative to the design, this file derives a
// deterministic, purely-cosmetic progress value from each item's position
// in the already-loaded (backend-ordered) list — it is NOT read from, or
// written to, any backend field, and must never be used for scoring,
// mastery, or AIM Engine logic.
//
// See apps/mobile/TODO_BACKEND_PROGRESS.md for the endpoints needed to
// replace this file with real data.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Cosmetic per-chapter progress used only until a real per-student
/// chapter-progress endpoint exists.
class ChapterProgressMock {
  const ChapterProgressMock({
    required this.percent,
    required this.lessonCount,
    required this.completed,
    required this.inProgress,
  });

  /// 0–100. Mock only.
  final int percent;

  /// Mock lesson count shown in the row (not the real lesson total).
  final int lessonCount;
  final bool completed;
  final bool inProgress;

  String get statusLabel {
    if (completed) return 'Completed';
    if (inProgress) return 'In progress';
    return 'Start';
  }

  /// Deterministic mock derived from [index]/[total] — first half of the
  /// list reads as completed, the next item as in-progress, the rest as
  /// not started. Purely cosmetic; never sourced from the backend.
  factory ChapterProgressMock.forIndex(int index, int total) {
    final completedCount = total > 1 ? (total / 2).floor() : 0;
    final lessonCount = 3 + ((index * 37 + 5) % 6);

    if (index < completedCount) {
      return ChapterProgressMock(
        percent: 100,
        lessonCount: lessonCount,
        completed: true,
        inProgress: false,
      );
    }
    if (index == completedCount) {
      return ChapterProgressMock(
        percent: 40,
        lessonCount: lessonCount,
        completed: false,
        inProgress: true,
      );
    }
    return ChapterProgressMock(
      percent: 0,
      lessonCount: lessonCount,
      completed: false,
      inProgress: false,
    );
  }
}

/// Filter tabs shown above the chapter list. Cosmetic — filters the
/// mock progress computed above, not any real backend field.
enum ChapterListFilter { all, inProgress, completed }

/// Cosmetic per-lesson type/duration/completion used only until a real
/// per-student lesson-progress endpoint exists.
class LessonProgressMock {
  const LessonProgressMock({
    required this.typeLabel,
    required this.typeIcon,
    required this.gradient,
    required this.durationMinutes,
    required this.completed,
    required this.current,
  });

  /// Mock lesson "type" label (e.g. "Grammar") — the backend has no such
  /// field; purely cosmetic, cycled by list position.
  final String typeLabel;
  final IconData typeIcon;
  final LinearGradient gradient;

  /// Mock duration in minutes — not sourced from the backend.
  final int durationMinutes;

  /// Mock completion — true for lessons "before" the current one.
  final bool completed;

  /// Mock "up next" marker — exactly one lesson per chapter is current.
  final bool current;

  static const _types = [
    ('Lesson', Icons.menu_book_outlined),
    ('Grammar', Icons.code_rounded),
    ('Practice', Icons.checklist_rounded),
    ('Listening', Icons.mic_none_rounded),
  ];

  static const _gradients = [
    AimGradients.gzHero,
    AimGradients.growth,
    AimGradients.gzFire,
    AimGradients.gzLime,
  ];

  /// Deterministic mock derived from [index]/[total] — the first half of
  /// the chapter's lessons read as completed, the next one as "current"
  /// (play button), the rest as upcoming. Purely cosmetic.
  factory LessonProgressMock.forIndex(int index, int total) {
    final completedCount = total > 1 ? (total / 2).ceil() : 0;
    final (typeLabel, typeIcon) = _types[index % _types.length];

    return LessonProgressMock(
      typeLabel: typeLabel,
      typeIcon: typeIcon,
      gradient: _gradients[index % _gradients.length],
      durationMinutes: 3 + ((index * 11 + 2) % 6),
      completed: index < completedCount,
      current: index == completedCount,
    );
  }
}
