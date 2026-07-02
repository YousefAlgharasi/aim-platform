// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Courses"
//   docs/design/ui-for-all-system-mobile/screenshots/light/06-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/06-screen.png
//
// Title and description are displayed exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// NOTE — level badge / progress / lesson count / status chip:
// the design shows a CEFR level badge (A1/A2/B1/B2), a per-student progress
// bar with percentage, a lesson count, and a completion status chip. None
// of those fields exist on the backend's CourseModel (no level, no
// per-student progress, no lesson count, no completion flag — see
// services/backend-api/src/features/curriculum/courses). Per product
// direction these render clearly-marked mock values from
// [MockCourseProgress] (deterministic by list index) so the screen matches
// the design pixel-for-pixel; swap for real fields once the backend
// exposes them. The gradient icon tile is decorative (cycled by index).
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Mocked per-course presentation data — see file-level NOTE. Deterministic
/// by list index so the list matches the design screenshot; never sourced
/// from the backend.
class MockCourseProgress {
  const MockCourseProgress({
    required this.level,
    required this.percent,
    required this.lessonCount,
    required this.icon,
    required this.gradient,
  });

  final String level;

  /// 0–100; 100 renders as Completed, 0 as Locked, otherwise In progress.
  final int percent;
  final int lessonCount;
  final IconData icon;
  final LinearGradient gradient;

  bool get completed => percent >= 100;
  bool get locked => percent <= 0;
  bool get inProgress => !completed && !locked;

  static const _patterns = [
    MockCourseProgress(
      level: 'A1',
      percent: 100,
      lessonCount: 40,
      icon: Icons.check_rounded,
      gradient: AimGradients.gzLime,
    ),
    MockCourseProgress(
      level: 'A2',
      percent: 64,
      lessonCount: 36,
      icon: Icons.chat_bubble_outline_rounded,
      gradient: AimGradients.gzHero,
    ),
    MockCourseProgress(
      level: 'B1',
      percent: 20,
      lessonCount: 68,
      icon: Icons.menu_book_outlined,
      gradient: AimGradients.gzHero,
    ),
    MockCourseProgress(
      level: 'B2',
      percent: 0,
      lessonCount: 52,
      icon: Icons.lock_outline_rounded,
      gradient: AimGradients.gzCoral,
    ),
  ];

  static MockCourseProgress forIndex(int index) =>
      _patterns[index % _patterns.length];
}

/// Tappable card for a single published course, matching the design's rich
/// course-card treatment.
///
/// [onTap] is called when tapped. Navigation to the chapter list is driven
/// by the backend-supplied [model.id].
///
/// [index] picks the deterministic [MockCourseProgress] pattern and the
/// decorative icon gradient; it carries no backend meaning.
class CourseListTile extends StatelessWidget {
  const CourseListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final CourseModel model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final mock = MockCourseProgress.forIndex(index);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Course: ${model.title}, level ${mock.level}',
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
                  gradient: mock.gradient,
                  borderRadius: AimRadius.borderMd,
                ),
                child: Icon(
                  mock.icon,
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
                        const SizedBox(width: AimSpacing.innerGap),
                        AIMBadge(
                          tone: AIMBadgeTone.primary,
                          variant: AIMBadgeVariant.soft,
                          child: Text(mock.level),
                        ),
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
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: AimRadius.borderPill,
                  child: LinearProgressIndicator(
                    value: mock.percent / 100,
                    minHeight: AimSpacing.space4,
                    backgroundColor: surfaces.surfaceSunken,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      mock.completed
                          ? AimColors.gzLime
                          : AimColors.primary500,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Text(
                mock.completed ? 'Done' : '${mock.percent}%',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textSecondary,
                  fontWeight: AimFontWeights.semibold,
                ),
              ),
            ],
          ),
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
                '${mock.lessonCount} lessons',
                style:
                    AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              ),
              const SizedBox(width: AimSpacing.innerGap),
              if (mock.completed)
                const AIMBadge(
                  tone: AIMBadgeTone.success,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text('Completed'),
                )
              else if (mock.inProgress)
                const AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text('In progress'),
                )
              else
                const AIMBadge(
                  tone: AIMBadgeTone.neutral,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text('Locked'),
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
