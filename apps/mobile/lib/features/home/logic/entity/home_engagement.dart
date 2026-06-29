// HomeEngagementGoal / HomeDailyChallenge — domain entities for the
// "Goal" and "Daily Challenge" Home screen sections.
//
// All values (targetLessons, completedToday, streakDays, progressCount,
// completed) are backend-computed. Flutter never computes streaks, goal
// progress, or challenge completion locally.

class HomeEngagementGoal {
  const HomeEngagementGoal({
    required this.targetLessons,
    required this.completedToday,
    required this.streakDays,
  });

  final int targetLessons;
  final int completedToday;
  final int streakDays;
}

class HomeDailyChallenge {
  const HomeDailyChallenge({
    required this.key,
    required this.title,
    required this.description,
    required this.targetCount,
    required this.progressCount,
    required this.completed,
  });

  final String key;
  final String title;
  final String description;
  final int targetCount;
  final int progressCount;
  final bool completed;
}
