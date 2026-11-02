// Live end-to-end test of the placement test in the real Flutter app.
//
// It launches the app, signs in, walks the first-login gate, starts the
// placement test, answers every objective question through the real UI and
// finishes on the result screen - talking to the real backend.
//
// Run on a connected device / emulator / desktop:
//
//   flutter test integration_test/placement_e2e_test.dart \
//     --dart-define=BACKEND_API_BASE_URL=https://api.aim-learn.com \
//     --dart-define=AIM_ENV=production \
//     --dart-define=E2E_EMAIL=<student email> \
//     --dart-define=E2E_PASSWORD=<password>
//
// The student must be NEW (no placement decision yet) so the gate is shown.
// Create one with `python3 tests/e2e/placement_live_e2e.py` style provisioning
// or ask a maintainer for a fresh e2e student (see integration_test/README.md).
//
// Writing / speaking questions are skipped on purpose: they are AI graded
// and speaking needs real microphone audio.

import 'package:aim_mobile/main.dart' as app;
import 'package:aim_mobile/features/placement/ui/widgets/placement_option_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

const _email = String.fromEnvironment('E2E_EMAIL');
const _password = String.fromEnvironment('E2E_PASSWORD');

/// English strings used by the screens (kept in one place so a copy change
/// is a one-line fix). Source of truth: lib/l10n/app_en.arb.
class _T {
  static const signIn = 'Sign In';
  static const cont = 'Continue';
  static const skip = 'Skip';
  static const submit = 'Submit';
  static const startAssessment = 'Start Assessment';
  static const beginSection = 'Begin Section';
  static const beginFinal = 'Begin Final Section';
  static const testKnowledge = 'Test My Knowledge';
  static const greatJob = 'Great Job! 🎉';
  static const level = 'Level';
}

Finder _text(String s) => find.text(s);

Future<bool> _tap(WidgetTester t, Finder f) async {
  if (f.evaluate().isEmpty) return false;
  await t.ensureVisible(f.first);
  await t.tap(f.first, warnIfMissed: false);
  return true;
}

/// Pump until [cond] holds or [timeout] passes (network calls are real).
Future<bool> _pumpUntil(
  WidgetTester t,
  bool Function() cond, {
  Duration timeout = const Duration(seconds: 30),
}) async {
  final end = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(end)) {
    await t.pump(const Duration(milliseconds: 250));
    if (cond()) return true;
  }
  return cond();
}

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('student completes the placement test in the app', (tester) async {
    expect(_email, isNotEmpty, reason: 'pass --dart-define=E2E_EMAIL=...');
    expect(_password, isNotEmpty, reason: 'pass --dart-define=E2E_PASSWORD=...');

    app.main();
    await tester.pump(const Duration(seconds: 1));

    // ---- Sign in ------------------------------------------------------------
    // Splash / onboarding walkthrough may come first: skip until the form shows.
    final emailField = find.byType(TextField);
    for (var i = 0; i < 40 && emailField.evaluate().length < 2; i++) {
      await _tap(tester, _text(_T.skip));
      await tester.pump(const Duration(milliseconds: 500));
    }
    expect(emailField.evaluate().length, greaterThanOrEqualTo(2),
        reason: 'login form (email + password) should be visible');

    await tester.enterText(emailField.at(0), _email);
    await tester.enterText(emailField.at(1), _password);
    await tester.pump();
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await _tap(tester, _text(_T.signIn));
    binding.reportData ??= <String, dynamic>{};

    // ---- Drive the screens until the result appears ---------------------------
    var answered = 0;
    var skipped = 0;
    var finished = false;

    for (var step = 0; step < 400 && !finished; step++) {
      await tester.pump(const Duration(milliseconds: 600));

      // Result screen => done.
      if (_text(_T.greatJob).evaluate().isNotEmpty ||
          (_text(_T.level).evaluate().isNotEmpty &&
              find.textContaining('Placement').evaluate().isNotEmpty &&
              _text(_T.cont).evaluate().isNotEmpty &&
              _text(_T.submit).evaluate().isEmpty)) {
        finished = true;
        break;
      }

      // Question screen: has a Submit button.
      if (_text(_T.submit).evaluate().isNotEmpty) {
        final options = find.byType(PlacementOptionCard);
        final textInputs = find.byType(TextField);
        if (options.evaluate().isNotEmpty) {
          await _tap(tester, options);
          await tester.pump(const Duration(milliseconds: 300));
          await _tap(tester, _text(_T.submit));
          answered++;
        } else if (textInputs.evaluate().isNotEmpty) {
          // fill-in-the-blank is a short text field; writing is long -> skip
          final field = tester.widget<TextField>(textInputs.first);
          if ((field.maxLines ?? 1) > 3) {
            await _tap(tester, _text(_T.skip));
            skipped++;
          } else {
            await tester.enterText(textInputs.first, 'test');
            await tester.pump(const Duration(milliseconds: 300));
            await _tap(tester, _text(_T.submit));
            answered++;
          }
        } else {
          // speaking (needs microphone) or unknown type
          await _tap(tester, _text(_T.skip));
          skipped++;
        }
        // stay under the API rate limit (60 req/min/IP)
        await tester.pump(const Duration(milliseconds: 1200));
        continue;
      }

      // Section / start / gate screens.
      if (await _tap(tester, _text(_T.startAssessment))) continue;
      if (await _tap(tester, _text(_T.beginSection))) continue;
      if (await _tap(tester, _text(_T.beginFinal))) continue;

      // Gate: choose "Test My Knowledge" (last step), otherwise Continue/Skip.
      if (_text(_T.testKnowledge).evaluate().isNotEmpty) {
        await _tap(tester, _text(_T.testKnowledge));
        await tester.pump(const Duration(milliseconds: 300));
        await _tap(tester, _text(_T.cont));
        continue;
      }
      if (await _tap(tester, _text(_T.cont))) continue;
      // Optional onboarding questions before the choice: skip them.
      await _tap(tester, _text(_T.skip));
    }

    expect(finished, isTrue, reason: 'should reach the placement result screen');
    expect(answered, greaterThanOrEqualTo(20),
        reason: 'objective questions answered through the UI');
    expect(skipped, lessThanOrEqualTo(4), reason: 'only writing/speaking skipped');
    // Confirm the result shows a level.
    expect(await _pumpUntil(tester, () => _text(_T.level).evaluate().isNotEmpty),
        isTrue);
    // ignore: avoid_print
    print('E2E placement: answered=$answered skipped=$skipped');
  });
}
