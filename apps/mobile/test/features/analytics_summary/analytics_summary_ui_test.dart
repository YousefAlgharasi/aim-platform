// Phase 15 — P15-073
// analytics_summary_ui_test.dart — notifier and widget checks for the
// Student Analytics Summary feature.
//
// Flutter NEVER computes report content; values are backend outputs
// surfaced verbatim from GET /student/analytics/summary.
//
// Covers:
//   1.  AnalyticsSummaryNotifier starts idle.
//   2.  load() transitions to loading before success.
//   3.  load() stores reports verbatim — no transformation.
//   4.  load() preserves report order — Flutter never re-sorts.
//   5.  load() failure does not expose partial data.
//   6.  clear() resets to idle — no stale data retained.
//   7.  refresh() replaces data verbatim with updated backend response.
//   8.  Empty backend response — no defaults injected by Flutter.
//   9.  AnalyticsSummaryPage loading state renders AIMFullScreenLoading.
//   10. AnalyticsSummaryPage error state renders AIMFullScreenError.
//   11. AnalyticsSummaryPage empty success state renders AIMEmptyState.
//   12. AnalyticsSummaryPage populated state renders report cards.
//   13. AnalyticsSummaryPage RTL layout does not throw.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';
import 'package:aim_mobile/features/analytics_summary/logic/provider/analytics_summary_notifier.dart';
import 'package:aim_mobile/features/analytics_summary/logic/provider/analytics_summary_provider.dart';
import 'package:aim_mobile/features/analytics_summary/logic/repository/analytics_summary_repository.dart';
import 'package:aim_mobile/features/analytics_summary/ui/pages/analytics_summary_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────────────────────────────────────

class _FakeAnalyticsSummaryRepository implements AnalyticsSummaryRepository {
  final bool shouldFail;
  final bool returnEmpty;
  final List<AnalyticsSummaryReportModel>? overrideReports;

  const _FakeAnalyticsSummaryRepository({
    this.shouldFail = false,
    this.returnEmpty = false,
    this.overrideReports,
  });

  static const _reports = [
    AnalyticsSummaryReportModel(
      key: 'learning-progress',
      name: 'Learning Progress',
      category: 'learning',
      description: 'Skill mastery progress over time.',
    ),
    AnalyticsSummaryReportModel(
      key: 'assessment-results',
      name: 'Assessment Results',
      category: 'assessment',
      description: 'Recent assessment outcomes.',
    ),
  ];

