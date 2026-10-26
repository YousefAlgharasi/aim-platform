// ignore_for_file: prefer_const_constructors
// Layout matrix: renders every argument-free page on a range of device
// sizes / insets / text scales / locales and asserts that
//   - nothing overflows or throws, and
//   - visible text never sits inside the system-inset area (notch, status
//     bar, gesture bar, landscape cut-outs), i.e. pages keep a safe area.
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show FontLoader;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/certificates/ui/pages/certificate_detail_page.dart';
import 'package:aim_mobile/features/certificates/ui/pages/certificates_list_page.dart';
import 'package:aim_mobile/features/lessons/ui/pages/course_list_page.dart';
import 'package:aim_mobile/features/auth/ui/pages/forgot_password_page.dart';
import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';
import 'package:aim_mobile/features/auth/ui/pages/login_page.dart';
import 'package:aim_mobile/features/profile/ui/pages/edit_profile_page.dart';
import 'package:aim_mobile/features/profile/ui/pages/profile_page.dart';
import 'package:aim_mobile/features/profile/ui/pages/account_settings_page.dart';
import 'package:aim_mobile/features/voice_teacher/ui/pages/live_ai_lesson_chat_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/progress_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/weakness_summary_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/recommendations_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/skill_state_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/review_schedule_page.dart';
import 'package:aim_mobile/features/learning_path/ui/pages/learning_path_page.dart';
import 'package:aim_mobile/features/reviews/ui/pages/review_page.dart';
import 'package:aim_mobile/features/analytics_summary/ui/pages/analytics_summary_page.dart';
import 'package:aim_mobile/features/notifications/ui/pages/notification_inbox_page.dart';
import 'package:aim_mobile/features/notifications/ui/pages/notification_preferences_page.dart';
import 'package:aim_mobile/features/notifications/ui/pages/reminder_settings_page.dart';
import 'package:aim_mobile/features/assessments/ui/pages/deadlines_page.dart';
import 'package:aim_mobile/features/assessments/ui/pages/assessment_list_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/subscription_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/pricing_page.dart';
import 'package:aim_mobile/features/billing/ui/pages/invoice_history_page.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_intro_page.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_start_page.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_menu_page.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_gate_page.dart';
import 'package:aim_mobile/features/home/ui/pages/home_page.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_session_history_page.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_settings_page.dart';
import 'package:aim_mobile/features/support/ui/pages/feedback_page.dart';
import 'package:aim_mobile/features/support/ui/pages/parent_help_center_page.dart';
import 'package:aim_mobile/features/support/ui/pages/help_center_page.dart';
import 'package:aim_mobile/features/support/ui/pages/status_page.dart';
import 'package:aim_mobile/features/support/ui/pages/ticket_list_page.dart';
import 'package:aim_mobile/features/support/ui/pages/parent_ticket_list_page.dart';
import 'package:aim_mobile/features/support/ui/pages/release_notes_page.dart';
import 'package:aim_mobile/features/support/ui/pages/create_ticket_page.dart';
import 'package:aim_mobile/features/achievements/ui/pages/achievements_page.dart';

class _Page {
  _Page(this.name, this.build);
  final String name;
  final Widget Function() build;
}

class _Device {
  const _Device(this.name, this.size, this.insets);
  final String name;
  final Size size;
  final EdgeInsets insets; // left, top, right, bottom (logical px)
}

const _devices = [
  _Device('small-320x568', Size(320, 568), EdgeInsets.only(top: 20)),
  _Device('notch-390x844', Size(390, 844), EdgeInsets.only(top: 47, bottom: 34)),
  _Device('android-412x915', Size(412, 915), EdgeInsets.only(top: 32, bottom: 24)),
  _Device('landscape-844x390', Size(844, 390), EdgeInsets.fromLTRB(47, 0, 47, 21)),
  _Device('tablet-800x1280', Size(800, 1280), EdgeInsets.only(top: 24, bottom: 16)),
];

final _pages = <_Page>[
  _Page('CertificateDetailPage', () => CertificateDetailPage()),
  _Page('CertificatesListPage', () => CertificatesListPage()),
  _Page('CourseListPage', () => CourseListPage()),
  _Page('ForgotPasswordPage', () => ForgotPasswordPage()),
  _Page('RegisterPage', () => RegisterPage()),
  _Page('LoginPage', () => LoginPage()),
  _Page('EditProfilePage', () => EditProfilePage()),
  _Page('ProfilePage', () => ProfilePage()),
  _Page('AccountSettingsPage', () => AccountSettingsPage()),
  _Page('LiveAiLessonChatPage', () => LiveAiLessonChatPage()),
  _Page('ProgressPage', () => ProgressPage()),
  _Page('WeaknessSummaryPage', () => WeaknessSummaryPage()),
  _Page('RecommendationsPage', () => RecommendationsPage()),
  _Page('SkillStatePage', () => SkillStatePage()),
  _Page('ReviewSchedulePage', () => ReviewSchedulePage()),
  _Page('LearningPathPage', () => LearningPathPage()),
  _Page('ReviewPage', () => ReviewPage()),
  _Page('AnalyticsSummaryPage', () => AnalyticsSummaryPage()),
  _Page('NotificationInboxPage', () => NotificationInboxPage()),
  _Page('NotificationPreferencesPage', () => NotificationPreferencesPage()),
  _Page('ReminderSettingsPage', () => ReminderSettingsPage()),
  _Page('DeadlinesPage', () => DeadlinesPage()),
  _Page('AssessmentListPage', () => AssessmentListPage()),
  _Page('SubscriptionPage', () => SubscriptionPage()),
  _Page('PricingPage', () => PricingPage()),
  _Page('InvoiceHistoryPage', () => InvoiceHistoryPage()),
  _Page('PlacementIntroPage', () => PlacementIntroPage()),
  _Page('PlacementStartPage', () => PlacementStartPage()),
  _Page('PlacementMenuPage', () => PlacementMenuPage()),
  _Page('PlacementGatePage', () => PlacementGatePage()),
  _Page('HomePage', () => HomePage()),
  _Page('AiTeacherSessionHistoryPage', () => AiTeacherSessionHistoryPage()),
  _Page('AiTeacherSettingsPage', () => AiTeacherSettingsPage()),
  _Page('FeedbackPage', () => FeedbackPage()),
  _Page('ParentHelpCenterPage', () => ParentHelpCenterPage()),
  _Page('HelpCenterPage', () => HelpCenterPage()),
  _Page('StatusPage', () => StatusPage()),
  _Page('TicketListPage', () => TicketListPage()),
  _Page('ParentTicketListPage', () => ParentTicketListPage()),
  _Page('ReleaseNotesPage', () => ReleaseNotesPage()),
  _Page('CreateTicketPage', () => CreateTicketPage()),
  _Page('AchievementsPage', () => AchievementsPage()),
];

