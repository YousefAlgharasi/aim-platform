import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// P10-065: Verify that the mobile app does NOT perform local grading.
///
/// All grading logic (score calculation, pass/fail determination, correctness
/// evaluation, deadline enforcement, late penalties, and attempt eligibility)
/// must live on the server. The mobile client should only display values
/// received from the API.
void main() {
  /// Collect all Dart source files under the assessments feature directory.
  late List<File> sourceFiles;

  setUpAll(() {
    final assessmentsDir = Directory('lib/features/assessments');
    if (!assessmentsDir.existsSync()) {
      // If the directory doesn't exist yet, tests will trivially pass
      // since there is no code that could violate the rule.
      sourceFiles = [];
      return;
    }
    sourceFiles = assessmentsDir
        .listSync(recursive: true)
        .whereType<File>()
        .where((f) => f.path.endsWith('.dart'))
        .toList();
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Returns every (file, line number, line) triple matching [pattern].
  List<({File file, int lineNumber, String line})> findViolations(
    RegExp pattern,
  ) {
    final violations = <({File file, int lineNumber, String line})>[];
    for (final file in sourceFiles) {
      final lines = file.readAsLinesSync();
      for (var i = 0; i < lines.length; i++) {
        final line = lines[i];
        // Skip comments and imports.
        final trimmed = line.trimLeft();
        if (trimmed.startsWith('//') || trimmed.startsWith('import ')) {
          continue;
        }
        if (pattern.hasMatch(line)) {
          violations.add((file: file, lineNumber: i + 1, line: line));
        }
      }
    }
    return violations;
  }

  String formatViolations(
    List<({File file, int lineNumber, String line})> violations,
  ) {
    return violations
        .map((v) => '  ${v.file.path}:${v.lineNumber}: ${v.line.trim()}')
        .join('\n');
  }

  // ---------------------------------------------------------------------------
  // Score computation
  // ---------------------------------------------------------------------------

  test('no local score arithmetic (score +, -, *, /, =)', () {
    final pattern = RegExp(
      r'score\s*[+\-*/=]',
      caseSensitive: false,
    );
    final violations = findViolations(pattern).where((v) {
      // Allow display-only fields assigned from JSON deserialization.
      final line = v.line;
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Source files must not compute scores locally.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  test('no local points arithmetic (points +, -, *, /, =)', () {
    final pattern = RegExp(
      r'points\s*[+\-*/=]',
      caseSensitive: false,
    );
    final violations = findViolations(pattern).where((v) {
      final line = v.line;
      // Allow display fields like pointsAwarded, pointsPossible from JSON.
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[') &&
          !line.contains('pointsAwarded') &&
          !line.contains('pointsPossible');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Source files must not compute points locally.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Pass / fail logic
  // ---------------------------------------------------------------------------

  test('no local pass/fail boolean assignment', () {
    // Match `passed = <expr>` but not when reading from JSON.
    final pattern = RegExp(r'passed\s*=\s*');
    final violations = findViolations(pattern).where((v) {
      final line = v.line;
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Pass/fail status must come from the server, not be computed locally.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Correctness computation
  // ---------------------------------------------------------------------------

  test('no local isCorrect assignment', () {
    final pattern = RegExp(r'isCorrect\s*=\s*');
    final violations = findViolations(pattern).where((v) {
      final line = v.line;
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Correctness must be determined by the server, not computed locally.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Deadline enforcement
  // ---------------------------------------------------------------------------

  test('no local deadline enforcement via DateTime.now()', () {
    // Matches DateTime.now() compared against deadline/closes/expires fields.
    final pattern = RegExp(
      r'DateTime\.now\(\).*(?:isAfter|isBefore).*(?:deadline|closes|expires)',
      caseSensitive: false,
    );
    final violations = findViolations(pattern);

    expect(
      violations,
      isEmpty,
      reason:
          'Deadline enforcement must happen on the server. '
          'The client may display countdown timers but must not gate '
          'submissions based on local time.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Grade calculation functions
  // ---------------------------------------------------------------------------

  test('no local grade calculation functions', () {
    final pattern = RegExp(
      r'(?:calculateScore|computeScore|calculateGrade|computeGrade|gradeSubmission)',
      caseSensitive: false,
    );
    final violations = findViolations(pattern);

    expect(
      violations,
      isEmpty,
      reason:
          'No grading calculation functions should exist in the mobile client.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  test('no generic grading logic keywords', () {
    // Look for function/method definitions that suggest grading logic.
    final pattern = RegExp(
      r'(?:void|int|double|bool|num|Future)\s+(?:grade|grading|calcScore|applyPenalty|checkDeadline|isEligible)',
      caseSensitive: false,
    );
    final violations = findViolations(pattern);

    expect(
      violations,
      isEmpty,
      reason:
          'No grading-related function definitions should exist in the mobile '
          'client. Grading must be performed server-side.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Late penalty logic
  // ---------------------------------------------------------------------------

  test('no local late penalty computation', () {
    final pattern = RegExp(
      r'(?:latePenalty|late_penalty|penaltyRate|penaltyPercent|applyLatePenalty)',
      caseSensitive: false,
    );
    final violations = findViolations(pattern).where((v) {
      final line = v.line;
      // Allow display of penalty values received from server.
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Late penalties must be computed server-side.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Attempt eligibility
  // ---------------------------------------------------------------------------

  test('no local attempt eligibility checks', () {
    // Matches logic that locally computes whether a student can attempt.
    final pattern = RegExp(
      r'(?:attemptsRemaining|attemptsLeft|canAttempt|maxAttempts)\s*[<>=!]',
      caseSensitive: false,
    );
    final violations = findViolations(pattern).where((v) {
      final line = v.line;
      return !line.contains('fromJson') &&
          !line.contains('json[') &&
          !line.contains("json['") &&
          !line.contains('map[');
    }).toList();

    expect(
      violations,
      isEmpty,
      reason:
          'Attempt eligibility must be determined by the server.\n'
          'Violations:\n${formatViolations(violations)}',
    );
  });

  // ---------------------------------------------------------------------------
  // Models / entities: values must come from JSON only
  // ---------------------------------------------------------------------------

  test('model classes use fromJson and do not compute grading fields', () {
    // Look for model files specifically.
    final modelFiles = sourceFiles
        .where((f) =>
            f.path.contains('model') ||
            f.path.contains('entity') ||
            f.path.contains('dto'))
        .toList();

    for (final file in modelFiles) {
      final content = file.readAsStringSync();

      // Models should not contain arithmetic on grading-related fields.
      final gradingArithmetic = RegExp(
        r'(?:score|points|grade|penalty)\s*[+\-*/]',
        caseSensitive: false,
      );

      final matches = gradingArithmetic.allMatches(content).where((m) {
        final surroundingStart = (m.start - 50).clamp(0, content.length);
        final surrounding = content.substring(surroundingStart, m.end + 50 < content.length ? m.end + 50 : content.length);
        return !surrounding.contains('fromJson') && !surrounding.contains('json[');
      }).toList();

      expect(
        matches,
        isEmpty,
        reason:
            'Model file ${file.path} contains grading arithmetic. '
            'Models should only receive grading values from JSON deserialization.',
      );
    }
  });
}
