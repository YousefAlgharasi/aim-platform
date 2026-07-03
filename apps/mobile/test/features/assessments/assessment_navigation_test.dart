import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// P10-067: Verify assessment navigation flow consistency.
///
/// Scans source files to ensure:
/// 1. All pages are exported from the barrel file.
/// 2. Every route referenced by a `context.push`/`pushReplacement`/`go` call
///    (whether as a literal path string or an `AppRoutePaths` constant) is a
///    known route in the navigation graph.
/// 3. Route arguments (`extra:` maps) pass the correct keys between pages.
/// 4. The expected navigation flows are wired correctly:
///    list -> detail -> start -> attempt -> submit -> result
///    detail -> history -> result
void main() {
  final pagesDir = Directory('lib/features/assessments/ui/pages');
  late List<File> pageFiles;
  late File barrelFile;

  // Known assessment routes and which page file provides them.
  // This is the canonical set of routes the app uses.
  final knownRoutes = <String>{
    '/student/assessments',
    '/student/assessments/detail',
    '/student/assessments/start',
    '/student/assessments/attempt',
    '/student/assessments/submit',
    '/student/assessments/result',
    '/student/assessments/history',
    '/student/assessments/deadlines',
  };

  // AppRoutePaths constant names → their path values (mirrors
  // lib/core/routing/app_route_paths.dart), used to resolve navigation
  // calls that pass the constant instead of a literal string.
  const routeConstantValues = <String, String>{
    'AppRoutePaths.assessments': '/student/assessments',
    'AppRoutePaths.assessmentDetail': '/student/assessments/detail',
    'AppRoutePaths.assessmentStart': '/student/assessments/start',
    'AppRoutePaths.assessmentAttempt': '/student/assessments/attempt',
    'AppRoutePaths.assessmentSubmit': '/student/assessments/submit',
    'AppRoutePaths.assessmentResult': '/student/assessments/result',
    'AppRoutePaths.assessmentResultHistory': '/student/assessments/history',
    'AppRoutePaths.assessmentDeadlines': '/student/assessments/deadlines',
  };

  // Matches GoRouter navigation calls (context.push / context.pushReplacement
  // / context.go) with a literal assessment route path string.
  final literalRoutePattern = RegExp(
    r'''context\.(?:push|pushReplacement|go)\(\s*['"](/student/assessments[^'"]*)['"]''',
  );

  /// Every assessment route this file's `context.push`/`pushReplacement`/`go`
  /// calls navigate to — resolved from either a literal path string or a
  /// known `AppRoutePaths` constant.
  Set<String> navigationTargets(String content) {
    final targets = <String>{};
    for (final match in literalRoutePattern.allMatches(content)) {
      targets.add(match.group(1)!);
    }
    for (final entry in routeConstantValues.entries) {
      if (content.contains(entry.key)) {
        targets.add(entry.value);
      }
    }
    return targets;
  }

  // Expected page files that must exist and be exported.
  final expectedPages = <String>[
    'assessment_list_page.dart',
    'assessment_detail_page.dart',
    'start_attempt_page.dart',
    'attempt_page.dart',
    'submit_attempt_page.dart',
    'assessment_result_page.dart',
    'result_history_page.dart',
    'deadlines_page.dart',
  ];

  setUpAll(() {
    if (!pagesDir.existsSync()) {
      pageFiles = [];
      return;
    }
    pageFiles = pagesDir
        .listSync(recursive: false)
        .whereType<File>()
        .where((f) => f.path.endsWith('.dart'))
        .toList();
    barrelFile = File('${pagesDir.path}/assessment_pages.dart');
  });

  // ---------------------------------------------------------------------------
  // 1. All pages exist and are exported from the barrel
  // ---------------------------------------------------------------------------

  test('all expected page files exist', () {
    if (!pagesDir.existsSync()) return;
    final fileNames = pageFiles.map((f) => f.uri.pathSegments.last).toSet();
    for (final expected in expectedPages) {
      expect(
        fileNames.contains(expected),
        isTrue,
        reason: 'Expected page file $expected not found in ${pagesDir.path}',
      );
    }
  });

  test('barrel file exports all page files', () {
    if (!pagesDir.existsSync()) return;
    expect(barrelFile.existsSync(), isTrue,
        reason: 'Barrel file assessment_pages.dart must exist');

    final barrelContent = barrelFile.readAsStringSync();
    for (final expected in expectedPages) {
      expect(
        barrelContent.contains("'$expected'"),
        isTrue,
        reason: 'Barrel file must export $expected',
      );
    }
  });

  // ---------------------------------------------------------------------------
  // 2. All navigation calls reference known assessment routes
  // ---------------------------------------------------------------------------

  test('all navigation calls reference known assessment routes', () {
    if (!pagesDir.existsSync()) return;

    final unknownRoutes = <String, List<String>>{};

    for (final file in pageFiles) {
      final content = file.readAsStringSync();
      for (final route in navigationTargets(content)) {
        if (!knownRoutes.contains(route)) {
          unknownRoutes
              .putIfAbsent(route, () => [])
              .add(file.uri.pathSegments.last);
        }
      }
    }

    expect(
      unknownRoutes,
      isEmpty,
      reason:
          'Pages navigate to unknown routes:\n'
          '${unknownRoutes.entries.map((e) => '  ${e.key} used in ${e.value.join(", ")}').join('\n')}',
    );
  });

  // ---------------------------------------------------------------------------
  // 3. Route arguments are passed correctly between pages
  // ---------------------------------------------------------------------------

  test('assessment_list_page passes assessmentId and assessmentTitle to detail',
      () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/assessment_list_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    expect(navigationTargets(content), contains('/student/assessments/detail'),
        reason: 'List page must navigate to detail route');
    expect(content.contains("'assessmentId'"), isTrue,
        reason: 'List page must pass assessmentId argument');
    expect(content.contains("'assessmentTitle'"), isTrue,
        reason: 'List page must pass assessmentTitle argument');
  });

  test(
      'assessment_detail_page passes assessmentId and assessmentTitle to start',
      () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/assessment_detail_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    expect(navigationTargets(content), contains('/student/assessments/start'),
        reason: 'Detail page must navigate to start route');
    expect(content.contains("'assessmentId'"), isTrue,
        reason: 'Detail page must pass assessmentId argument');
    expect(content.contains("'assessmentTitle'"), isTrue,
        reason: 'Detail page must pass assessmentTitle argument');
  });

  test(
      'start_attempt_page passes attemptId, assessmentId, assessmentTitle to attempt',
      () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/start_attempt_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    expect(navigationTargets(content), contains('/student/assessments/attempt'),
        reason: 'Start attempt page must navigate to attempt route');
    expect(content.contains("'attemptId'"), isTrue,
        reason: 'Start attempt page must pass attemptId argument');
    expect(content.contains("'assessmentId'"), isTrue,
        reason: 'Start attempt page must pass assessmentId argument');
    expect(content.contains("'assessmentTitle'"), isTrue,
        reason: 'Start attempt page must pass assessmentTitle argument');
  });

  test('attempt_page opens the submit confirmation with attemptId and title',
      () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/attempt_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    // TASK-23: the attempt page no longer submits inline or navigates to the
    // result route directly — its Submit button navigates to the
    // AppRoutePaths.assessmentSubmit confirmation screen (design screen 28),
    // which owns the submission and the navigation to the result screen.
    expect(navigationTargets(content), contains('/student/assessments/submit'),
        reason: 'Attempt page must open the submit confirmation route');
    expect(content.contains("'attemptId': widget.attemptId"), isTrue,
        reason: 'Attempt page must pass attemptId to the confirmation page');
    expect(
        content.contains("'assessmentTitle': widget.assessmentTitle"), isTrue,
        reason:
            'Attempt page must pass assessmentTitle to the confirmation page');
  });

  test(
      'submit_attempt_page passes attemptId, resultId, assessmentTitle to result',
      () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/submit_attempt_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    expect(navigationTargets(content), contains('/student/assessments/result'),
        reason: 'Submit page must navigate to result route');
    expect(content.contains("'attemptId'"), isTrue,
        reason: 'Submit page must pass attemptId argument');
    expect(content.contains("'resultId'"), isTrue,
        reason: 'Submit page must pass resultId argument');
    expect(content.contains("'assessmentTitle'"), isTrue,
        reason: 'Submit page must pass assessmentTitle argument');
  });

  test('result_history_page passes attemptId, assessmentTitle to result', () {
    if (!pagesDir.existsSync()) return;
    final file = File('${pagesDir.path}/result_history_page.dart');
    if (!file.existsSync()) return;
    final content = file.readAsStringSync();

    expect(navigationTargets(content), contains('/student/assessments/result'),
        reason: 'History page must navigate to result route');
    expect(content.contains("'attemptId'"), isTrue,
        reason: 'History page must pass attemptId argument');
    expect(content.contains("'assessmentTitle'"), isTrue,
        reason: 'History page must pass assessmentTitle argument');
  });

  // ---------------------------------------------------------------------------
  // 4. Navigation graph completeness: the expected flows are wired
  // ---------------------------------------------------------------------------

  test(
      'navigation graph covers list -> detail -> start -> attempt -> submit -> result',
      () {
    if (!pagesDir.existsSync()) return;

    final edges = <String, Set<String>>{};
    for (final file in pageFiles) {
      final name = file.uri.pathSegments.last;
      edges[name] = navigationTargets(file.readAsStringSync());
    }

    expect(edges['assessment_list_page.dart'],
        contains('/student/assessments/detail'),
        reason: 'List must navigate to detail');
    expect(edges['assessment_detail_page.dart'],
        contains('/student/assessments/start'),
        reason: 'Detail must navigate to start');
    expect(edges['start_attempt_page.dart'],
        contains('/student/assessments/attempt'),
        reason: 'Start must navigate to attempt');
    expect(edges['attempt_page.dart'],
        contains('/student/assessments/submit'),
        reason: 'Attempt must navigate to the submit confirmation');
    expect(edges['submit_attempt_page.dart'],
        contains('/student/assessments/result'),
        reason: 'Submit must navigate to result');
  });

  test('navigation graph covers history -> result', () {
    if (!pagesDir.existsSync()) return;

    final historyFile = File('${pagesDir.path}/result_history_page.dart');
    if (!historyFile.existsSync()) return;
    final targets = navigationTargets(historyFile.readAsStringSync());

    expect(targets, contains('/student/assessments/result'),
        reason: 'History page must navigate to result');
  });

  // ---------------------------------------------------------------------------
  // 5. No page navigates to a non-existent assessment route
  // ---------------------------------------------------------------------------

  test('no page navigates to an assessment route outside the known set', () {
    if (!pagesDir.existsSync()) return;

    final invalidRoutes = <String, String>{};

    for (final file in pageFiles) {
      final name = file.uri.pathSegments.last;
      if (name == 'assessment_pages.dart') continue;
      for (final route in navigationTargets(file.readAsStringSync())) {
        if (!knownRoutes.contains(route)) {
          invalidRoutes[route] = name;
        }
      }
    }

    expect(
      invalidRoutes,
      isEmpty,
      reason:
          'Pages reference assessment routes not in the known set:\n'
          '${invalidRoutes.entries.map((e) => '  ${e.key} in ${e.value}').join('\n')}',
    );
  });
}
