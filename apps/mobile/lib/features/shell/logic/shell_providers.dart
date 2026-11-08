import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/backend_api_paths.dart';
import '../../auth/logic/provider/auth_token_interceptor_provider.dart';

/// The student's current day streak for the top bar, from the backend.
/// Kept for the whole session and refreshed by the app chrome at most once a
/// minute (see `AppChrome`), so moving between pages does not add a request
/// each time. It is only a convenience: any failure is `null` and the top bar
/// simply hides the streak.
final streakDaysProvider = FutureProvider<int?>(
  (ref) async {
    try {
      final client = ref.watch(authenticatedBackendApiClientProvider);
      final envelope = await client.get<int?>(
        BackendApiPaths.engagementSummary,
        decodeData: (json) {
          final goal = (json as Map<String, dynamic>?)?['goal'];
          final days = goal is Map<String, dynamic> ? goal['streakDays'] : null;
          return days is num ? days.toInt() : null;
        },
      );
      return envelope.data;
    } catch (_) {
      return null;
    }
  },
);

/// When the top bar's streak and unread count were last refreshed.
final chromeLastRefreshProvider = StateProvider<DateTime?>((ref) => null);
