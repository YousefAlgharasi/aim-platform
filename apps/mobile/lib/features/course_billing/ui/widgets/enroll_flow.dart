// The "Do you want to enroll?" pop-up shared by every place a course can be opened.
//
// A course's lessons stay hidden until the student enrolls: a free course asks to confirm, a paid course asks for
// the coupon code. The backend decides everything (price, coupon validity, access); the app only asks and shows.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';

import '../../logic/course_billing_providers.dart';

/// Asks the student to enroll in [course]. Returns true once they are enrolled and the course is their active one.
Future<bool> showEnrollFlow(
  BuildContext context,
  WidgetRef ref,
  StudentCourse course,
) async {
  final isFree = course.price?.isFree ?? true;
  final code = await showDialog<String>(
    context: context,
    builder: (_) => _EnrollDialog(title: course.title, isFree: isFree),
  );
  if (code == null) return false; // cancelled
  if (!context.mounted) return false;

  final token = ref.read(authFlowProvider).accessToken;
  if (token == null || token.isEmpty) return false;
  final billing = ref.read(courseBillingDatasourceProvider);
  try {
    if (isFree) {
      await billing.enrollFree(course.courseId);
    } else {
      await billing.redeemCoupon(code: code, courseId: course.courseId);
    }
    await ref
        .read(currentEnrollmentProvider.notifier)
        .enroll(bearerToken: token, courseId: course.courseId);
    return true;
  } catch (e) {
    if (!context.mounted) return false;
    final detail = e is ApiClientException && e.message.isNotEmpty ? e.message : null;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(detail ??
            context.tr(
              "Couldn't enroll. Check the code and your connection, then try again.",
              'تعذّر التسجيل. تحقق من الرمز ومن اتصالك ثم حاول مجددًا.',
            )),
      ),
    );
    return false;
  }
}

class _EnrollDialog extends StatefulWidget {
  const _EnrollDialog({required this.title, required this.isFree});

  final String title;
  final bool isFree;

  @override
  State<_EnrollDialog> createState() => _EnrollDialogState();
}

class _EnrollDialogState extends State<_EnrollDialog> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = widget.isFree || _controller.text.trim().isNotEmpty;
    return AlertDialog(
      title: Text(context.tr(
        'Do you want to enroll in ${widget.title}?',
        'هل تريد التسجيل في ${widget.title}؟',
      )),
      content: widget.isFree
          ? Text(context.tr(
              'This course is free. Enroll to open its lessons.',
              'هذه الدورة مجانية. سجّل لتفتح دروسها.',
            ))
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr(
                  'This course is paid. Enter your coupon code to enroll.',
                  'هذه الدورة مدفوعة. أدخل رمز القسيمة للتسجيل.',
                )),
                const SizedBox(height: 12),
                TextField(
                  controller: _controller,
                  autofocus: true,
                  autocorrect: false,
                  textCapitalization: TextCapitalization.characters,
                  textDirection: TextDirection.ltr,
                  decoration: const InputDecoration(
                    hintText: 'AIM-XXXX-XXXX-XXXX',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ],
            ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(context.tr('Not now', 'ليس الآن')),
        ),
        TextButton(
          onPressed: canSubmit
              ? () => Navigator.of(context).pop(widget.isFree ? '' : _controller.text.trim())
              : null,
          child: Text(widget.isFree
              ? context.tr('Yes, enroll', 'نعم، سجّلني')
              : context.tr('Use coupon & enroll', 'استخدم القسيمة وسجّل')),
        ),
      ],
    );
  }
}
