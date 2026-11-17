import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/guided_tour/data/tour_definitions.dart';
import 'package:aim_mobile/features/guided_tour/ui/guided_tour_spotlight.dart';
import 'package:aim_mobile/features/guided_tour/ui/tour_target.dart';

Widget _app({
  required Locale locale,
  required List<TourStep> steps,
  required VoidCallback onFinish,
  bool includeSecondTarget = true,
}) {
  return MaterialApp(
    locale: locale,
    localizationsDelegates: AppLocale.delegates,
    supportedLocales: AppLocale.supportedLocales,
    home: Scaffold(
      body: Stack(
        children: [
          ListView(
            children: [
              const TourTarget(
                id: 'daily-goal',
                child: SizedBox(height: 120, child: Text('goal')),
              ),
              const SizedBox(height: 200),
              if (includeSecondTarget)
                const TourTarget(
                  id: 'word-of-day',
                  child: SizedBox(height: 120, child: Text('word')),
                ),
            ],
          ),
          GuidedTourSpotlight(steps: steps, onFinish: onFinish),
        ],
      ),
    ),
  );
}

List<TourStep> get _steps => [
      for (final s in tourById(dashboardTourId)!.steps)
        if (s.target == 'daily-goal' || s.target == 'word-of-day') s,
    ];

void main() {
  testWidgets('shows the first step in English with counter, Skip and Next',
      (tester) async {
    await tester.pumpWidget(_app(
      locale: const Locale('en'),
      steps: _steps,
      onFinish: () {},
    ));
    await tester.pump(const Duration(milliseconds: 400));

    expect(find.text('Your daily goal'), findsOneWidget);
    expect(find.text('Finish your daily lessons to fill this ring.'),
        findsOneWidget);
    expect(find.text('1 of 2'), findsOneWidget);
    expect(find.text('Skip tour'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
    expect(find.text('Back'), findsNothing);
  });

  testWidgets('Next, Back and Done move through the steps and then finish',
      (tester) async {
    var finished = 0;
    await tester.pumpWidget(_app(
      locale: const Locale('en'),
      steps: _steps,
      onFinish: () => finished++,
    ));
    await tester.pump(const Duration(milliseconds: 400));

    await tester.tap(find.text('Next'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Word of the day'), findsOneWidget);
    expect(find.text('2 of 2'), findsOneWidget);
    expect(find.text('Done'), findsOneWidget);

    await tester.tap(find.text('Back'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Your daily goal'), findsOneWidget);

    await tester.tap(find.text('Next'));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(find.text('Done'));
    await tester.pump();
    expect(finished, 1);
  });

  testWidgets('Skip tour finishes straight away', (tester) async {
    var finished = 0;
    await tester.pumpWidget(_app(
      locale: const Locale('en'),
      steps: _steps,
      onFinish: () => finished++,
    ));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(find.text('Skip tour'));
    await tester.pump();
    expect(finished, 1);
  });

  testWidgets('a step whose element is missing is skipped', (tester) async {
    var finished = 0;
    await tester.pumpWidget(_app(
      locale: const Locale('en'),
      steps: _steps,
      onFinish: () => finished++,
      includeSecondTarget: false,
    ));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Your daily goal'), findsOneWidget);
    expect(finished, 0);

    // The next step's element is not on screen: it is skipped, and with no
    // step left the tour ends.
    await tester.tap(find.text('Next'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(finished, 1);
  });

  testWidgets('Arabic: Arabic copy, RTL, and the card stays on screen',
      (tester) async {
    await tester.pumpWidget(_app(
      locale: const Locale('ar'),
      steps: _steps,
      onFinish: () {},
    ));
    await tester.pump(const Duration(milliseconds: 400));

    expect(find.text('هدفك اليومي'), findsOneWidget);
    expect(find.text('1 من 2'), findsOneWidget);
    expect(find.text('تخطي الجولة'), findsOneWidget);
    expect(find.text('التالي'), findsOneWidget);
    expect(Directionality.of(tester.element(find.text('هدفك اليومي'))),
        TextDirection.rtl);

    final card = tester.getRect(find.ancestor(
      of: find.text('هدفك اليومي'),
      matching: find.byType(Material),
    ).first);
    final screen = tester.view.physicalSize / tester.view.devicePixelRatio;
    expect(card.left, greaterThanOrEqualTo(0));
    expect(card.right, lessThanOrEqualTo(screen.width));
    expect(card.bottom, lessThanOrEqualTo(screen.height));
    expect(tester.takeException(), isNull);
  });

  testWidgets('Arabic long text does not overflow on a narrow phone',
      (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(_app(
      locale: const Locale('ar'),
      steps: _steps,
      onFinish: () {},
    ));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(find.text('التالي'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(tester.takeException(), isNull);
    expect(find.text('كلمة اليوم'), findsOneWidget);
  });
}
