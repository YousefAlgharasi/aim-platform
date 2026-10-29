// NetworkStatus — app-wide "are we offline?" signal.
//
// Combines two sources, because neither is enough alone:
// - the device's connectivity (no Wi-Fi/mobile data at all), and
// - real request outcomes from BackendApiClient (Wi-Fi connected but no
//   internet, captive portals, backend unreachable).
// Any successful backend response marks the app online again.
//
// It also records whether a screen is showing saved (cached) data while
// offline, so the offline banner can say so.

import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

class NetworkStatusValue {
  const NetworkStatusValue({
    this.offline = false,
    this.showingSavedData = false,
  });

  final bool offline;

  /// True when at least one request was answered from the offline cache
  /// since the app last went offline.
  final bool showingSavedData;

  @override
  bool operator ==(Object other) =>
      other is NetworkStatusValue &&
      other.offline == offline &&
      other.showingSavedData == showingSavedData;

  @override
  int get hashCode => Object.hash(offline, showingSavedData);
}

class NetworkStatus extends ValueNotifier<NetworkStatusValue> {
  NetworkStatus() : super(const NetworkStatusValue());

  /// Shared instance used by the API clients and the offline UI.
  static final NetworkStatus instance = NetworkStatus();

  StreamSubscription<List<ConnectivityResult>>? _subscription;
  bool _deviceOffline = false;
  bool _requestsFailing = false;
  bool _servedFromCache = false;

  bool get isOffline => value.offline;

  /// Starts listening to device connectivity. Safe to call more than once.
  void startMonitoring([Connectivity? connectivity]) {
    if (_subscription != null) return;
    final source = connectivity ?? Connectivity();
    _subscription = source.onConnectivityChanged.listen(
      _onConnectivity,
      onError: (_) {},
    );
    source.checkConnectivity().then(_onConnectivity).catchError((_) {});
  }

  void _onConnectivity(List<ConnectivityResult> results) {
    _deviceOffline =
        results.isEmpty || results.every((r) => r == ConnectivityResult.none);
    if (!_deviceOffline) {
      // Let the next request decide whether the internet is really back.
      _requestsFailing = false;
    }
    _publish();
  }

  /// Called by BackendApiClient after a response arrives from the server.
  void reportReachable() {
    if (!_requestsFailing && !_servedFromCache) return;
    _requestsFailing = false;
    _servedFromCache = false;
    _publish();
  }

  /// Called by BackendApiClient when a request failed to reach the server.
  void reportUnreachable() {
    if (_requestsFailing) return;
    _requestsFailing = true;
    _publish();
  }

  /// Called when an offline request was answered from saved data.
  void reportServedFromCache() {
    _requestsFailing = true;
    if (_servedFromCache) return;
    _servedFromCache = true;
    _publish();
  }

  void _publish() {
    final offline = _deviceOffline || _requestsFailing;
    value = NetworkStatusValue(
      offline: offline,
      showingSavedData: offline && _servedFromCache,
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
