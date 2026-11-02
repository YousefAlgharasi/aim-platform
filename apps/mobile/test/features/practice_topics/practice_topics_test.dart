import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/practice_topics/data/practice_topics_datasource.dart';
import 'package:aim_mobile/features/practice_topics/data/practice_topics_models.dart';
import 'package:aim_mobile/features/practice_topics/logic/practice_topics_providers.dart';
import 'package:aim_mobile/features/practice_topics/ui/practice_session_bar.dart';
import 'package:aim_mobile/features/practice_topics/ui/practice_topics_page.dart';
import 'package:aim_mobile/features/practice_topics/ui/writing_practice_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

PracticeTopic _topic(String kind, {String title = 'At the doctor', int? minWords}) => PracticeTopic.fromJson({
      'id': 't1', 'kind': kind, 'title': title, 'description': 'Tell the doctor how you feel',
      'levelCode': 'A2', 'xpReward': 30, 'timeLimitSeconds': 240, 'minWords': minWords,
    });

BackendApiClient _client(Future<http.Response> Function(http.Request) handler) => BackendApiClient(
      config: const AppConfig(environment: 'test', backendApiBaseUrl: 'https://api.example.com'),
      httpClient: MockClient(handler),
    );

class _FakeDatasource extends PracticeTopicsDatasource {
  _FakeDatasource({this.result, this.error, this.xp = 0})
      : super(apiClient: _client((_) async => http.Response('{}', 200)));

  final WritingResult? result;
  final Object? error;
  final int xp;
  String? submitted;

  @override
  Future<int> completeSpeaking(String attemptId) async {
    if (error != null) throw error!;
    return xp;
  }

  @override
  Future<WritingResult> submitWriting(String topicId, String text) async {
    submitted = text;
    if (error != null) throw error!;
    return result!;
  }
}

Widget _app(Widget home, {List<Override> overrides = const [], Locale locale = const Locale('en')}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(
      theme: AppTheme.light,
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: home,
    ),
  );
}

void _phone(WidgetTester tester) {
  tester.view.physicalSize = const Size(360 * 3, 780 * 3);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
}

