import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets('AIMCard supports gradient, AI ring, padding, and taps',
      (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      AIMCard(
        variant: AIMCardVariant.gradient,
        interactive: true,
        onTap: () => taps += 1,
        semanticLabel: 'AI streak card',
        child: const Text('Streak'),
      ),
    );

    expect(_cardDecoration(tester).gradient, AimGradients.ai);
    expect(
      tester
          .widget<DefaultTextStyle>(find.byType(DefaultTextStyle).last)
          .style
          .color,
      AimColors.neutral0,
    );

    await tester.tap(find.byType(AIMCard));
    expect(taps, 1);

    await tester.pumpAimWidget(
      const AIMCard(
        variant: AIMCardVariant.ai,
        padded: false,
        child: Text('AI feedback'),
      ),
    );

    expect(_cardDecoration(tester).gradient, AimGradients.ai);
    expect(find.byType(Padding), findsAtLeastNWidgets(1));
  });

  testWidgets('AIMBadge maps semantic tones and variants', (tester) async {
    await tester.pumpAimWidget(
      const Wrap(
        children: [
          AIMBadge(
            tone: AIMBadgeTone.success,
            dot: true,
            child: Text('Completed'),
          ),
          AIMBadge(
            tone: AIMBadgeTone.warning,
            variant: AIMBadgeVariant.outline,
            pill: true,
            icon: Icon(Icons.warning_amber_rounded),
            child: Text('Needs review'),
          ),
          AIMBadge(
            tone: AIMBadgeTone.secondary,
            variant: AIMBadgeVariant.solid,
            child: Text('New'),
          ),
        ],
      ),
    );

    final successDecoration = _badgeDecoration(tester, 'Completed');
    expect(successDecoration.color, AimColorTheme.light.successSoft);

    final warningDecoration = _badgeDecoration(tester, 'Needs review');
    expect(warningDecoration.color, Colors.transparent);
    expect(warningDecoration.borderRadius, AimRadius.borderPill);

    final newDecoration = _badgeDecoration(tester, 'New');
    expect(newDecoration.color, AimColors.secondary500);
  });

  testWidgets('feedback soft tones use dark theme readable mappings',
      (tester) async {
    await tester.pumpAimWidget(
      const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AIMBadge(
            tone: AIMBadgeTone.info,
            child: Text('Info'),
          ),
          AIMAlertBanner(
            tone: AIMAlertTone.success,
            child: Text('Saved'),
          ),
        ],
      ),
      theme: AppTheme.dark,
    );

    final badgeDecoration = _badgeDecoration(tester, 'Info');
    final alertDecoration = _alertDecoration(tester);

    expect(badgeDecoration.color, AimColorTheme.dark.infoSoft);
    expect(alertDecoration.color, AimColorTheme.dark.successSoft);
  });

  testWidgets('AIMChip supports selected, removable, disabled, and RTL',
      (tester) async {
    final semantics = tester.ensureSemantics();
    var chipTaps = 0;
    var removes = 0;

    await tester.pumpAimWidget(
      AIMChip(
        selected: true,
        removable: true,
        icon: const Icon(Icons.notifications_outlined),
        onPressed: () => chipTaps += 1,
        onRemove: () => removes += 1,
        child: const Text('Review due'),
      ),
      textDirection: TextDirection.rtl,
    );

    expect(_chipDecoration(tester).color, AimColorTheme.light.primarySoft);
    expect(find.bySemanticsLabel('Remove'), findsOneWidget);

    final labelCenter = tester.getCenter(find.text('Review due'));
    final removeCenter = tester.getCenter(find.byIcon(Icons.close_rounded));
    expect(removeCenter.dx, lessThan(labelCenter.dx));

    await tester.tap(find.byIcon(Icons.close_rounded));
    expect(removes, 1);
    expect(chipTaps, 0);

    await tester.tap(find.byType(AIMChip));
    expect(chipTaps, 1);

    await tester.pumpAimWidget(
      AIMChip(
        disabled: true,
        onPressed: () => chipTaps += 1,
        child: const Text('Disabled'),
      ),
    );

    expect(_chipDecoration(tester).color, AimColorTheme.light.disabledBg);
    await tester.tap(find.byType(AIMChip));
    expect(chipTaps, 1);

    semantics.dispose();
  });

  testWidgets('AIMAlertBanner maps tones, action, dismiss, and semantics',
      (tester) async {
    final semantics = tester.ensureSemantics();
    var dismisses = 0;

    await tester.pumpAimWidget(
      AIMAlertBanner(
        tone: AIMAlertTone.error,
        title: "Couldn't save",
        dismissible: true,
        onDismiss: () => dismisses += 1,
        action: TextButton(
          onPressed: () {},
          child: const Text('Retry'),
        ),
        child: const Text('Check your connection.'),
      ),
    );

    expect(find.bySemanticsLabel('Dismiss'), findsOneWidget);
    expect(find.text("Couldn't save"), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);
    expect(_alertDecoration(tester).color, AimColorTheme.light.errorSoft);

    await tester.tap(find.byIcon(Icons.close_rounded));
    expect(dismisses, 1);

    semantics.dispose();
  });

  testWidgets('AIMSkeleton supports shapes, lines, and reduced motion',
      (tester) async {
    await tester.pumpAimWidget(
      const SizedBox(
        width: 200,
        child: AIMSkeleton(lines: 3),
      ),
      mediaQueryData: const MediaQueryData(disableAnimations: true),
    );

    expect(find.byType(ShaderMask), findsNothing);
    expect(find.byType(DecoratedBox), findsNWidgets(3));

    await tester.pumpAimWidget(
      const AIMSkeleton(
        shape: AIMSkeletonShape.circle,
        width: 40,
        height: 40,
      ),
    );

    expect(find.byType(ShaderMask), findsOneWidget);
    final circleDecoration = tester
        .widget<DecoratedBox>(find.byType(DecoratedBox))
        .decoration as BoxDecoration;
    expect(circleDecoration.shape, BoxShape.circle);
  });
}

