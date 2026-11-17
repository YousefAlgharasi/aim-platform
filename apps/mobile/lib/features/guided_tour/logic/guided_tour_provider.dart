// Guided tour state: which tours this student has seen, and which tour the
// "?" button or Settings has asked to start. Display state only — nothing
// here is sent to or read from the backend.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/guided_tour_store.dart';
import '../data/tour_definitions.dart';

final guidedTourStoreProvider = Provider<GuidedTourStore>((ref) {
  return const GuidedTourStore();
});

/// A request to start a tour. [serial] makes asking for the same tour twice
/// in a row count as two requests.
class TourRequest {
  const TourRequest(this.tourId, this.serial);

  final String tourId;
  final int serial;
}

class GuidedTourState {
  const GuidedTourState({
    this.loaded = false,
    this.canRemember = true,
    this.seen = const {},
    this.request,
  });

  /// False until the saved flags have been read.
  final bool loaded;

  /// False when storage failed: tours then never start by themselves.
  final bool canRemember;
  final Set<String> seen;
  final TourRequest? request;

  bool isSeen(String tourId) => seen.contains(tourId);

  GuidedTourState copyWith({
    bool? loaded,
    bool? canRemember,
    Set<String>? seen,
    TourRequest? request,
    bool clearRequest = false,
  }) {
    return GuidedTourState(
      loaded: loaded ?? this.loaded,
      canRemember: canRemember ?? this.canRemember,
      seen: seen ?? this.seen,
      request: clearRequest ? null : (request ?? this.request),
    );
  }
}

// Not auto-disposed: a request made from Settings must survive the page change
// to the dashboard that follows it.
final guidedTourProvider = StateNotifierProvider.family<GuidedTourNotifier,
    GuidedTourState, String>((ref, userId) {
  return GuidedTourNotifier(
    userId: userId,
    store: ref.watch(guidedTourStoreProvider),
  );
});

class GuidedTourNotifier extends StateNotifier<GuidedTourState> {
  GuidedTourNotifier({required this.userId, required GuidedTourStore store})
      : _store = store,
        super(const GuidedTourState()) {
    _load();
  }

  final String userId;
  final GuidedTourStore _store;
  int _serial = 0;

  Future<void> _load() async {
    final seen = <String>{};
    var canRemember = true;
    for (final tour in tourDefinitions) {
      final value = await _store.hasSeen(userId, tour.id);
      if (value == null) {
        canRemember = false;
      } else if (value) {
        seen.add(tour.id);
      }
    }
    if (!mounted) return;
    state = state.copyWith(
      loaded: true,
      canRemember: canRemember,
      seen: {...state.seen, ...seen},
    );
  }

  /// Start a tour from anywhere (the "?" button, Settings).
  void start(String tourId) {
    state = state.copyWith(request: TourRequest(tourId, ++_serial));
  }

  /// The overlay took the request (or gave up on it).
  void clearRequest() {
    if (state.request == null) return;
    state = state.copyWith(clearRequest: true);
  }

  /// Closing a tour any way counts as seen.
  Future<void> markSeen(String tourId) async {
    state = state.copyWith(seen: {...state.seen, tourId});
    await _store.markSeen(userId, tourId);
  }
}
