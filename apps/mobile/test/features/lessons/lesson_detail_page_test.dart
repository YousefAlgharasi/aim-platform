// Phase 6 — P6-079
// lesson_detail_page_test.dart — widget tests for LessonDetailPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Success with no assets renders AIMEmptyState.
//   4. Success with assets renders lesson description and asset titles.
//   5. RTL layout renders without error.
//   6. lessonTitle appears in AppBar.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lesson_detail_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/lesson_detail_page.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) =>
    ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        theme: AppTheme.light,
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _page = LessonDetailPage(
  lessonId: 'lesson-1',
  lessonTitle: 'Lesson 1: Introduction',
);

const _lesson = Lesson(
  id: 'lesson-1',
  chapterId: 'chapter-1',
  title: 'Lesson 1: Introduction',
  description: 'An introduction to basic grammar concepts.',
  status: 'published',
  sortOrder: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
);

final _asset = LessonAssetModel.fromJson({
  'id': 'asset-1',
  'lessonId': 'lesson-1',
  'type': 'image',
  'title': 'Grammar Diagram',
  'description': 'Visual aid for grammar rules.',
  'url': 'https://cdn.example.com/diagram.png',
  'mimeType': 'image/png',
  'sizeBytes': null,
  'durationSeconds': null,
  'altText': 'Grammar diagram.',
  'thumbnailUrl': null,
  'order': 1,
  'status': 'published',
  'metadata': null,
  'createdAt': '2025-01-01T00:00:00Z',
  'updatedAt': '2025-06-01T00:00:00Z',
});

LessonDetail get _populated =>
    LessonDetail(lesson: _lesson, assets: [_asset]);

const LessonDetail _empty =
    LessonDetail(lesson: _lesson, assets: []);

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('LessonDetailPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) =>
                _FakeLessonDetailNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(LessonDetailPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) => _FakeLessonDetailNotifier(
                const AppAsyncState.failure(message: 'Load failed')),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('shows empty state when lesson has no assets', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) => _FakeLessonDetailNotifier(
                AppAsyncState.success(_empty)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No content yet'), findsOneWidget);
    });

    testWidgets('shows lesson description and asset title when populated',
        (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) => _FakeLessonDetailNotifier(
                AppAsyncState.success(_populated)),
          ),
        ],
      ));
      await tester.pump();
      expect(
          find.text('An introduction to basic grammar concepts.'), findsOneWidget);
      expect(find.text('Grammar Diagram'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) => _FakeLessonDetailNotifier(
                AppAsyncState.success(_populated)),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(LessonDetailPage), findsOneWidget);
      expect(find.text('Grammar Diagram'), findsOneWidget);
    });

    testWidgets('lessonTitle appears in AppBar', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonDetailProvider.overrideWith(
            (ref) => _FakeLessonDetailNotifier(
                AppAsyncState.success(_empty)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Lesson 1: Introduction'), findsOneWidget);
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeLessonDetailNotifier extends LessonDetailNotifier {
  _FakeLessonDetailNotifier(AppAsyncState<LessonDetail> initialState)
      : super(repository: _FakeLessonDetailRepository()) {
    state = initialState;
  }

  Future<void> load({
    required String bearerToken,
    required String lessonId,
  }) async {}

  Future<void> refresh({
    required String bearerToken,
    required String lessonId,
  }) async {}
}

class _FakeLessonDetailRepository implements LessonDetailRepository {
  @override
  Future<LessonDetail> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async =>
      _empty;
}
