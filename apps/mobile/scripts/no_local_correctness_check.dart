#!/usr/bin/env dart
// Phase 6 — P6-092
// Flutter no-local-correctness regression check.
//
// Purpose:
//   Prove that the Flutter question_answer feature directory contains no
//   forbidden local correctness evaluation logic, as required by the Phase 6
//   no-client-authority rule (P6-004) and the Phase 4 no-client-side-scoring
//   rule (P4-035).
//
// This script scans all Dart files under apps/mobile/lib/features/question_answer/
// and fails if any forbidden local correctness patterns are found.
//
// Run from the repo root:
//   dart apps/mobile/scripts/no_local_correctness_check.dart
//
// Exit codes:
//   0 — PASS: no forbidden patterns found
//   1 — FAIL: forbidden correctness logic detected
//
// Forbidden patterns (Phase 6 §P6-004, §P6-092):
//   - Local answer comparison against correct_answer / correctAnswer
//   - Local score accumulation from answer correctness
//   - Correctness gate on UI (e.g. if isCorrect show green else show red)
//   - Sending isCorrect in a submit request
//   - Deriving mastery / score locally from correct/total
//   - Accessing correct_answer or correctAnswer from question options
//   - Storing is_correct in local prefs / cache
//
// Note: AttemptResult.isCorrect is ALLOWED — it is a backend-supplied
//       display-only field. The forbidden patterns below target logic that
//       EVALUATES or COMPUTES correctness locally.

import 'dart:io';

const _qaDir = 'apps/mobile/lib/features/question_answer';

// ---------------------------------------------------------------------------
// Forbidden patterns — each entry is [regex, reason]
// ---------------------------------------------------------------------------
const _forbiddenPatterns = <(String, String)>[
  // Sending isCorrect in a *request* toJson — detect adding isCorrect to
  // AttemptSubmitRequestModel or any outbound payload.
  // Note: AttemptSubmitResponseModel.toJson is allowed (response serialisation).
  // Pattern targets Request-model toJson blocks.
  (
    r'''AttemptSubmitRequestModel.*isCorrect|isCorrect.*AttemptSubmitRequestModel''',
    'isCorrect referenced on AttemptSubmitRequestModel — correctness must never be sent by Flutter',
  ),

  // Storing isCorrect in local preferences / secure storage
  (
    r'prefs\.(setString|setBool|setInt|setDouble).*[Cc]orrect',
    'isCorrect stored in local prefs — backend-evaluated fields must not be cached locally',
  ),
  (
    r'secureStorage\.write.*[Cc]orrect',
    'isCorrect stored in secure storage — backend-evaluated fields must not be cached locally',
  ),

  // Accessing correct_answer / correctAnswer from question or answer option
  (
    r'\.correctAnswer\b',
    'correctAnswer accessed on option/question entity — Flutter never receives the correct answer for options',
  ),
  (
    r'''['"](correct_answer|correctAnswer)['"]\s*''',
    'correct_answer / correctAnswer key referenced — Flutter options must never expose the correct answer',
  ),

  // Local comparison that derives correctness
  (
    r'selectedOptionId\s*==\s*correct',
    'selectedOptionId compared to correct value — correctness is backend-only',
  ),
  (
    r'writtenAnswer\s*==\s*correct',
    'writtenAnswer compared to correct value — correctness is backend-only',
  ),
  (
    r'answerValue\s*==\s*correct',
    'answerValue compared to correct value — correctness is backend-only',
  ),

  // Score accumulation from correctness
  (
    r'correctCount\s*\+',
    'correctCount accumulation — Flutter never tallies correct answers locally',
  ),
  (
    r'score\s*\+=',
    'score += pattern — Flutter never accumulates scores locally',
  ),
  (
    r'numCorrect\s*[\+\-\*\/]=',
    'numCorrect mutation — Flutter never computes correct totals locally',
  ),

  // Mastery / ratio derived from correct/total counts
  (
    r'correct\s*/\s*total',
    'correct/total ratio — mastery is backend-computed; Flutter never divides correct by total',
  ),
  (
    r'numCorrect\s*/\s*num',
    'numCorrect/numX ratio — mastery is backend-computed',
  ),

  // isCorrect used as a UI gate (beyond display)
  (
    r'if\s*\(\s*.*isCorrect.*&&',
    'isCorrect used as a compound condition gate — it must only drive display text/icon, never branch logic',
  ),
  (
    r'isCorrect\s*\?\s*.*(score|mastery|level|grade|point|rank)',
    'isCorrect ternary leading to score/mastery — correctness must not drive Flutter-side numeric derivation',
  ),

  // Threshold constants that imply local scoring
  (
    r'correctnessThreshold',
    'correctnessThreshold constant — thresholds are backend config only',
  ),
  (
    r'passingScore\s*=',
    'passingScore constant — passing thresholds are backend config only',
  ),
];

// ---------------------------------------------------------------------------
// Files that are allowed to reference these terms (check script itself, docs)
// ---------------------------------------------------------------------------
const _allowedFiles = <String>{
  'apps/mobile/scripts/no_local_correctness_check.dart',
};

void main() {
  final dir = Directory(_qaDir);
  if (!dir.existsSync()) {
    stderr.writeln('ERROR: Question/answer directory not found: $_qaDir');
    exit(1);
  }

  final dartFiles = dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'))
      .toList();

  if (dartFiles.isEmpty) {
    stderr.writeln('ERROR: No Dart files found in $_qaDir');
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

  stdout.writeln('=== P6-092 Flutter No-Local-Correctness Check ===');
  stdout.writeln('Scanned ${dartFiles.length} Dart files in $_qaDir');
  stdout.writeln();

  if (violations == 0) {
    stdout.writeln('RESULT: PASS');
    stdout.writeln('No forbidden local correctness patterns found.');
    stdout.writeln();
    stdout.writeln('Verified rules (P6-004, P6-092):');
    stdout.writeln(
      '  ✓ isCorrect never sent in Flutter request payloads',
    );
    stdout.writeln(
      '  ✓ correct_answer / correctAnswer never accessed on options',
    );
    stdout.writeln(
      '  ✓ No local answer-vs-correct comparisons',
    );
    stdout.writeln(
      '  ✓ No score accumulation from correct/total',
    );
    stdout.writeln(
      '  ✓ No mastery ratio derived locally',
    );
    stdout.writeln(
      '  ✓ isCorrect not used as compound logic gate',
    );
    stdout.writeln(
      '  ✓ No passing-score or correctness-threshold constants',
    );
    stdout.writeln(
      '  ✓ isCorrect not cached in local preferences or secure storage',
    );
    exit(0);
  } else {
    stdout.writeln('RESULT: FAIL — $violations violation(s) found\n');
    stdout.write(report.toString());
    stdout.writeln(
      'Fix: Remove all forbidden local correctness logic from Flutter. '
      'Backend is the sole authority for answer correctness, scoring, '
      'mastery, and grades (P6-004, P6-092).',
    );
    exit(1);
  }
}
