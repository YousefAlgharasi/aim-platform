import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets('AIMToast.show renders top floating toast with message',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: ElevatedButton(
              onPressed: () =>
                  AIMToast.show(context, message: 'Saved successfully'),
              child: const Text('Trigger'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Trigger'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Saved successfully'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle_outline_rounded), findsOneWidget);
  });

  testWidgets('AIMToast.show hides any currently-showing toast first',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: Column(
              children: [
                ElevatedButton(
                  onPressed: () =>
                      AIMToast.show(context, message: 'First toast'),
                  child: const Text('First'),
                ),
                ElevatedButton(
                  onPressed: () =>
                      AIMToast.show(context, message: 'Second toast'),
                  child: const Text('Second'),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('First'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('First toast'), findsOneWidget);

    await tester.tap(find.text('Second'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('First toast'), findsNothing);
    expect(find.text('Second toast'), findsOneWidget);
  });

  testWidgets('AIMToast.showError formats localized English error messages',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('en'),
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Builder(
          builder: (context) => Scaffold(
            body: ElevatedButton(
              onPressed: () => AIMToast.showError(
                context,
                const AppException(
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'Internal server error',
                ),
              ),
              child: const Text('Trigger Error'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Trigger Error'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(
      find.text('Server error. Please try again in a moment.'),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);
  });

  testWidgets('AIMToast.showError formats localized Arabic error messages in RTL',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('ar'),
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Builder(
          builder: (context) => Scaffold(
            body: ElevatedButton(
              onPressed: () => AIMToast.showError(
                context,
                const AppException(
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'Internal server error',
                ),
              ),
              child: const Text('Trigger Arabic Error'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Trigger Arabic Error'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(
      find.text('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.'),
      findsOneWidget,
    );
  });
}