/// flutter_test renders with the "Ahem" font whose glyphs are 1em wide, which
/// reports false overflows. Load the real Roboto from the SDK so text widths
/// are realistic (Arabic glyphs still fall back to Ahem, i.e. are pessimistic).
Future<void> _loadRoboto() async {
  final root = Platform.environment['FLUTTER_ROOT'] ?? '/opt/flutter-sdk/f';
  Future<void> load(String family, List<String> paths) async {
    final loader = FontLoader(family);
    for (final path in paths) {
      final file = File(path);
      if (file.existsSync()) {
        loader.addFont(Future.value(ByteData.sublistView(file.readAsBytesSync())));
      }
    }
    await loader.load();
  }

  final roboto = [
    for (final f in ['Regular', 'Medium', 'Bold'])
      '$root/bin/cache/artifacts/material_fonts/Roboto-$f.ttf',
  ];
  final arabic = ['$root/engine/src/flutter/txt/third_party/fonts/NotoNaskhArabic-Regular.ttf'];
  // The app's families (Inter / IBM Plex Sans Arabic) are not bundled, so
  // alias metrically similar real fonts to them.
  await load('Roboto', roboto);
  await load('Inter', roboto);
  await load('IBM Plex Sans Arabic', arabic);
  await load('Noto Sans Arabic', arabic);
}

void main() {
  setUpAll(_loadRoboto);
  for (final page in _pages) {
    for (final device in _devices) {
      for (final locale in const [Locale('en'), Locale('ar')]) {
        for (final scale in const [1.0, 1.6]) {
          final label =
              '${page.name} @ ${device.name} ${locale.languageCode} x$scale';
          testWidgets(label, (tester) async {
            final view = tester.view;
            view.devicePixelRatio = 1.0;
            view.physicalSize = device.size;
            final fake = FakeViewPadding(
              left: device.insets.left,
              top: device.insets.top,
              right: device.insets.right,
              bottom: device.insets.bottom,
            );
            view.padding = fake;
            view.viewPadding = fake;
            addTearDown(() {
              view.reset();
            });

            final errors = <String>[];
            final prevOnError = FlutterError.onError;
            FlutterError.onError = (d) {
              if (errors.length >= 20) return;
              final loc = RegExp(r'lib/[A-Za-z0-9_/]+\.dart:\d+')
                  .firstMatch(d.toString())
                  ?.group(0);
              errors.add('${d.exceptionAsString().split('\n').first} @ ${loc ?? '?'}');
            };
            addTearDown(() => FlutterError.onError = prevOnError);

            await tester.pumpWidget(
              ProviderScope(
                child: MaterialApp(
                  locale: locale,
                  localizationsDelegates: AppLocale.delegates,
                  supportedLocales: AppLocale.supportedLocales,
                  builder: (context, child) => MediaQuery(
                    data: MediaQuery.of(context)
                        .copyWith(textScaler: TextScaler.linear(scale)),
                    child: child!,
                  ),
                  home: page.build(),
                ),
              ),
            );
            await tester.pump(const Duration(milliseconds: 400));

            // 1. no overflow / build errors
            tester.takeException();
            FlutterError.onError = prevOnError;
            expect(errors.toSet(), isEmpty);

            // 2. visible text stays out of the system-inset areas
            final w = device.size.width, h = device.size.height;
            final ins = device.insets;
            const tol = 0.5;
            final offenders = <String>[];
            for (final e in find.byType(Text).evaluate()) {
              final box = e.renderObject;
              if (box is! RenderBox || !box.hasSize || !box.attached) continue;
              final r = box.localToGlobal(Offset.zero) & box.size;
              if (r.isEmpty) continue;
              final onScreen = r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
              if (!onScreen) continue;
              final inScroll = e.findAncestorWidgetOfExactType<Scrollable>() != null;
              final text = (e.widget as Text).data ?? (e.widget as Text).textSpan?.toPlainText() ?? '';
              if (r.left < ins.left - tol || r.right > w - ins.right + tol) {
                offenders.add('horizontal "$text" $r');
              }
              if (r.top < ins.top - tol && r.bottom > 0) {
                offenders.add('top "$text" $r');
              }
              if (!inScroll && r.bottom > h - ins.bottom + tol && r.top < h) {
                offenders.add('bottom "$text" $r');
              }
            }
            expect(offenders, isEmpty, reason: offenders.take(5).join('\n'));
          });
        }
      }
    }
  }
}