extension on WidgetTester {
  Future<void> pumpAimWidget(
    Widget child, {
    TextDirection textDirection = TextDirection.ltr,
    ThemeData? theme,
    MediaQueryData? mediaQueryData,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: theme ?? AppTheme.light,
        home: MediaQuery(
          data: mediaQueryData ?? const MediaQueryData(),
          child: Directionality(
            textDirection: textDirection,
            child: Scaffold(body: Center(child: child)),
          ),
        ),
      ),
    );
  }
}

BoxDecoration _cardDecoration(WidgetTester tester) {
  final cardContainer = tester.widget<AnimatedContainer>(
    find
        .descendant(
          of: find.byType(AIMCard),
          matching: find.byType(AnimatedContainer),
        )
        .first,
  );

  return cardContainer.decoration as BoxDecoration;
}

BoxDecoration _badgeDecoration(WidgetTester tester, String text) {
  final decoratedBox = tester.widget<DecoratedBox>(
    find.ancestor(
      of: find.text(text),
      matching: find.byType(DecoratedBox),
    ),
  );

  return decoratedBox.decoration as BoxDecoration;
}

BoxDecoration _chipDecoration(WidgetTester tester) {
  final chipContainer = tester.widget<AnimatedContainer>(
    find
        .descendant(
          of: find.byType(AIMChip),
          matching: find.byType(AnimatedContainer),
        )
        .first,
  );

  return chipContainer.decoration as BoxDecoration;
}

BoxDecoration _alertDecoration(WidgetTester tester) {
  final decoratedBox = tester.widget<DecoratedBox>(
    find
        .descendant(
          of: find.byType(AIMAlertBanner),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );

  return decoratedBox.decoration as BoxDecoration;
}
