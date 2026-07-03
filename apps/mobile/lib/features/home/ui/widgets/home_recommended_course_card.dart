// HomeRecommendedCourseCard — renders the backend-recommended course.
//
// courseTitle, courseDescription, and estimatedLevel are all backend-derived
// from the student's placement result. Flutter never ranks courses locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommended_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeRecommendedCourseCard extends StatelessWidget {
  const HomeRecommendedCourseCard({
    required this.course,
    required this.onTap,
    super.key,
  });

  final HomeRecommendedCourse course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: AppLocalizations.of(context)
          .homeRecommendedCourseSemantic(course.courseTitle),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AimSpacing.space8),
            decoration: BoxDecoration(
              color: AimColors.primary100,
              borderRadius: BorderRadius.circular(AimRadius.md),
            ),
            child: const Icon(
              Icons.school_outlined,
              size: AimSizes.iconMd,
              color: AimColors.primary600,
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (course.estimatedLevel != null) ...[
                  AIMBadge(
                    tone: AIMBadgeTone.primary,
                    variant: AIMBadgeVariant.soft,
                    pill: true,
                    child: Text(course.estimatedLevel!),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                ],
                Text(
                  course.courseTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                if (course.courseDescription != null) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    course.courseDescription!,
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: surfaces.textMuted),
        ],
      ),
    );
  }
}
