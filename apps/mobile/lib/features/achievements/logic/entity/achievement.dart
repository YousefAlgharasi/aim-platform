// Phase 13 — TASK-13
// Achievement — read-only entity for a backend-persisted achievement summary.
//
// Mirrors AchievementSummary (achievements.types.ts).
// All fields are backend-supplied verbatim. Flutter NEVER computes
// unlock criteria, XP, streaks, or milestone progress.

class Achievement {
  const Achievement({
    required this.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.category,
    required this.unlocked,
    required this.unlockedAt,
  });

  final String key;
  final String title;
  final String description;

  /// Material icon name string, backend-supplied. Displayed via an explicit
  /// name→IconData lookup in the UI layer; never evaluated dynamically.
  final String icon;

  final String category;

  /// Backend-computed unlock state. Flutter never derives this itself.
  final bool unlocked;

  /// ISO timestamp of when this achievement was unlocked, or null while
  /// locked. AIM/backend output; displayed verbatim.
  final String? unlockedAt;
}
