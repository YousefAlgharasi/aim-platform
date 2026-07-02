// Smoke test for the debug-only design system preview screen — pumps each
// tab (including the newly added TASK-00 widget showcases: gradient hero
// header, app drawer, notifications sheet, gradient button, blob card,
// stat tile, skill blob) to catch build-time rendering errors.
//
// Uses fixed pump() calls rather than pumpAndSettle(): some showcased
// widgets (the typing AI feedback bubble, record button pulse) animate
// indefinitely, which would make pumpAndSettle time out.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/design_system_preview/ui/pages/ds_preview_page.dart';

Future<void> _settle(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 500));
}

void main() {
  group('DSPreviewPage', () {
    testWidgets('renders every tab without error', (tester) async {
      await tester.pumpWidget(const DSPreviewPage());
      await _settle(tester);

      const tabs = [
        'Foundations',
        'Buttons',
        'Forms',
        'Feedback',
        'Navigation',
        'Learning',
      ];

      for (final tab in tabs) {
        await tester.tap(find.text(tab));
        await _settle(tester);
        expect(tester.takeException(), isNull);
      }
    });

    testWidgets('Navigation tab: opens the app drawer without error',
        (tester) async {
      await tester.pumpWidget(const DSPreviewPage());
      await _settle(tester);

      await tester.tap(find.text('Navigation'));
      await _settle(tester);

      await tester.tap(find.text('Open drawer'));
      await _settle(tester);
      expect(tester.takeException(), isNull);
      expect(find.text('Sara Ahmed'), findsOneWidget);
    });

    testWidgets(
        'Navigation tab: opens the notifications sheet without error',
        (tester) async {
      await tester.pumpWidget(const DSPreviewPage());
      await _settle(tester);

      await tester.tap(find.text('Navigation'));
      await _settle(tester);

      await tester.scrollUntilVisible(
        find.text('Show notifications'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Show notifications'));
      await _settle(tester);
      expect(tester.takeException(), isNull);
      expect(find.text('Review due: Past Simple'), findsOneWidget);
    });
  });
}
