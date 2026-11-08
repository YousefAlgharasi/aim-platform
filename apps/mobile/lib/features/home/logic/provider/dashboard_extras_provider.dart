// Data for the Home sections the web dashboard has beyond the core AIM ones:
// today's challenges, the streak freeze, and the leaderboard. Every value
// comes from the backend verbatim; nothing is computed here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';

/// One of today's challenges (lessons/streak, speaking, writing).
class DashboardChallenge {
  const DashboardChallenge({
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

  factory DashboardChallenge.fromJson(Map<String, dynamic> j) => DashboardChallenge(
        key: j['key']?.toString() ?? '',
        title: j['title']?.toString() ?? '',
        description: j['description']?.toString() ?? '',
        targetCount: (j['targetCount'] as num?)?.toInt() ?? 1,
        progressCount: (j['progressCount'] as num?)?.toInt() ?? 0,
        completed: j['completed'] == true,
      );
}

class StreakFreezeInfo {
  const StreakFreezeInfo({
    required this.allowance,
    required this.remaining,
    required this.atRisk,
    required this.canUseNow,
  });

  final int allowance;
  final int remaining;

  /// Yesterday was missed and the streak before it can still be saved.
  final bool atRisk;
  final bool canUseNow;

  factory StreakFreezeInfo.fromJson(Map<String, dynamic> j) => StreakFreezeInfo(
        allowance: (j['allowance'] as num?)?.toInt() ?? 0,
        remaining: (j['remaining'] as num?)?.toInt() ?? 0,
        atRisk: j['atRisk'] == true,
        canUseNow: j['canUseNow'] == true,
      );
}

class DashboardEngagementExtras {
  const DashboardEngagementExtras({this.challenges = const [], this.streakFreeze});

  /// Today's challenges. Older backends send a single `challenge`.
  final List<DashboardChallenge> challenges;

  /// Absent on older backends: the freeze banner then stays hidden.
  final StreakFreezeInfo? streakFreeze;

  static DashboardEngagementExtras fromJson(Object? json) {
    final m = json is Map<String, dynamic> ? json : const <String, dynamic>{};
    final list = m['challenges'];
    final single = m['challenge'];
    final challenges = list is List
        ? list.whereType<Map<String, dynamic>>().map(DashboardChallenge.fromJson).toList()
        : single is Map<String, dynamic>
            ? [DashboardChallenge.fromJson(single)]
            : <DashboardChallenge>[];
    final freeze = m['streakFreeze'];
    return DashboardEngagementExtras(
      challenges: challenges,
      streakFreeze: freeze is Map<String, dynamic> ? StreakFreezeInfo.fromJson(freeze) : null,
    );
  }
}

/// GET /student/engagement/summary again, read for the parts the Home goal
/// card does not use. Same URL as the Home load, so the API client shares the
/// one request.
final dashboardExtrasProvider =
    FutureProvider.autoDispose<DashboardEngagementExtras>((ref) async {
  final client = ref.watch(authenticatedBackendApiClientProvider);
  final envelope = await client.get<DashboardEngagementExtras>(
    BackendApiPaths.engagementSummary,
    decodeData: DashboardEngagementExtras.fromJson,
  );
  return envelope.data ?? const DashboardEngagementExtras();
});

/// POST /student/engagement/streak-freeze. Throws when the backend refuses.
Future<void> requestStreakFreeze(WidgetRef ref) async {
  final client = ref.read(authenticatedBackendApiClientProvider);
  await client.post<Object?>(
    '/student/engagement/streak-freeze',
    decodeData: (json) => json,
  );
  ref.invalidate(dashboardExtrasProvider);
}

class LeaderboardEntry {
  const LeaderboardEntry({
    required this.rank,
    required this.name,
    required this.xp,
    required this.isYou,
  });

  final int rank;

  /// First name and last initial; never the email.
  final String name;
  final int xp;
  final bool isYou;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> j) => LeaderboardEntry(
        rank: (j['rank'] as num?)?.toInt() ?? 0,
        name: j['name']?.toString() ?? '',
        xp: (j['xp'] as num?)?.toInt() ?? 0,
        isYou: j['isYou'] == true,
      );
}

class LeaderboardBoard {
  const LeaderboardBoard({required this.entries, this.you});

  final List<LeaderboardEntry> entries;

  /// The caller's own place; present even when outside [entries].
  final LeaderboardEntry? you;
}

/// Top students by XP: `week` (resets Monday) or `all`.
final leaderboardProvider = FutureProvider.autoDispose
    .family<LeaderboardBoard, ({String period, int limit})>((ref, args) async {
  final client = ref.watch(authenticatedBackendApiClientProvider);
  final envelope = await client.get<LeaderboardBoard>(
    '/student/engagement/leaderboard',
    queryParameters: {'period': args.period, 'limit': '${args.limit}'},
    decodeData: (json) {
      final m = json as Map<String, dynamic>? ?? const {};
      final entries = (m['entries'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(LeaderboardEntry.fromJson)
          .toList();
      final you = m['you'];
      return LeaderboardBoard(
        entries: entries,
        you: you is Map<String, dynamic> ? LeaderboardEntry.fromJson(you) : null,
      );
    },
  );
  return envelope.data ?? const LeaderboardBoard(entries: []);
});
