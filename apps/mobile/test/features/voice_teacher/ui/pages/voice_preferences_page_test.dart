// Widget tests for the "Teacher voice" page: voices per language, man/woman filter, choosing and resetting a voice.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/voice_teacher/data/voice_preferences_api.dart';
import 'package:aim_mobile/features/voice_teacher/ui/pages/voice_preferences_page.dart';

class _FakeApi implements VoicePreferencesApi {
  _FakeApi(this.languages);

  final List<VoiceLanguage> languages;
  final List<(String, String?)> saved = [];
  final List<(String, String)> previews = [];

  @override
  Future<List<VoiceLanguage>> get() async => languages;

  @override
  Future<void> save(String language, String? voice) async => saved.add((language, voice));

  @override
  Future<List<int>> preview(String language, String voice) async {
    previews.add((language, voice));
    return const [];
  }
}

VoiceOption _v(String id, bool female) =>
    VoiceOption(id: id, name: id[0].toUpperCase() + id.substring(1), nameAr: id, isFemale: female);

/// A tall phone window so the whole (lazily built) list is on screen.
void _tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(800, 3000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Widget _app(_FakeApi api) => ProviderScope(
      overrides: [voicePreferencesApiProvider.overrideWithValue(api)],
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        locale: const Locale('en'),
        home: const VoicePreferencesPage(),
      ),
    );

void main() {
  late _FakeApi api;

  setUp(() {
    api = _FakeApi([
      VoiceLanguage(code: 'en', voices: [_v('hannah', true), _v('austin', false)], selected: null, available: true),
      VoiceLanguage(code: 'ar', voices: [_v('lulwa', true), _v('fahad', false)], selected: 'fahad', available: true),
    ]);
  });

  testWidgets('lists the voices of each language and marks the current choice', (tester) async {
    _tall(tester);
    await tester.pumpWidget(_app(api));
    await tester.pumpAndSettle();
    expect(find.text('English voice'), findsOneWidget);
    expect(find.text('Arabic voice'), findsOneWidget);
    expect(find.text('Hannah'), findsOneWidget);
    expect(find.text('Selected'), findsOneWidget); // fahad
    expect(find.text('Use the default voice'), findsOneWidget);
  });

  testWidgets('saves the voice the student chooses', (tester) async {
    _tall(tester);
    await tester.pumpWidget(_app(api));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Choose').at(1)); // Austin
    await tester.pumpAndSettle();
    expect(api.saved, [('en', 'austin')]);
    expect(find.text('Voice saved. Your teacher will use it from the next reply.'), findsOneWidget);
  });

  testWidgets('the Man filter hides the women', (tester) async {
    _tall(tester);
    await tester.pumpWidget(_app(api));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Man').first);
    await tester.pumpAndSettle();
    expect(find.text('Hannah'), findsNothing);
    expect(find.text('Austin'), findsOneWidget);
  });

  testWidgets('resets Arabic to the default voice', (tester) async {
    _tall(tester);
    await tester.pumpWidget(_app(api));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Use the default voice'));
    await tester.pumpAndSettle();
    expect(api.saved, [('ar', null)]);
  });

  testWidgets('says the Arabic voice is unavailable when the admin has not set it up', (tester) async {
    api = _FakeApi([
      VoiceLanguage(code: 'en', voices: [_v('hannah', true)], selected: null, available: true),
      VoiceLanguage(code: 'ar', voices: [_v('lulwa', true)], selected: null, available: false),
    ]);
    await tester.pumpWidget(_app(api));
    await tester.pumpAndSettle();
    expect(find.text('The Arabic voice is not available yet.'), findsOneWidget);
  });
}
