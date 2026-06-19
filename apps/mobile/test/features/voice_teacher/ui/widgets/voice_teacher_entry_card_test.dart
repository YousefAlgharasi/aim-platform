import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_teacher_entry_card.dart';

void main() {
  Future<void> pumpCard(
    WidgetTester tester, {
    required VoidCallback onTap,
    TextDirection dir = TextDirection.ltr,
  }) {
    return tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Directionality(
          textDirection: dir,
          child: Scaffold(body: Center(child: VoiceTeacherEntryCard(onTap: onTap))),
        ),
      ),
    );
  }

  testWidgets('renders title, subtitle, and mic icon in LTR', (tester) async {
    await pumpCard(tester, onTap: () {});

    expect(find.text('Voice Teacher'), findsOneWidget);
    expect(find.text('Talk with your teacher using voice'), findsOneWidget);
    expect(find.byIcon(Icons.mic), findsOneWidget);
    expect(find.byIcon(Icons.chevron_right), findsOneWidget);
  });

  testWidgets('renders Arabic text and left chevron in RTL', (tester) async {
    await pumpCard(tester, onTap: () {}, dir: TextDirection.rtl);

    expect(find.text('المعلم الصوتي'), findsOneWidget);
    expect(find.text('تحدث مع معلمك بالصوت'), findsOneWidget);
    expect(find.byIcon(Icons.chevron_left), findsOneWidget);
  });

  testWidgets('invokes onTap callback', (tester) async {
    var taps = 0;
    await pumpCard(tester, onTap: () => taps++);

    await tester.tap(find.byType(VoiceTeacherEntryCard));
    expect(taps, 1);
  });
}
