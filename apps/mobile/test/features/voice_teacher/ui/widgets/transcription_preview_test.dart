import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/transcription_preview.dart';

void main() {
  Future<void> pumpPreview(
    WidgetTester tester, {
    String? transcript,
    bool isLoading = false,
    bool isStudent = true,
    TextDirection dir = TextDirection.ltr,
  }) {
    return tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Directionality(
          textDirection: dir,
          child: Scaffold(
            body: TranscriptionPreview(
              transcript: transcript,
              isLoading: isLoading,
              isStudent: isStudent,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('shows loading indicator when isLoading', (tester) async {
    await pumpPreview(tester, isLoading: true);

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Transcribing...'), findsOneWidget);
  });

  testWidgets('shows Arabic loading text in RTL', (tester) async {
    await pumpPreview(tester, isLoading: true, dir: TextDirection.rtl);

    expect(find.text('جارٍ التحويل...'), findsOneWidget);
  });

  testWidgets('shows nothing when transcript is null', (tester) async {
    await pumpPreview(tester);

    expect(find.byType(SizedBox), findsWidgets);
  });

  testWidgets('shows student transcript with label', (tester) async {
    await pumpPreview(tester, transcript: 'Hello teacher');

    expect(find.text('What you said'), findsOneWidget);
    expect(find.text('Hello teacher'), findsOneWidget);
    expect(find.byIcon(Icons.person), findsOneWidget);
  });

  testWidgets('shows teacher transcript with label', (tester) async {
    await pumpPreview(tester, transcript: 'Good job', isStudent: false);

    expect(find.text('Teacher response'), findsOneWidget);
    expect(find.text('Good job'), findsOneWidget);
    expect(find.byIcon(Icons.smart_toy), findsOneWidget);
  });
}
