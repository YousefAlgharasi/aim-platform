import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

void main() {
  testWidgets(
      'AIMInput supports label, error, keyboard type, and password reveal',
      (tester) async {
    await tester.pumpAimWidget(
      const AIMInput(
        label: 'Email',
        required: true,
        error: 'Enter a valid email',
        type: AIMInputType.email,
        leadingIcon: Icon(Icons.mail_outline),
        placeholder: 'you@example.com',
      ),
    );

    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Enter a valid email'), findsOneWidget);
    expect(find.byIcon(Icons.mail_outline), findsOneWidget);
    expect(
      tester.widget<TextField>(find.byType(TextField)).keyboardType,
      TextInputType.emailAddress,
    );

    await tester.pumpAimWidget(
      const AIMInput(
        label: 'Password',
        type: AIMInputType.password,
      ),
    );

    expect(
        tester.widget<TextField>(find.byType(TextField)).obscureText, isTrue);
    await tester.tap(find.byIcon(Icons.visibility_outlined));
    await tester.pump();
    expect(
        tester.widget<TextField>(find.byType(TextField)).obscureText, isFalse);
  });

  testWidgets('AIMTextarea shows helper and max-length counter',
      (tester) async {
    final controller = TextEditingController(text: 'Hello');
    addTearDown(controller.dispose);

    await tester.pumpAimWidget(
      AIMTextarea(
        label: 'Answer',
        helper: 'Write in English',
        maxLength: 20,
        controller: controller,
      ),
    );

    expect(find.text('Write in English'), findsOneWidget);
    expect(find.text('5/20'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'Hello AIM');
    await tester.pump();
    expect(find.text('9/20'), findsOneWidget);
  });

  testWidgets('AIMSelect supports placeholder, options, disabled, and errors',
      (tester) async {
    String? selected;

    await tester.pumpAimWidget(
      AIMSelect(
        label: 'Level',
        placeholder: 'Choose a level',
        error: 'Choose one',
        options: const [
          AIMSelectOption(value: 'a1', label: 'Beginner'),
          AIMSelectOption(value: 'b1', label: 'Intermediate'),
        ],
        onChanged: (value) => selected = value,
      ),
    );

    expect(find.text('Choose a level'), findsOneWidget);
    expect(find.text('Choose one'), findsOneWidget);

    await tester.tap(find.byType(DropdownButton<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Intermediate').last);
    await tester.pumpAndSettle();
    expect(selected, 'b1');

    await tester.pumpAimWidget(
      AIMSelect(
        disabled: true,
        value: 'a1',
        options: const [
          AIMSelectOption(value: 'a1', label: 'Beginner'),
        ],
        onChanged: (value) => selected = value,
      ),
    );

    expect(
        tester
            .widget<DropdownButton<String>>(find.byType(DropdownButton<String>))
            .onChanged,
        isNull);
  });

  testWidgets('AIMCheckbox supports indeterminate and disabled state',
      (tester) async {
    bool? value;

    await tester.pumpAimWidget(
      AIMCheckbox(
        label: 'Select all',
        indeterminate: true,
        onChanged: (next) => value = next,
      ),
    );

    expect(find.byIcon(Icons.remove_rounded), findsOneWidget);
    await tester.tap(find.byType(AIMCheckbox));
    expect(value, isTrue);

    await tester.pumpAimWidget(
      AIMCheckbox(
        label: 'Disabled',
        disabled: true,
        onChanged: (next) => value = next,
      ),
    );

    await tester.tap(find.byType(AIMCheckbox));
    expect(value, isTrue);
  });

  testWidgets('AIMRadio supports group selection', (tester) async {
    String group = 'monthly';

    await tester.pumpAimWidget(
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AIMRadio<String>(
            label: 'Monthly',
            value: 'monthly',
            groupValue: group,
            onChanged: (value) => group = value!,
          ),
          AIMRadio<String>(
            label: 'Yearly',
            value: 'yearly',
            groupValue: group,
            onChanged: (value) => group = value!,
          ),
        ],
      ),
    );

    await tester.tap(find.text('Yearly'));
    expect(group, 'yearly');
  });

  testWidgets('AIMSwitch moves checked thumb to logical end in RTL',
      (tester) async {
    bool value = true;

    await tester.pumpAimWidget(
      AIMSwitch(
        label: 'Daily reminders',
        value: value,
        onChanged: (next) => value = next,
      ),
      textDirection: TextDirection.rtl,
    );

    final trackCenter = tester.getCenter(find.byType(AnimatedContainer));
    final thumbCenter = tester.getCenter(find.byType(DecoratedBox).last);
    expect(thumbCenter.dx, lessThan(trackCenter.dx));

    await tester.tap(find.byType(AIMSwitch));
    expect(value, isFalse);
  });

  testWidgets('AIMOTPInput auto-advances, pastes, backspaces, and completes',
      (tester) async {
    var code = '';
    var completed = '';

    await tester.pumpAimWidget(
      AIMOTPInput(
        length: 4,
        value: code,
        onChanged: (next) => code = next,
        onCompleted: (next) => completed = next,
      ),
      textDirection: TextDirection.rtl,
    );

    final cells = find.byType(TextField);
    expect(cells, findsNWidgets(4));

    final firstCenter = tester.getCenter(cells.at(0));
    final lastCenter = tester.getCenter(cells.at(3));
    expect(firstCenter.dx, lessThan(lastCenter.dx));

    await tester.enterText(cells.at(0), '12a34');
    await tester.pump();
    expect(code, '1234');
    expect(completed, '1234');

    await tester.enterText(cells.at(3), '');
    await tester.pump();
    expect(code, '123');
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