void main() {
  group('PracticeTopicsDatasource (what is sent to the backend)', () {
    String envelope(Object data) => jsonEncode({'success': true, 'data': data, 'meta': {}});

    test('lists topics of a kind with ?kind=', () async {
      late http.Request seen;
      final ds = PracticeTopicsDatasource(apiClient: _client((r) async {
        seen = r;
        return http.Response(envelope([{'id': 't1', 'kind': 'writing', 'title': 'My family', 'xpReward': 20, 'minWords': 30}]), 200);
      }));
      final topics = await ds.getTopics('writing');

      expect(seen.method, 'GET');
      expect(seen.url.path, '/student/practice/topics');
      expect(seen.url.queryParameters['kind'], 'writing');
      expect(topics.single.title, 'My family');
      expect(topics.single.minWords, 30);
    });

    test('starts speaking with only the topic id and builds the voice contextRef', () async {
      late http.Request seen;
      final ds = PracticeTopicsDatasource(apiClient: _client((r) async {
        seen = r;
        return http.Response(
          envelope({'attemptId': 'a1', 'sessionId': 's1', 'topic': {'id': 't1', 'kind': 'speaking', 'title': 'T', 'xpReward': 20}}),
          201,
        );
      }));
      final start = await ds.startSpeaking('t1');

      expect(seen.method, 'POST');
      expect(seen.url.path, '/student/practice/speaking/start');
      expect(jsonDecode(seen.body), {'topicId': 't1'});
      expect(start.contextRef, 'practice:t1:a1');
    });

    test('completes speaking and returns the XP the backend awarded', () async {
      late http.Request seen;
      final ds = PracticeTopicsDatasource(apiClient: _client((r) async {
        seen = r;
        return http.Response(envelope({'attemptId': 'a1', 'xpAwarded': 30}), 200);
      }));
      expect(await ds.completeSpeaking('a1'), 30);
      expect(seen.url.path, '/student/practice/speaking/a1/complete');
    });

    test('submits a paragraph and parses the score, corrections and XP', () async {
      late http.Request seen;
      final ds = PracticeTopicsDatasource(apiClient: _client((r) async {
        seen = r;
        return http.Response(
          envelope({
            'attemptId': 'x', 'score': 140, 'summary': 'Nice.', 'xpAwarded': 20,
            'corrections': [{'original': 'a', 'correction': 'b', 'explanation': 'c'}],
          }),
          200,
        );
      }));
      final result = await ds.submitWriting('t1', 'hello world');

      expect(seen.url.path, '/student/practice/writing/submit');
      expect(jsonDecode(seen.body), {'topicId': 't1', 'text': 'hello world'});
      expect(result.score, 100, reason: 'display score is clamped to 0-100');
      expect(result.xpAwarded, 20);
      expect(result.corrections.single.correction, 'b');
    });

    test('a 402 surfaces as the locked state', () async {
      final ds = PracticeTopicsDatasource(apiClient: _client((r) async => http.Response(
            jsonEncode({'success': false, 'error': {'code': 'COURSE_PAYMENT_REQUIRED', 'message': 'Start a course', 'statusCode': 402}}),
            402,
          )));
      await expectLater(
        ds.getTopics('speaking'),
        throwsA(predicate((e) => isPracticeLocked(e as Object))),
      );
    });
  });

  group('PracticeTopicsPage', () {
    testWidgets('lists topics with level, XP and time', (tester) async {
      _phone(tester);
      await tester.pumpWidget(_app(
        const PracticeTopicsPage(kind: 'speaking'),
        overrides: [practiceTopicsProvider('speaking').overrideWith((ref) async => [_topic('speaking')])],
      ));
      await tester.pumpAndSettle();

      expect(find.text('Practice Speaking'), findsOneWidget); // app bar
      expect(find.text('At the doctor'), findsOneWidget);
      expect(find.text('+30 XP'), findsOneWidget);
      expect(find.text('4 min'), findsOneWidget);
      expect(find.text('A2'), findsOneWidget);
    });

    testWidgets('shows the "start a course" card when the backend says 402', (tester) async {
      _phone(tester);
      await tester.pumpWidget(_app(
        const PracticeTopicsPage(kind: 'writing'),
        overrides: [
          practiceTopicsProvider('writing').overrideWith(
            (ref) async => throw const ApiClientException(code: 'COURSE_PAYMENT_REQUIRED', message: 'x', statusCode: 402),
          ),
        ],
      ));
      await tester.pumpAndSettle();

      expect(find.text('Start a course to unlock this'), findsOneWidget);
      expect(find.text('Choose a course'), findsOneWidget);
    });

    testWidgets('renders in Arabic (RTL) without overflow and with Arabic text', (tester) async {
      _phone(tester);
      await tester.pumpWidget(_app(
        const PracticeTopicsPage(kind: 'speaking'),
        locale: const Locale('ar'),
        overrides: [
          practiceTopicsProvider('speaking').overrideWith(
            (ref) async => [_topic('speaking', title: 'موظف ومديره: طلب إجازة ليوم واحد لأسباب عائلية طارئة')],
          ),
        ],
      ));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('تدرب على التحدث'), findsOneWidget);
      expect(find.text('+30 نقطة خبرة'), findsOneWidget);
      expect(find.text('4 دقيقة'), findsOneWidget);
    });
  });

  group('WritingPracticePage', () {
    testWidgets('needs the minimum words, then shows score, corrections and XP', (tester) async {
      _phone(tester);
      final fake = _FakeDatasource(
        result: WritingResult.fromJson({
          'score': 72, 'summary': 'Good start.', 'xpAwarded': 20,
          'corrections': [
            {'original': 'I goed', 'correction': 'I went', 'explanation': 'Past tense'},
          ],
        }),
      );
      await tester.pumpWidget(_app(
        WritingPracticePage(topic: _topic('writing', title: 'My family', minWords: 3)),
        overrides: [practiceTopicsDatasourceProvider.overrideWithValue(fake)],
      ));
      await tester.pump();

      AIMButton submit() => tester.widget<AIMButton>(find.ancestor(
            of: find.text('Submit for marking'),
            matching: find.byType(AIMButton),
          ));
      expect(submit().isEnabled, isFalse);

      await tester.enterText(find.byType(TextField), 'I goed home');
      await tester.pump();
      expect(submit().isEnabled, isTrue);

      await tester.tap(find.text('Submit for marking'));
      await tester.pumpAndSettle();

      expect(fake.submitted, 'I goed home');
      expect(find.text('72/100'), findsOneWidget);
      expect(find.text('+20 XP'), findsOneWidget);
      expect(find.text('Good start.'), findsOneWidget);
      expect(find.textContaining('I went'), findsOneWidget);
    });

    testWidgets('keeps the text and shows an error when marking fails', (tester) async {
      _phone(tester);
      final fake = _FakeDatasource(error: const ApiClientException(code: 'X', message: 'Marking is down', statusCode: 502));
      await tester.pumpWidget(_app(
        WritingPracticePage(topic: _topic('writing', minWords: 1)),
        overrides: [practiceTopicsDatasourceProvider.overrideWithValue(fake)],
      ));
      await tester.pump();
      await tester.enterText(find.byType(TextField), 'my paragraph');
      await tester.pump();
      await tester.tap(find.text('Submit for marking'));
      await tester.pumpAndSettle();

      expect(find.text('Marking is down'), findsOneWidget);
      expect(find.text('my paragraph'), findsOneWidget);
    });
  });

  group('PracticeSessionBar', () {
    const info = PracticeSessionInfo(attemptId: 'a1', title: 'At the doctor', xpReward: 30, timeLimitSeconds: 240);

    testWidgets('finishing awards XP and offers more topics', (tester) async {
      _phone(tester);
      final router = GoRouter(routes: [
        GoRoute(path: '/', builder: (_, __) => const Scaffold(bottomNavigationBar: PracticeSessionBar(practice: info))),
      ]);
      await tester.pumpWidget(ProviderScope(
        overrides: [practiceTopicsDatasourceProvider.overrideWithValue(_FakeDatasource(xp: 30))],
        child: MaterialApp.router(
          routerConfig: router,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
        ),
      ));
      await tester.pump();

      expect(find.text('At the doctor'), findsOneWidget);
      expect(find.text('Finish to earn +30 XP'), findsOneWidget);
      expect(find.text('4:00'), findsOneWidget);

      await tester.tap(find.text('Finish'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Well done!'), findsOneWidget);
      expect(find.textContaining('+30 XP'), findsOneWidget);
      expect(find.text('More topics'), findsOneWidget);
    });

    testWidgets('shows the backend message when finishing is refused', (tester) async {
      _phone(tester);
      final fake = _FakeDatasource(error: const ApiClientException(code: 'BAD_REQUEST', message: 'Talk a little more before finishing.', statusCode: 400));
      await tester.pumpWidget(ProviderScope(
        overrides: [practiceTopicsDatasourceProvider.overrideWithValue(fake)],
        child: const MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: Scaffold(bottomNavigationBar: PracticeSessionBar(practice: info)),
        ),
      ));
      await tester.pump();
      await tester.tap(find.text('Finish'));
      await tester.pumpAndSettle();

      expect(find.text('Talk a little more before finishing.'), findsOneWidget);
      expect(find.text('Finish'), findsOneWidget, reason: 'the student can try again');
    });
  });
}
