import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/course_billing/data/course_billing_models.dart';
import 'package:aim_mobile/features/course_billing/logic/course_billing_providers.dart';
import 'package:aim_mobile/features/course_billing/ui/pages/course_claim_page.dart';
import 'package:aim_mobile/features/course_billing/ui/pages/my_course_payments_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

const _price = {
  'isFree': false, 'currency': 'YER', 'originalAmount': 10000, 'discountAmount': 2000,
  'amount': 8000, 'discountActive': true, 'discountEndsAt': '2026-12-01T00:00:00Z', 'accessDays': 30,
};

CourseBilling _billing(String status, {int? daysLeft, String? note}) => CourseBilling.fromJson({
      'courseId': 'c1',
      'price': _price,
      'access': {
        'status': status,
        'hasAccess': status == 'active' || status == 'completed' || status == 'free',
        'startsAt': null,
        'expiresAt': status == 'active' ? '2026-11-25T12:00:00Z' : null,
        'daysLeft': daysLeft,
        'rejectionNote': note,
      },
    });

final _wallets = [
  PaymentWallet.fromJson({
    'id': 'w1', 'name': 'Jawali', 'accountName': 'AIM Academy', 'accountNumber': '777123456',
    'instructions': 'Send the exact amount', 'logoUrl': null, 'qrImageUrl': null,
  }),
  PaymentWallet.fromJson({'id': 'w2', 'name': 'Kuraimi', 'logoUrl': null, 'qrImageUrl': null}),
];

Widget _wrap(Widget child, {required CourseBilling billing, Locale locale = const Locale('en'), List<PaymentWallet>? wallets}) {
  return ProviderScope(
    overrides: [
      courseBillingProvider('c1').overrideWith((ref) async => billing),
      paymentWalletsProvider.overrideWith((ref) async => wallets ?? _wallets),
    ],
    child: MaterialApp(
      theme: AppTheme.light,
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: child,
    ),
  );
}

void _phone(WidgetTester tester) {
  tester.view.physicalSize = const Size(360 * 3, 780 * 3);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
}

const _page = CourseClaimPage(courseId: 'c1', courseTitle: 'English Basics');

Finder _scrollable() => find.byType(Scrollable).first;

void main() {
  testWidgets('shows the discounted price, time rule and payment steps', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('none')));
    await tester.pumpAndSettle();

    expect(find.text('English Basics'), findsOneWidget);
    expect(find.text('8,000 YER'), findsOneWidget);
    expect(find.text('10,000 YER'), findsOneWidget);
    expect(find.textContaining('30 days to finish'), findsOneWidget);
    expect(find.text('1. Choose the wallet you paid with'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('Send payment for review'), 200, scrollable: _scrollable());
    final submit = tester.widget<AIMButton>(
      find.ancestor(of: find.text('Send payment for review'), matching: find.byType(AIMButton)).first,
    );
    expect(submit.isEnabled, isFalse, reason: 'disabled until wallet, number and receipt are given');
  });

  testWidgets('choosing a wallet shows where to transfer', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('none')));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Select a wallet'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Jawali').last);
    await tester.pumpAndSettle();

    expect(find.text('Transfer 8,000 YER to:'), findsOneWidget);
    expect(find.text('Number: 777123456'), findsOneWidget);
    expect(find.text('Send the exact amount'), findsOneWidget);
  });

  testWidgets('pending payment hides the form', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('pending')));
    await tester.pumpAndSettle();
    expect(find.text('Waiting for confirmation'), findsOneWidget);
    expect(find.text('1. Choose the wallet you paid with'), findsNothing);
  });

  testWidgets('rejected payment shows the admin note and the form again', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('rejected', note: 'Amount does not match')));
    await tester.pumpAndSettle();
    expect(find.text('Payment not accepted'), findsOneWidget);
    expect(find.textContaining('Note: Amount does not match'), findsOneWidget);
    expect(find.text('1. Choose the wallet you paid with'), findsOneWidget);
  });

  testWidgets('failed course asks to pay again', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('failed')));
    await tester.pumpAndSettle();
    expect(find.text('Time ran out'), findsOneWidget);
    expect(find.textContaining('Pay again to retake it'), findsOneWidget);
    expect(find.text('1. Choose the wallet you paid with'), findsOneWidget);
  });

  testWidgets('active access shows days left and opens the course', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('active', daysLeft: 12)));
    await tester.pumpAndSettle();
    expect(find.text('You have access'), findsOneWidget);
    expect(find.textContaining('12 days left'), findsOneWidget);
    expect(find.text('Open course'), findsOneWidget);
    expect(find.text('1. Choose the wallet you paid with'), findsNothing);
  });

  testWidgets('no wallets configured', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('none'), wallets: const []));
    await tester.pumpAndSettle();
    expect(find.textContaining('No payment methods are available'), findsOneWidget);
  });

  testWidgets('renders in Arabic without overflow', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(_page, billing: _billing('rejected', note: 'المبلغ غير صحيح'), locale: const Locale('ar')));
    await tester.pumpAndSettle();
    expect(find.text('احصل على هذه الدورة'), findsOneWidget);
    expect(find.text('لم يتم قبول الدفعة'), findsOneWidget);
    await tester.tap(find.text('اختر محفظة'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Jawali').last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('أرسل الدفعة للمراجعة'), 200, scrollable: _scrollable());
    expect(tester.takeException(), isNull);
  });

  testWidgets('my payments lists status and admin note', (tester) async {
    _phone(tester);
    await tester.pumpWidget(ProviderScope(
      overrides: [
        myCoursePaymentsProvider.overrideWith((ref) async => [
              CoursePaymentRequest.fromJson({
                'id': 'r1', 'courseId': 'c1', 'courseTitle': 'English Basics', 'walletName': 'Jawali',
                'transactionNumber': 'TX-1', 'amount': 8000, 'originalAmount': 10000, 'currency': 'YER',
                'status': 'rejected', 'adminNote': 'Wrong amount', 'createdAt': '2026-11-01T10:00:00Z',
              }),
              CoursePaymentRequest.fromJson({
                'id': 'r2', 'courseId': 'c1', 'courseTitle': 'English Basics', 'walletName': 'Jawali',
                'transactionNumber': 'TX-2', 'amount': 8000, 'originalAmount': 10000, 'currency': 'YER',
                'status': 'approved', 'createdAt': '2026-11-02T10:00:00Z',
              }),
            ]),
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: const MyCoursePaymentsPage(),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Rejected'), findsOneWidget);
    expect(find.text('Approved'), findsOneWidget);
    expect(find.text('Note: Wrong amount'), findsOneWidget);
    expect(find.text('Jawali · Transaction TX-2'), findsOneWidget);
  });
}
