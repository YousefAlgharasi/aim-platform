// Small chip on a course card: price, payment pending, days left, or time
// ran out. Nothing for free or finished courses.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../data/course_billing_models.dart';
import 'billing_format.dart';

class CourseBillingChip extends StatelessWidget {
  const CourseBillingChip({required this.course, super.key});

  final StudentCourse course;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final access = course.access;
    final price = course.price;
    if (access == null || price == null) return const SizedBox.shrink();

    final (IconData icon, Color color, String label) = switch (access.status) {
      CourseAccessStatus.active => (
          Icons.timer_outlined,
          (access.daysLeft ?? 0) <= 5 ? AimColors.warning500 : AimColors.primary500,
          l10n.billingDaysLeft(access.daysLeft ?? 0),
        ),
      CourseAccessStatus.pending => (Icons.hourglass_top_rounded, AimColors.warning500, l10n.billingChipPending),
      CourseAccessStatus.failed => (Icons.timer_off_outlined, AimColors.error500, l10n.billingFailedTitle),
      CourseAccessStatus.none || CourseAccessStatus.rejected => (
          Icons.lock_outline_rounded,
          AimColors.primary500,
          formatCurrencyAmount(context, price.amount, price.currency),
        ),
      CourseAccessStatus.free || CourseAccessStatus.completed => (Icons.check, AimColors.success500, ''),
    };
    if (label.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color),
            ),
          ),
        ],
      ),
    );
  }
}
