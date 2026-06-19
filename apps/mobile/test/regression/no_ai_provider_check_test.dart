// Phase 6 — P6-108
// no_ai_provider_check_test.dart
//
// Regression check: proves Flutter never calls an external AI provider directly.
//
// The AIM Platform rule (docs/phase-6/no-client-aim-ai-rule.md) requires that:
//   - No AI provider SDK is declared in pubspec.yaml.
//   - No Flutter source file imports an AI provider package.
//   - No Flutter source file contains a hardcoded AI provider endpoint URL.
//   - No API key pattern for known AI providers appears in Flutter source.
//
// All AI-related computation (scoring, feedback generation, recommendations)
// must originate from the NestJS backend or the Python AIM Engine. Flutter is
// a read-only consumer of backend-computed outputs.
//
// Covers:
//   1.  pubspec.yaml has no openai dependency.
//   2.  pubspec.yaml has no anthropic dependency.
//   3.  pubspec.yaml has no google_generativeai / generativeai dependency.
//   4.  pubspec.yaml has no langchain dependency.
//   5.  pubspec.yaml has no cohere dependency.
//   6.  No Dart source file imports an openai package.
//   7.  No Dart source file imports an anthropic package.
//   8.  No Dart source file imports a google_generativeai package.
//   9.  No Dart source file contains api.openai.com URL.
//   10. No Dart source file contains api.anthropic.com URL.
//   11. No Dart source file contains generativelanguage.googleapis.com URL.
//   12. No Dart source file contains api.cohere.ai URL.
//   13. No Dart source file contains api.huggingface.co URL.
//   14. No sk-... OpenAI key pattern in Dart source.
//   15. No ANTHROPIC_API_KEY literal in Dart source.

import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

// ── Helpers ────────────────────────────────────────────────────────────────────

/// Returns the contents of [pubspecPath] as a single string.
String _readPubspec() {
  final file = File('pubspec.yaml');
  if (!file.existsSync()) {
    // Fallback: when the test runner cwd differs, walk up to apps/mobile.
    final alt = File('apps/mobile/pubspec.yaml');
    if (alt.existsSync()) return alt.readAsStringSync();
    return '';
  }
  return file.readAsStringSync();
}

/// Collects all *.dart files under [root] recursively.
List<File> _dartFiles(String root) {
  final dir = Directory(root);
  if (!dir.existsSync()) {
    // Try relative from repo root.
    final alt = Directory('apps/mobile/$root');
    if (!alt.existsSync()) return [];
    return alt
        .listSync(recursive: true)
        .whereType<File>()
        .where((f) => f.path.endsWith('.dart'))
        .toList();
  }
  return dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'))
      .toList();
}

/// Returns true if any file in [files] contains [pattern] (case-insensitive).
bool _anyContains(List<File> files, String pattern) {
  final lower = pattern.toLowerCase();
  for (final f in files) {
    final content = f.readAsStringSync().toLowerCase();
    if (content.contains(lower)) return true;
  }
  return false;
}

/// Returns matching file paths for a diagnostic failure message.
List<String> _matching(List<File> files, String pattern) {
  final lower = pattern.toLowerCase();
  return files
      .where((f) => f.readAsStringSync().toLowerCase().contains(lower))
      .map((f) => f.path)
      .toList();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  late String pubspec;
  late List<File> sources;

  setUpAll(() {
    pubspec = _readPubspec();
    sources = _dartFiles('lib');
  });

  group('P6-108 — No Direct AI Provider Calls', () {
    // ── pubspec dependency checks ────────────────────────────────────────────

    test('1. pubspec has no openai dependency', () {
      expect(
        pubspec.contains('openai'),
        isFalse,
        reason: 'openai package must not appear in pubspec.yaml',
      );
    });

    test('2. pubspec has no anthropic dependency', () {
      expect(
        pubspec.contains('anthropic'),
        isFalse,
        reason: 'anthropic package must not appear in pubspec.yaml',
      );
    });

    test('3. pubspec has no google_generativeai / generativeai dependency', () {
      final hasGenerative = pubspec.contains('generativeai') ||
          pubspec.contains('google_ai') ||
          pubspec.contains('google_ml_kit');
      expect(
        hasGenerative,
        isFalse,
        reason: 'generativeai/google_ai packages must not appear in pubspec.yaml',
      );
    });

    test('4. pubspec has no langchain dependency', () {
      expect(
        pubspec.contains('langchain'),
        isFalse,
        reason: 'langchain package must not appear in pubspec.yaml',
      );
    });

    test('5. pubspec has no cohere dependency', () {
      expect(
        pubspec.contains('cohere'),
        isFalse,
        reason: 'cohere package must not appear in pubspec.yaml',
      );
    });

    // ── import checks ────────────────────────────────────────────────────────

    test('6. no Dart source imports an openai package', () {
      final matches = _matching(sources, "import 'package:openai");
      expect(
        matches,
        isEmpty,
        reason: 'openai import found in: ${matches.join(', ')}',
      );
    });

    test('7. no Dart source imports an anthropic package', () {
      final matches = _matching(sources, "import 'package:anthropic");
      expect(
        matches,
        isEmpty,
        reason: 'anthropic import found in: ${matches.join(', ')}',
      );
    });

    test('8. no Dart source imports a google_generativeai package', () {
      final matches = _matching(sources, "import 'package:google_generativeai");
      expect(
        matches,
        isEmpty,
        reason: 'google_generativeai import found in: ${matches.join(', ')}',
      );
    });

    // ── endpoint URL checks ──────────────────────────────────────────────────

    test('9. no Dart source contains api.openai.com URL', () {
      expect(
        _anyContains(sources, 'api.openai.com'),
        isFalse,
        reason: 'Hardcoded api.openai.com URL found in Flutter source',
      );
    });

    test('10. no Dart source contains api.anthropic.com URL', () {
      expect(
        _anyContains(sources, 'api.anthropic.com'),
        isFalse,
        reason: 'Hardcoded api.anthropic.com URL found in Flutter source',
      );
    });

    test('11. no Dart source contains generativelanguage.googleapis.com URL', () {
      expect(
        _anyContains(sources, 'generativelanguage.googleapis.com'),
        isFalse,
        reason: 'Hardcoded Gemini endpoint URL found in Flutter source',
      );
    });

    test('12. no Dart source contains api.cohere.ai URL', () {
      expect(
        _anyContains(sources, 'api.cohere.ai'),
        isFalse,
        reason: 'Hardcoded api.cohere.ai URL found in Flutter source',
      );
    });

    test('13. no Dart source contains api.huggingface.co URL', () {
      expect(
        _anyContains(sources, 'api.huggingface.co'),
        isFalse,
        reason: 'Hardcoded api.huggingface.co URL found in Flutter source',
      );
    });

    // ── API key pattern checks ───────────────────────────────────────────────

    test('14. no sk-... OpenAI key pattern in Dart source', () {
      // Detects literal "sk-" followed by alphanumerics (OpenAI key format).
      final matches = sources
          .where((f) => RegExp(r'sk-[A-Za-z0-9]{20,}').hasMatch(f.readAsStringSync()))
          .map((f) => f.path)
          .toList();
      expect(
        matches,
        isEmpty,
        reason: 'OpenAI key pattern found in: ${matches.join(', ')}',
      );
    });

    test('15. no ANTHROPIC_API_KEY literal in Dart source', () {
      expect(
        _anyContains(sources, 'ANTHROPIC_API_KEY'),
        isFalse,
        reason: 'ANTHROPIC_API_KEY literal found in Flutter source',
      );
    });
  });
}
