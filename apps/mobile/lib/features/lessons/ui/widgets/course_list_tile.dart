// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Courses"
//   docs/design/ui-for-all-system-mobile/screenshots/light/06-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/06-screen.png
// Endpoint: GET /student/courses (level badge, lesson count, real
//   per-student progress — see services/backend-api/src/features/
//   student-courses). All fields displayed here — title, description,
//   levelCode, lessonCount, percent, status — are backend-computed.
//   Flutter never computes progress or status locally.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Deterministic-but-varied gradient + icon cycled by list index to give
/// each course row a distinct icon tile. Purely decorative — does not
/// encode any backend field.
const List<LinearGradient> _kCourseIconGradients = [
  AimGradients.gzHero,
  AimGradients.gzFire,
  AimGradients.gzLime,
  AimGradients.gzCoral,
];
const List<IconData> _kCourseIcons = [
  Icons.menu_book_outlined,
  Icons.chat_bubble_outline_rounded,
  Icons.auto_stories_outlined,
  Icons.school_outlined,
];

/// Tappable card for a single published course, matching the design's rich
/// course-card treatment with real per-student progress.
///
/// [onTap] is called when tapped. Navigation to the chapter list is driven
/// by the backend-supplied [model.courseId].
///
/// [index] only picks the decorative icon/gradient; it carries no backend
/// meaning.
class CourseListTile extends StatelessWidget {
  const CourseListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final StudentCourse model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final gradient = _kCourseIconGradients[index % _kCourseIconGradients.length];
    final icon = _kCourseIcons[index % _kCourseIcons.length];
    final completed = model.status == StudentCourseStatus.completed;
    final inProgress = model.status == StudentCourseStatus.inProgress;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: model.levelCode != null
          ? l10n.lessonsCourseSemanticWithLevel(
              model.title, model.levelCode!, model.percent)
          : l10n.lessonsCourseSemanticBase(model.title, model.percent),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: AimSizes.avatarMd,
                height: AimSizes.avatarMd,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: gradient,
                  borderRadius: AimRadius.borderMd,
                ),
                child: Icon(
                  icon,
                  size: AimSizes.iconMd,
                  color: AimColors.neutral0,
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            model.title,
                            style: AimTextStyles.title
                                .copyWith(color: surfaces.textPrimary),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (model.levelCode != null) ...[
                          const SizedBox(width: AimSpacing.innerGap),
                          AIMBadge(
                            tone: AIMBadgeTone.primary,
                            variant: AIMBadgeVariant.soft,
                            child: Text(model.levelCode!),
                          ),
                        ],
                      ],
                    ),
                    if (model.description != null &&
                        model.description!.isNotEmpty) ...[
                      const SizedBox(height: AimSpacing.space2),
                      Text(
                        model.description!,
                        style: AimTextStyles.bodySm
                            .copyWith(color: surfaces.textSecondary),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (model.lessonCount > 0) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: AimRadius.borderPill,
                    child: LinearProgressIndicator(
                      value: model.percent / 100,
                      minHeight: AimSpacing.space4,
                      backgroundColor: surfaces.surfaceSunken,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        completed ? AimColors.gzLime : AimColors.primary500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Text(
                  completed ? l10n.commonDone : '${model.percent}%',
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            children: [
              Icon(
                Icons.import_contacts_outlined,
                size: AimSizes.iconSm,
                color: surfaces.textMuted,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                l10n.lessonsLessonsCountLabel(model.lessonCount),
                style:
                    AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              ),
              const SizedBox(width: AimSpacing.innerGap),
              if (completed)
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text(l10n.lessonsCompletedLabel),
                )
              else if (inProgress)
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text(l10n.lessonsInProgressLabel),
                )
              else
                AIMBadge(
                  tone: AIMBadgeTone.neutral,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text(l10n.lessonsNotStartedLabel),
                ),
              const Spacer(),
              Container(
                width: AimSizes.iconLg + AimSpacing.space8,
                height: AimSizes.iconLg + AimSpacing.space8,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: surfaces.surfaceSunken,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Directionality.of(context) == TextDirection.rtl
                      ? Icons.chevron_left
                      : Icons.chevron_right,
                  size: AimSizes.iconSm,
                  color: surfaces.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
