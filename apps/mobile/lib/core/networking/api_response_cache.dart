// ApiResponseCache — on-device copies of backend GET responses.
//
// Used by BackendApiClient for two things:
// 1. Offline: when a GET can't reach the server, the last saved response is
//    shown instead of an error.
// 2. Fewer downloads: a response saved in the last [freshFor] is reused
//    without a network call, unless the app has changed something since
//    (any successful POST/PUT/PATCH/DELETE marks every saved response as
//    stale, so progress never looks out of date after completing a lesson).
//    Nothing saved before this app session counts as fresh, so every launch
//    still loads current data when online.
//
// Saved responses are scoped to the signed-in user (from the token's `sub`
// claim) and wiped on sign-out. Auth endpoints are never saved.

import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

class CachedApiResponse {
  const CachedApiResponse({required this.body, required this.savedAt});

  final String body;
  final DateTime savedAt;
}

class ApiResponseCache {
  ApiResponseCache({
    Future<Directory> Function()? directoryProvider,
    this.freshFor = const Duration(seconds: 60),
    this.maxEntries = 400,
    DateTime Function()? clock,
  })  : _directoryProvider = directoryProvider ?? _defaultDirectory,
        _clock = clock ?? DateTime.now {
    _staleBefore = _clock();
  }

  static Future<Directory> _defaultDirectory() async {
    final base = await getApplicationSupportDirectory();
    return Directory('${base.path}/api_cache');
  }

  /// Shared instance used by the app's API clients.
  static final ApiResponseCache instance = ApiResponseCache();

  final Future<Directory> Function() _directoryProvider;
  final DateTime Function() _clock;
  final Duration freshFor;
  final int maxEntries;

  /// Responses saved before this moment are never treated as fresh.
  late DateTime _staleBefore;
  Directory? _directory;

  static const _neverCachedPrefixes = ['/auth/'];

  /// Whether responses for [path] may be saved at all.
  static bool isCacheable(String path) =>
      !_neverCachedPrefixes.any((prefix) => path.startsWith(prefix));

  /// Cache key for [uri] as seen by the user behind [authorization]
  /// (a `Bearer <jwt>` header value, or null when signed out).
  static String keyFor(Uri uri, String? authorization) {
    return '${_userScope(authorization)}|$uri';
  }

  static String _userScope(String? authorization) {
    if (authorization == null || !authorization.startsWith('Bearer ')) {
      return 'anon';
    }
    final parts = authorization.substring(7).split('.');
    if (parts.length != 3) return 'anon';
    try {
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      );
      final sub = payload is Map ? payload['sub'] : null;
      return sub is String && sub.isNotEmpty ? sub : 'anon';
    } catch (_) {
      return 'anon';
    }
  }

  /// Marks every saved response as stale (still usable offline).
  void markStale() {
    _staleBefore = _clock();
  }

  bool isFresh(CachedApiResponse cached) {
    return cached.savedAt.isAfter(_staleBefore) &&
        _clock().difference(cached.savedAt) < freshFor;
  }

  Future<CachedApiResponse?> read(String key) async {
    try {
      final file = await _fileFor(key);
      if (!await file.exists()) return null;
      final decoded = jsonDecode(await file.readAsString());
      if (decoded is! Map<String, dynamic> || decoded['key'] != key) return null;
      return CachedApiResponse(
        body: decoded['body'] as String,
        savedAt: DateTime.parse(decoded['savedAt'] as String),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> write(String key, String body) async {
    // Timestamp when the response arrived, not when the disk write finishes.
    final savedAt = _clock();
    try {
      final file = await _fileFor(key);
      await file.writeAsString(jsonEncode({
        'key': key,
        'savedAt': savedAt.toIso8601String(),
        'body': body,
      }));
      await _trim();
    } catch (e) {
      debugPrint('ApiResponseCache write failed: $e');
    }
  }

  /// Deletes every saved response (sign-out).
  Future<void> clear() async {
    try {
      final dir = await _dir();
      if (await dir.exists()) await dir.delete(recursive: true);
    } catch (_) {}
    _directory = null;
  }

  Future<Directory> _dir() async {
    final existing = _directory;
    if (existing != null) return existing;
    final dir = await _directoryProvider();
    if (!await dir.exists()) await dir.create(recursive: true);
    return _directory = dir;
  }

  Future<File> _fileFor(String key) async {
    final dir = await _dir();
    return File('${dir.path}/${stableHash(key)}.json');
  }

  /// Keeps the cache to [maxEntries] files, dropping the oldest first.
  Future<void> _trim() async {
    final dir = await _dir();
    final files = await dir.list().where((e) => e is File).cast<File>().toList();
    if (files.length <= maxEntries) return;
    final stats = await Future.wait(files.map((f) async => (f, await f.lastModified())));
    stats.sort((a, b) => a.$2.compareTo(b.$2));
    for (final (file, _) in stats.take(files.length - maxEntries)) {
      try {
        await file.delete();
      } catch (_) {}
    }
  }
}

/// 64-bit FNV-1a hash as hex — stable across app runs (unlike
/// [Object.hashCode]), used for cache file names.
String stableHash(String input) {
  var hash = 0xcbf29ce484222325;
  const prime = 0x100000001b3;
  for (final unit in utf8.encode(input)) {
    hash ^= unit;
    hash = (hash * prime) & 0xFFFFFFFFFFFFFFFF;
  }
  return hash.toUnsigned(64).toRadixString(16).padLeft(16, '0');
}
