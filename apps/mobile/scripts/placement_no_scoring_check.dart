#!/usr/bin/env dart
// Phase 4 — P4-070
// Flutter no-placement-scoring regression check.
//
// Purpose:
//   Prove that the Flutter placement feature directory contains no forbidden
//   client-side scoring logic as required by P4-035 (no-client-side-placement-scoring.md).
//
// This script scans all Dart files under apps/mobile/lib/features/placement/
// and fails if any forbidden scoring patterns are found.
//
// Run from the repo root:
//   dart apps/mobile/scripts/placement_no_scoring_check.dart
//
// Exit codes:
//   0 — PASS: no forbidden patterns found
//   1 — FAIL: forbidden scoring logic detected
//
// Forbidden patterns (from P4-035 §4):
//   - Score threshold constants (e.g. >= 0.75, >= 0.40, > 70, b1Threshold)
//   - Section weight constants (e.g. grammarWeight, 0.30, 0.25)
//   - Signal computation functions (e.g. computeSignal, _signal(score))
//   - Level-mapping functions (e.g. mapScoreToLevel, scoreToLevel)
//   - Section mastery calculation (e.g. correct / total as mastery)
//   - Weakness ranking logic (e.g. sortByMastery, rankWeaknesses)
//   - Initial path derivation logic (e.g. deriveInitialPath)
//   - Cached placement score in local storage (e.g. prefs.setDouble.*score)
//
// Note: This check is a static grep — it does not run the Flutter app.
// It catches obvious violations; code review remains the authoritative check.

import 'dart:io';

const _placementDir = 'apps/mobile/lib/features/placement';

// ---------------------------------------------------------------------------
// Forbidden patterns — each entry is [pattern, reason]
// ---------------------------------------------------------------------------
const _forbiddenPatterns = <(String, String)>[
  // Threshold constants (exact values that match scoring config)
  (r'>= 0\.75', 'Signal threshold constant (strong boundary) — backend config only'),
  (r'>= 0\.40', 'Signal threshold constant (developing boundary) — backend config only'),
  (r'> 0\.75', 'Signal threshold constant — backend config only'),
  (r'> 0\.40', 'Signal threshold constant — backend config only'),
  (r'b1Threshold', 'Level threshold constant — backend config only'),
  (r'a2Threshold', 'Level threshold constant — backend config only'),
  (r'a1Threshold', 'Level threshold constant — backend config only'),
  (r'emergingThreshold', 'Signal threshold constant — backend config only'),
  (r'developingThreshold', 'Signal threshold constant — backend config only'),
  (r'grammarWeight', 'Section weight constant — backend config only'),
  (r'vocabularyWeight', 'Section weight constant — backend config only'),
  (r'sectionWeight', 'Section weight constant — backend config only'),
  // Scoring functions
  (r'computeSignal', 'Skill signal computation function — backend only'),
  (r'mapScoreToLevel', 'Level-mapping function — backend only'),
  (r'scoreToLevel', 'Level-mapping function — backend only'),
  (r'deriveLevel', 'Level derivation function — backend only'),
  (r'deriveInitialPath', 'Initial path derivation — backend only'),
  (r'rankWeaknesses', 'Weakness ranking function — backend only'),
  (r'sortByMastery', 'Mastery sort function — backend only'),
  // Local mastery computation (correctAnswers / totalQuestions used as score)
  (r'correctAnswers\s*/\s*totalQuestions', 'Local mastery ratio computation — backend only'),
  (r'correct\s*/\s*total\b', 'Local mastery ratio computation — backend only'),
  // Local score storage
  (r'prefs\.setDouble.*[Ss]core', 'Placement score stored locally — forbidden'),
  (r'SharedPreferences.*[Ss]core', 'Placement score in SharedPreferences — forbidden'),
];

// Files allowed to reference threshold values (e.g. this check script itself,
// docs, and the no-scoring rule document).
const _allowedFiles = <String>{
  'apps/mobile/scripts/placement_no_scoring_check.dart',
};

void main() {
  final dir = Directory(_placementDir);
  if (!dir.existsSync()) {
    stderr.writeln('ERROR: Placement directory not found: $_placementDir');
    exit(1);
  }

  final dartFiles = dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'))
      .toList();

  if (dartFiles.isEmpty) {
    stderr.writeln('ERROR: No Dart files found in $_placementDir');
    exit(1);
  }

  var violations = 0;
  final report = StringBuffer();

  for (final file in dartFiles) {
    final relativePath = file.path.replaceFirst(RegExp(r'^.*aim-platform/'), '');
    if (_allowedFiles.contains(relativePath)) continue;

    final lines = file.readAsLinesSync();
    for (var i = 0; i < lines.length; i++) {
      final line = lines[i];
      // Skip full-line comments
      final trimmed = line.trimLeft();
      if (trimmed.startsWith('//')) continue;

      for (final (pattern, reason) in _forbiddenPatterns) {
        if (RegExp(pattern).hasMatch(line)) {
          violations++;
          report.writeln(
            '  VIOLATION [$violations]: $relativePath:${i + 1}',
          );
          report.writeln('    Line   : ${line.trim()}');
          report.writeln('    Pattern: $pattern');
          report.writeln('    Reason : $reason');
          report.writeln();
        }
      }
    }
  }

  stdout.writeln('=== P4-070 Flutter No-Placement-Scoring Check ===');
  stdout.writeln('Scanned ${dartFiles.length} Dart files in $_placementDir');
  stdout.writeln();

  if (violations == 0) {
    stdout.writeln('RESULT: PASS');
    stdout.writeln('No forbidden placement scoring patterns found.');
    stdout.writeln();
    stdout.writeln('Verified rules (P4-035):');
    stdout.writeln('  ✓ No signal threshold constants in Flutter code');
    stdout.writeln('  ✓ No level-mapping functions');
    stdout.writeln('  ✓ No local mastery computation');
    stdout.writeln('  ✓ No section weight constants');
    stdout.writeln('  ✓ No weakness ranking logic');
    stdout.writeln('  ✓ No local placement score storage');
    exit(0);
  } else {
    stdout.writeln('RESULT: FAIL — $violations violation(s) found\n');
    stdout.write(report.toString());
    stdout.writeln(
      'Fix: Remove all forbidden scoring logic from Flutter. '
      'Backend is the sole authority for placement scores, levels, '
      'signals, weakness maps, and initial paths (P4-035).',
    );
    exit(1);
  }
}
