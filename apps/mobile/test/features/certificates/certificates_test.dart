import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aim_mobile/features/certificates/data/models/certificate_model.dart';
import 'package:aim_mobile/features/certificates/ui/pages/certificate_detail_page.dart';
import 'package:aim_mobile/features/certificates/ui/pages/certificates_list_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

void main() {
  group('CertificateModel', () {
    test('parses correctly with 1,000-point breakdown', () {
      final json = {
        'id': 'cert-123',
        'studentId': 'student-abc',
        'courseId': 'course-en-a1',
        'courseTitle': 'English A1.1 Beginners',
        'studentName': 'Ahmed Al-Alawi',
        'issuedAt': '2026-10-18T10:00:00.000Z',
        'scoreSnapshot': [
          {
            'assessmentId': 'quiz-1',
            'title': 'Chapter 1 Quiz',
            'type': 'quiz',
            'score': 9,
            'maxScore': 10,
            'scorePercent': 90,
            'passed': true,
          },
          {
            'assessmentId': 'exam-final',
            'title': 'Course Final Exam',
            'type': 'exam',
            'score': 95,
            'maxScore': 100,
            'scorePercent': 95,
            'passed': true,
          }
        ],
        'breakdown': {
          'practicePoints': 180,
          'practiceAccuracyPercent': 90,
          'quizPoints': 190,
          'quizAveragePercent': 95,
          'chapterExamPoints': 185,
          'chapterExamAveragePercent': 93,
          'finalExamPoints': 380,
          'finalExamPercent': 95,
          'totalPoints': 935,
          'overallPercent': 94,
        },
        'totalPoints': 935,
        'overallScorePercent': 94,
        'verificationUrl': 'https://aim-platform.com/verify/cert-123',
      };

      final cert = CertificateModel.fromJson(json);

      expect(cert.id, 'cert-123');
      expect(cert.studentId, 'student-abc');
      expect(cert.courseTitle, 'English A1.1 Beginners');
      expect(cert.studentName, 'Ahmed Al-Alawi');
      expect(cert.totalPoints, 935);
      expect(cert.overallScorePercent, 94);
      expect(cert.verificationUrl, 'https://aim-platform.com/verify/cert-123');

      final bd = cert.breakdown!;
      expect(bd.practicePoints, 180);
      expect(bd.quizPoints, 190);
      expect(bd.chapterExamPoints, 185);
      expect(bd.finalExamPoints, 380);
      expect(bd.totalPoints, 935);
      expect(bd.overallPercent, 94);
    });

    test('fallbacks gracefully when breakdown is missing', () {
      final json = {
        'id': 'cert-legacy',
        'studentId': 'student-1',
        'courseId': 'course-1',
        'courseTitle': 'Legacy Course',
        'issuedAt': '2026-01-01T00:00:00.000Z',
        'overallScorePercent': 85,
      };

      final cert = CertificateModel.fromJson(json);
      expect(cert.id, 'cert-legacy');
      expect(cert.breakdown, isNull);
      expect(cert.overallScorePercent, 85);
      expect(cert.totalPoints, 850);
    });
  });

  group('CertificateDetailPage Widgets', () {
    testWidgets('renders certificate document and 1,000-point breakdown in English (LTR)', (tester) async {
      final cert = CertificateModel(
        id: 'cert-test-456',
        studentId: 'student-99',
        courseId: 'course-en-a1',
        courseTitle: 'English A1.1 Beginners',
        studentName: 'Sami Ali',
        issuedAt: DateTime(2026, 10, 18),
        breakdown: const CertificateScoreBreakdownModel(
          practicePoints: 190,
          practiceAccuracyPercent: 95,
          quizPoints: 180,
          quizAveragePercent: 90,
          chapterExamPoints: 195,
          chapterExamAveragePercent: 98,
          finalExamPoints: 370,
          finalExamPercent: 93,
          totalPoints: 935,
          overallPercent: 94,
        ),
        totalPoints: 935,
        overallScorePercent: 94,
        verificationUrl: 'https://aim-platform.com/verify/cert-test-456',
      );

      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: const Locale('en'),
          home: CertificateDetailPage(initialCertificate: cert),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('AIM Language Platform'), findsOneWidget);
      expect(find.text('Sami Ali'), findsOneWidget);
      expect(find.text('English A1.1 Beginners'), findsOneWidget);
      expect(find.text('935 / 1000 pts'), findsOneWidget);
      expect(find.text('94%'), findsOneWidget);
      expect(find.text('190 / 200 pts'), findsOneWidget);
      expect(find.text('370 / 400 pts'), findsOneWidget);
      expect(find.text('Copy Verification Link'), findsOneWidget);
    });

    testWidgets('renders correctly in Arabic (RTL) adhering to Rule 12', (tester) async {
      final cert = CertificateModel(
        id: 'cert-ar-789',
        studentId: 'student-ar',
        courseId: 'course-en-a1',
        courseTitle: 'اللغة الإنجليزية للمبتدئين A1.1',
        studentName: 'أحمد العلوي',
        issuedAt: DateTime(2026, 10, 18),
        breakdown: const CertificateScoreBreakdownModel(
          practicePoints: 200,
          practiceAccuracyPercent: 100,
          quizPoints: 190,
          quizAveragePercent: 95,
          chapterExamPoints: 190,
          chapterExamAveragePercent: 95,
          finalExamPoints: 400,
          finalExamPercent: 100,
          totalPoints: 980,
          overallPercent: 98,
        ),
        totalPoints: 980,
        overallScorePercent: 98,
        verificationUrl: 'https://aim-platform.com/verify/cert-ar-789',
      );

      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          locale: const Locale('ar'),
          home: Directionality(
            textDirection: TextDirection.rtl,
            child: CertificateDetailPage(initialCertificate: cert),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('AIM Language Platform'), findsOneWidget);
      expect(find.text('أحمد العلوي'), findsOneWidget);
      expect(find.text('اللغة الإنجليزية للمبتدئين A1.1'), findsOneWidget);
      expect(find.text('980 / 1000 pts'), findsOneWidget);
      expect(find.text('98%'), findsOneWidget);
      expect(find.text('نسخ رابط التحقق'), findsOneWidget);
    });
  });
}
