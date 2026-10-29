// MediaCache — on-device copies of downloaded audio.
//
// Question and lesson audio served by the backend doesn't change for a given
// URL, so BackendApiClient.getBytes keeps a copy and plays it from disk next
// time — no second download, and it works offline once heard. Capped at
// [maxEntries] files, oldest dropped first.

import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import 'api_response_cache.dart' show stableHash;

class MediaCache {
  MediaCache({
    Future<Directory> Function()? directoryProvider,
    this.maxEntries = 300,
  }) : _directoryProvider = directoryProvider ?? _defaultDirectory;

  static Future<Directory> _defaultDirectory() async {
    final base = await getApplicationSupportDirectory();
    return Directory('${base.path}/media_cache');
  }

  /// Shared instance used by the app's API clients.
  static final MediaCache instance = MediaCache();

  final Future<Directory> Function() _directoryProvider;
  final int maxEntries;
  Directory? _directory;

  Future<List<int>?> read(Uri uri) async {
    try {
      final file = await _fileFor(uri);
      if (!await file.exists()) return null;
      // Touch so trimming keeps recently played audio.
      await file.setLastModified(DateTime.now());
      return await file.readAsBytes();
    } catch (_) {
      return null;
    }
  }

  Future<void> write(Uri uri, List<int> bytes) async {
    if (bytes.isEmpty) return;
    try {
      final file = await _fileFor(uri);
      await file.writeAsBytes(bytes, flush: true);
      await _trim();
    } catch (e) {
      debugPrint('MediaCache write failed: $e');
    }
  }

  Future<Directory> _dir() async {
    final existing = _directory;
    if (existing != null) return existing;
    final dir = await _directoryProvider();
    if (!await dir.exists()) await dir.create(recursive: true);
    return _directory = dir;
  }

  Future<File> _fileFor(Uri uri) async {
    final dir = await _dir();
    return File('${dir.path}/${stableHash(uri.toString())}.bin');
  }

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
