import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/achievements/logic/provider/achievements_provider.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'package:aim_mobile/features/certificates/logic/provider/certificates_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/learning_path/logic/provider/learning_path_provider.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/profile/logic/provider/profile_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';

/// Drops the signed-in student's data that long-lived (non-autoDispose)
/// providers hold in memory, so the next account on this device never sees it
/// before its own data loads. Device preferences (language, theme, AI teacher
/// settings) are deliberately kept.
///
/// Call after the auth state has been cleared.
void resetSessionScopedProviders(Ref ref) {
  ref
    ..invalidate(homeProvider)
    ..invalidate(profileProvider)
    ..invalidate(achievementsProvider)
    ..invalidate(certificatesListProvider)
    ..invalidate(coursesProvider)
    ..invalidate(studentCoursesProvider)
    ..invalidate(currentEnrollmentProvider)
    ..invalidate(learningPathProvider)
    ..invalidate(aimResultsProvider)
    ..invalidate(assessmentListProvider)
    ..invalidate(nextAssessmentProvider)
    ..invalidate(deadlinesProvider)
    ..invalidate(subscriptionProvider)
    ..invalidate(pricingProvider)
    ..invalidate(invoiceProvider)
    ..invalidate(placementRequiredProvider);
}
