import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// P10-068: Verify that deadline status display in the mobile app covers all
/// five statuses, maps them to the correct colors, and never enforces deadlines.
void main() {
  late List<File> sourceFiles;
  late List<File> uiFiles;

  setUpAll(() {
    final assessmentsDir = Directory('lib/features/assessments');
    if (!assessmentsDir.existsSync()) {
      sourceFiles = [];
      uiFiles = [];
      return;
    }
    sourceFiles = assessmentsDir
        .listSync(recursive: true)
        .whereType<File>()
        .where((f) => f.path.endsWith('.dart'))
        .toList();
    uiFiles = sourceFiles
        .where((f) => f.path.contains('ui/'))
        .toList();
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  List<({File file, int lineNumber, String line})> findMatches(
    RegExp pattern, {
    List<File>? files,
  }) {
    final matches = <({File file, int lineNumber, String line})>[];
    for (final file in (files ?? sourceFiles)) {
      final lines = file.readAsLinesSync();
      for (var i = 0; i < lines.length; i++) {
        if (pattern.hasMatch(lines[i])) {
          matches.add((file: file, lineNumber: i + 1, line: lines[i]));
        }
      }
    }
    return matches;
  }

  String formatMatches(
    List<({File file, int lineNumber, String line})> matches,
  ) {
    return matches
        .map((m) => '  ${m.file.path}:${m.lineNumber}: ${m.line.trim()}')
        .join('\n');
  }

  // ---------------------------------------------------------------------------
  // 1. All 5 deadline statuses are handled in UI code
  // ---------------------------------------------------------------------------

  group('all 5 deadline statuses are handled in UI code', () {
    for (final status in ['open', 'upcoming', 'closed', 'late', 'missed']) {
      test('UI code handles "$status" status', () {
        final pattern = RegExp("'$status'");
        final matches = findMatches(pattern, files: uiFiles);

        expect(
          matches,
          isNotEmpty,
          reason:
              'UI code must handle the "$status" deadline status but no '
              'reference was found in UI files.',
        );
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Each status maps to the correct color
  // ---------------------------------------------------------------------------

  group('each status maps to the correct color', () {
    final expectedMappings = <String, String>{
      'open': 'success500',
      'upcoming': 'info500',
      'closed': 'neutral500',
      'late': 'warning500',
      'missed': 'error500',
    };

    for (final entry in expectedMappings.entries) {
      test('"${entry.key}" maps to ${entry.value}', () {
        final statusPattern = RegExp("'${entry.key}'");
        final colorPattern = RegExp(entry.value);

        final filesWithStatus = findMatches(statusPattern, files: uiFiles)
            .map((m) => m.file.path)
            .toSet();
        final filesWithColor = findMatches(colorPattern, files: uiFiles)
            .map((m) => m.file.path)
            .toSet();

        final intersection = filesWithStatus.intersection(filesWithColor);

        expect(
          intersection,
          isNotEmpty,
          reason:
              'Expected "${entry.key}" status to be mapped to '
              '${entry.value} in at least one UI file.',
        );
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. No deadline enforcement logic exists — only display
  // ---------------------------------------------------------------------------

  group('no deadline enforcement logic exists', () {
    test('no submission gating based on DateTime.now() vs deadline', () {
      final pattern = RegExp(
        r'DateTime\.now\(\).*(?:isAfter|isBefore).*(?:deadline|closes|expires)',
        caseSensitive: false,
      );
      final violations = findMatches(pattern, files: uiFiles);

      expect(
        violations,
        isEmpty,
        reason:
            'UI code must not enforce deadlines via DateTime.now() comparisons. '
            'Display countdowns are acceptable but enforcement is not.\n'
            'Violations:\n${formatMatches(violations)}',
      );
    });

    test('no DateTime.now().isAfter(deadline) enforcement patterns', () {
      final pattern = RegExp(
        r'if\s*\(.*DateTime\.now\(\).*(?:isAfter|isBefore)',
        caseSensitive: false,
      );
      final violations = findMatches(pattern, files: uiFiles);

      expect(
        violations,
        isEmpty,
        reason:
            'UI code must not use DateTime.now().isAfter/isBefore in '
            'conditional logic for deadline enforcement.\n'
            'Violations:\n${formatMatches(violations)}',
      );
    });

    test('no canSubmit/allowSubmission logic based on deadlines', () {
      final pattern = RegExp(
        r'(?:canSubmit|allowSubmission|isExpired|isOverdue)\s*=\s*.*(?:DateTime|deadline|closes)',
        caseSensitive: false,
      );
      final violations = findMatches(pattern, files: uiFiles);

      expect(
        violations,
        isEmpty,
        reason:
            'UI code must not compute submission eligibility from deadlines.\n'
            'Violations:\n${formatMatches(violations)}',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Widget classes exist and are exported
  // ---------------------------------------------------------------------------

  group('deadline display widgets exist and are exported', () {
    for (final widget in [
      'DeadlineStatusBadge',
      'DeadlineStatusCard',
      'DeadlineCountdownText',
    ]) {
      test('$widget class exists in source', () {
        final pattern = RegExp('class $widget\\s');
        final matches = findMatches(pattern);

        expect(
          matches,
          isNotEmpty,
          reason:
              '$widget widget class must exist in the assessments feature.',
        );
      });
    }

    test('deadline_status_widgets.dart is importable (exported)', () {
      final widgetsFile = sourceFiles.where(
        (f) => f.path.endsWith('deadline_status_widgets.dart'),
      );

      expect(
        widgetsFile,
        isNotEmpty,
        reason: 'deadline_status_widgets.dart must exist.',
      );

      final content = widgetsFile.first.readAsStringSync();
      expect(
        content,
        contains('class DeadlineStatusBadge'),
        reason: 'DeadlineStatusBadge must be a public class.',
      );
      expect(
        content,
        contains('class DeadlineStatusCard'),
        reason: 'DeadlineStatusCard must be a public class.',
      );
      expect(
        content,
        contains('class DeadlineCountdownText'),
        reason: 'DeadlineCountdownText must be a public class.',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Deadlines page groups items by status category
  // ---------------------------------------------------------------------------

  group('deadlines page groups items by status category', () {
    test('deadlines page references all status groupings', () {
      final deadlinesPageFiles = uiFiles.where(
        (f) => f.path.contains('deadlines_page.dart'),
      );

      expect(deadlinesPageFiles, isNotEmpty,
          reason: 'deadlines_page.dart must exist.');

      final content = deadlinesPageFiles.first.readAsStringSync();

      for (final group in ['active', 'upcoming', 'late', 'missed', 'closed']) {
        expect(
          content.contains('deadlines.$group'),
          isTrue,
          reason:
              'DeadlinesPage must reference "deadlines.$group" to group '
              'items by the "$group" status category.',
        );
      }
    });

    test('deadlines page uses section headers with status colors', () {
      final deadlinesPageFiles = uiFiles.where(
        (f) => f.path.contains('deadlines_page.dart'),
      );

      final content = deadlinesPageFiles.first.readAsStringSync();

      for (final color in [
        'success500',
        'info500',
        'warning500',
        'error500',
        'neutral500',
      ]) {
        expect(
          content.contains(color),
          isTrue,
          reason:
              'DeadlinesPage must use $color for status-grouped sections.',
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 6. No DateTime.now().isAfter(deadline) enforcement patterns
  // ---------------------------------------------------------------------------

  group('no deadline enforcement in any source file', () {
    test('no DateTime.now().isAfter(deadline) enforcement across codebase', () {
      final pattern = RegExp(
        r'DateTime\.now\(\)\.isAfter\s*\(\s*(?:deadline|closesAt|expiresAt)',
        caseSensitive: false,
      );
      final violations = <({File file, int lineNumber, String line})>[];
      for (final file in sourceFiles) {
        final lines = file.readAsLinesSync();
        for (var i = 0; i < lines.length; i++) {
          final trimmed = lines[i].trimLeft();
          if (trimmed.startsWith('//') || trimmed.startsWith('import ')) {
            continue;
          }
          if (pattern.hasMatch(lines[i])) {
            violations.add((file: file, lineNumber: i + 1, line: lines[i]));
          }
        }
      }

      expect(
        violations,
        isEmpty,
        reason:
            'No source file should enforce deadlines via '
            'DateTime.now().isAfter(deadline). Display countdowns are OK.\n'
            'Violations:\n${formatMatches(violations)}',
      );
    });
  });
}
