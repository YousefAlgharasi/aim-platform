import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/widgets/buttons/buttons.dart';

void main() {
  testWidgets('AIMButton keeps visual size and minimum touch target',
      (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      Center(
        child: AIMButton(
          size: AIMButtonSize.small,
          onPressed: () => taps += 1,
          child: const Text('Small'),
        ),
      ),
    );

    expect(tester.getSize(find.byType(AIMButton)).height, AimSizes.touchTarget);
    expect(_visualSizeOf<AIMButton>(tester).height, AimSizes.buttonSm);

    await tester.tap(find.byType(AIMButton));
    expect(taps, 1);
  });

  testWidgets('AIMButton supports variants, full width, loading, and disabled',
      (tester) async {
    var taps = 0;

    await tester.pumpAimWidget(
      SizedBox(
        width: 320,
        child: AIMButton(
          fullWidth: true,
          variant: AIMButtonVariant.destructive,
          onPressed: () => taps += 1,
          child: const Text('Delete'),
        ),
      ),
    );

    final destructiveDecoration = _visualDecorationOf<AIMButton>(tester);
    expect(destructiveDecoration.color, AimColors.error500);
    expect(tester.getSize(find.byType(AIMButton)).width, 320);

    await tester.tap(find.byType(AIMButton));
    expect(taps, 1);

    await tester.pumpAimWidget(
      AIMButton(
        loading: true,
        onPressed: () => taps += 1,
        child: const Text('Loading'),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.tap(find.byType(AIMButton));
    expect(taps, 1);

    await tester.pumpAimWidget(
      AIMButton(
        disabled: true,
        onPressed: () => taps += 1,
        child: const Text('Disabled'),
      ),
    );

    final disabledDecoration = _visualDecorationOf<AIMButton>(tester);
    expect(disabledDecoration.color, AimColorTheme.light.disabledBg);
    await tester.tap(find.byType(AIMButton));
    expect(taps, 1);
  });

  testWidgets('AIMButton leading and trailing icons follow text direction',
      (tester) async {
    const leadingKey = Key('leading-icon');
    const trailingKey = Key('trailing-icon');

    await tester.pumpAimWidget(
      AIMButton(
        leadingIcon: const Icon(Icons.play_arrow, key: leadingKey),
        trailingIcon: const Icon(Icons.chevron_right, key: trailingKey),
        onPressed: () {},
        child: const Text('Continue'),
      ),
      textDirection: TextDirection.rtl,
    );

    final labelCenter = tester.getCenter(find.text('Continue'));
    final leadingCenter = tester.getCenter(find.byKey(leadingKey));
    final trailingCenter = tester.getCenter(find.byKey(trailingKey));

    expect(leadingCenter.dx, greaterThan(labelCenter.dx));
    expect(trailingCenter.dx, lessThan(labelCenter.dx));
  });

  testWidgets(
      'AIMIconButton supports semantic label, round style, and disabled',
      (tester) async {
    final semantics = tester.ensureSemantics();
    var taps = 0;

    await tester.pumpAimWidget(
      AIMIconButton(
        semanticLabel: 'Search',
        size: AIMIconButtonSize.small,
        variant: AIMIconButtonVariant.outline,
        round: true,
        onPressed: () => taps += 1,
        icon: const Icon(Icons.search),
      ),
    );

    expect(find.bySemanticsLabel('Search'), findsOneWidget);
    expect(
      tester.getSize(find.byType(AIMIconButton)).height,
      AimSizes.touchTarget,
    );
    expect(_visualSizeOf<AIMIconButton>(tester).height, AimSizes.buttonSm);
    expect(_visualDecorationOf<AIMIconButton>(tester).borderRadius,
        AimRadius.borderPill);

    await tester.tap(find.byType(AIMIconButton));
    expect(taps, 1);

    await tester.pumpAimWidget(
      AIMIconButton(
        semanticLabel: 'Disabled search',
        disabled: true,
        onPressed: () => taps += 1,
        icon: const Icon(Icons.search),
      ),
    );

    await tester.tap(find.byType(AIMIconButton));
    expect(taps, 1);

    semantics.dispose();
  });

  testWidgets('AIMFab supports gradient default, solid mode, and extension',
      (tester) async {
    final semantics = tester.ensureSemantics();
    var taps = 0;

    await tester.pumpAimWidget(
      AIMFab(
        semanticLabel: 'Ask AI Tutor',
        icon: const Icon(Icons.auto_awesome),
        onPressed: () => taps += 1,
      ),
    );

    expect(find.bySemanticsLabel('Ask AI Tutor'), findsOneWidget);
    expect(_fabDecorationOf(tester).gradient, AimGradients.ai);
    await tester.tap(find.byType(AIMFab));
    expect(taps, 1);

    await tester.pumpAimWidget(
      AIMFab(
        semanticLabel: 'Practice speaking',
        gradient: false,
        extended: true,
        icon: const Icon(Icons.mic),
        onPressed: () => taps += 1,
        child: const Text('Practice'),
      ),
    );

    expect(find.text('Practice'), findsOneWidget);
    expect(_fabDecorationOf(tester).gradient, isNull);
    expect(_fabDecorationOf(tester).color, AimColors.primary500);

    semantics.dispose();
  });
}

extension on WidgetTester {
  Future<void> pumpAimWidget(
    Widget child, {
    TextDirection textDirection = TextDirection.ltr,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Directionality(
          textDirection: textDirection,
          child: Scaffold(body: Center(child: child)),
        ),
      ),
    );
  }
}

Size _visualSizeOf<T extends Widget>(WidgetTester tester) {
  return tester.getSize(
    find
        .descendant(
          of: find.byType(T),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );
}

BoxDecoration _visualDecorationOf<T extends Widget>(WidgetTester tester) {
  final decoratedBox = tester.widget<DecoratedBox>(
    find
        .descendant(
          of: find.byType(T),
          matching: find.byType(DecoratedBox),
        )
        .first,
  );

  return decoratedBox.decoration as BoxDecoration;
}

BoxDecoration _fabDecorationOf(WidgetTester tester) {
  final ink = tester.widget<Ink>(
    find.descendant(
      of: find.byType(AIMFab),
      matching: find.byType(Ink),
    ),
  );

  return ink.decoration as BoxDecoration;
}