  @override
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  }) async {
    if (shouldFail) {
      throw const AppException(message: 'API error', code: 'ERR');
    }
    if (returnEmpty) return [];
    return overrideReports ?? _reports;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────

ProviderContainer _container({
  bool shouldFail = false,
  bool returnEmpty = false,
  List<AnalyticsSummaryReportModel>? overrideReports,
}) {
  final repo = _FakeAnalyticsSummaryRepository(
    shouldFail: shouldFail,
    returnEmpty: returnEmpty,
    overrideReports: overrideReports,
  );
  return ProviderContainer(
    overrides: [
      analyticsSummaryProvider.overrideWith(
        (ref) => AnalyticsSummaryNotifier(repository: repo),
      ),
    ],
  );
}

Future<void> _load(ProviderContainer c) =>
    c.read(analyticsSummaryProvider.notifier).load(bearerToken: 'tok');

// ── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────

void main() {
  group('P15-073 — AnalyticsSummaryNotifier checks', () {
    test('1. notifier starts idle', () {
      final c = _container();
      addTearDown(c.dispose);
      expect(c.read(analyticsSummaryProvider), isA<AppAsyncIdle>());
    });

    test('2. load() emits loading before success', () async {
      final c = _container();
      addTearDown(c.dispose);

      final states = <AppAsyncState<List<AnalyticsSummaryReportModel>>>[];
      final sub = c.listen(analyticsSummaryProvider, (_, n) => states.add(n));
      addTearDown(sub.close);

      await _load(c);

      expect(states.first, isA<AppAsyncLoading>());
      expect(states.last, isA<AppAsyncSuccess>());
    });

    test('3. reports stored verbatim — no transformation', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data = (c.read(analyticsSummaryProvider)
              as AppAsyncSuccess<List<AnalyticsSummaryReportModel>>)
          .data;
      expect(data.length, 2);
      expect(data.first.key, 'learning-progress');
      expect(data.first.category, 'learning');
    });

    test('4. report order preserved — Flutter never re-sorts', () async {
      const reordered = [
        AnalyticsSummaryReportModel(
          key: 'z-report',
          name: 'Z Report',
          category: 'student',
        ),
        AnalyticsSummaryReportModel(
          key: 'a-report',
          name: 'A Report',
          category: 'student',
        ),
      ];
      final c = _container(overrideReports: reordered);
      addTearDown(c.dispose);
      await _load(c);

      final data = (c.read(analyticsSummaryProvider)
              as AppAsyncSuccess<List<AnalyticsSummaryReportModel>>)
          .data;
      expect(data[0].key, 'z-report');
      expect(data[1].key, 'a-report');
    });

    test('5. failure emits error — no partial data exposed', () async {
      final c = _container(shouldFail: true);
      addTearDown(c.dispose);
      await _load(c);

      expect(c.read(analyticsSummaryProvider), isA<AppAsyncFailure>());
    });

    test('6. clear() resets to idle — no stale data retained', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      c.read(analyticsSummaryProvider.notifier).clear();
      expect(c.read(analyticsSummaryProvider), isA<AppAsyncIdle>());
    });

    test('7. refresh() replaces data verbatim with updated backend response',
        () async {
      const updated = [
        AnalyticsSummaryReportModel(
          key: 'new-report',
          name: 'New Report',
          category: 'student',
        ),
      ];
      final c = _container(overrideReports: updated);
      addTearDown(c.dispose);
      await c
          .read(analyticsSummaryProvider.notifier)
          .refresh(bearerToken: 'tok');

      final data = (c.read(analyticsSummaryProvider)
              as AppAsyncSuccess<List<AnalyticsSummaryReportModel>>)
          .data;
      expect(data.first.key, 'new-report');
    });

    test('8. empty backend response — no defaults injected by Flutter',
        () async {
      final c = _container(returnEmpty: true);
      addTearDown(c.dispose);
      await _load(c);

      final data = (c.read(analyticsSummaryProvider)
              as AppAsyncSuccess<List<AnalyticsSummaryReportModel>>)
          .data;
      expect(data, isEmpty);
    });
  });

  group('P15-073 — AnalyticsSummaryPage widget checks', () {
    Widget wrap(
      Widget child, {
      required AppAsyncState<List<AnalyticsSummaryReportModel>> state,
      TextDirection dir = TextDirection.ltr,
    }) {
      return ProviderScope(
        overrides: [
          analyticsSummaryProvider.overrideWith(
            (ref) => _StubNotifier(state),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.light,
          home: Directionality(
            textDirection: dir,
            child: child,
          ),
        ),
      );
    }

    testWidgets('9. loading state renders AIMFullScreenLoading',
        (tester) async {
      await tester.pumpWidget(
        wrap(const AnalyticsSummaryPage(), state: const AppAsyncLoading()),
      );
      await tester.pump();
      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('10. error state renders AIMFullScreenError', (tester) async {
      await tester.pumpWidget(
        wrap(
          const AnalyticsSummaryPage(),
          state: const AppAsyncFailure(message: 'Network error', code: 'ERR'),
        ),
      );
      await tester.pump();
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('11. empty success state renders AIMEmptyState',
        (tester) async {
      await tester.pumpWidget(
        wrap(
          const AnalyticsSummaryPage(),
          state: const AppAsyncSuccess(<AnalyticsSummaryReportModel>[]),
        ),
      );
      await tester.pump();
      expect(find.text('No reports available'), findsOneWidget);
    });

    testWidgets('12. populated state renders report cards', (tester) async {
      await tester.pumpWidget(
        wrap(
          const AnalyticsSummaryPage(),
          state: const AppAsyncSuccess([
            AnalyticsSummaryReportModel(
              key: 'learning-progress',
              name: 'Learning Progress',
              category: 'learning',
              description: 'Skill mastery progress over time.',
            ),
          ]),
        ),
      );
      await tester.pump();
      expect(find.text('Learning Progress'), findsOneWidget);
      expect(find.text('learning'), findsOneWidget);
      expect(
          find.text('Skill mastery progress over time.'), findsOneWidget);
    });

    testWidgets('13. RTL layout does not throw', (tester) async {
      await tester.pumpWidget(
        wrap(
          const AnalyticsSummaryPage(),
          state: const AppAsyncSuccess([
            AnalyticsSummaryReportModel(
              key: 'learning-progress',
              name: 'Learning Progress',
              category: 'learning',
            ),
          ]),
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });
}

class _StubNotifier extends AnalyticsSummaryNotifier {
  _StubNotifier(AppAsyncState<List<AnalyticsSummaryReportModel>> initial)
      : super(repository: _NoOpRepo()) {
    state = initial;
  }

  @override
  Future<void> load({required String bearerToken}) async {}

  @override
  Future<void> refresh({required String bearerToken}) async {}
}

class _NoOpRepo implements AnalyticsSummaryRepository {
  @override
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  }) async =>
      [];
}
