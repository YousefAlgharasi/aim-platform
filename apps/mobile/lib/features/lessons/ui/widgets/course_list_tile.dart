// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Distinct colors for each course card icon box to match Figma prototype.
const List<Color> _kCourseIconBgColors = [
  Color(0xFF6366F1), // Purple (Starter)
  Color(0xFFFDBA74), // Orange (A1.1)
  Color(0xFF86EFAC), // Soft Green (A1.2)
  Color(0xFFFCA5A5), // Salmon/Peach (Writing 1)
  Color(0xFFC084FC), // Soft Purple (A2.1)
];

const List<IconData> _kCourseIcons = [
  Icons.menu_book_rounded,
  Icons.chat_bubble_outline_rounded,
  Icons.auto_stories_rounded,
  Icons.school_rounded,
  Icons.menu_book_rounded,
];

class CourseListTile extends StatelessWidget {
  const CourseListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    this.isCurrentEnrollment = false,
    super.key,
  });

  final StudentCourse model;
  final VoidCallback onTap;
  final int index;
  final bool isCurrentEnrollment;

  @override
  Widget build(BuildContext context) {
    final iconBgColor = _kCourseIconBgColors[index % _kCourseIconBgColors.length];
    final iconData = _kCourseIcons[index % _kCourseIcons.length];
    final completed = model.status == StudentCourseStatus.completed;
    final inProgress = model.status == StudentCourseStatus.inProgress;
    final locked = model.locked;
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isCurrentEnrollment
              ? const Color(0xFF6366F1)
              : surfaces.border,
          width: isCurrentEnrollment ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: surfaces.textPrimary.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Icon + Title + Badges
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Icon Container (Squircle)
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: locked ? iconBgColor.withValues(alpha: 0.4) : iconBgColor,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: locked
                            ? null
                            : [
                                BoxShadow(
                                  color: iconBgColor.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                      ),
                      child: Icon(
                        iconData,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Title & Level Code
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  model.title,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: surfaces.textPrimary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.start,
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Level Code Pill
                              if (model.levelCode != null) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: colorScheme.primaryContainer,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    model.levelCode!,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: colorScheme.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                              ],

                              // Current Active Badge
                              if (isCurrentEnrollment) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AimColors.success700.withValues(alpha: 0.25),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AimColors.success500.withValues(alpha: 0.4)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const CircleAvatar(
                                        radius: 3,
                                        backgroundColor: AimColors.success500,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        AppLocalizations.of(context).coursesCurrentBadge,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AimColors.success500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              // Lock Icon
                              if (locked) ...[
                                const Icon(
                                  Icons.lock_outline_rounded,
                                  size: 18,
                                  color: Color(0xFF94A3B8),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),

                          // Description
                          if (model.description != null && model.description!.isNotEmpty)
                            Text(
                              model.description!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.start,
                              style: TextStyle(
                                fontSize: 13,
                                color: locked ? surfaces.textMuted : surfaces.textSecondary,
                                height: 1.3,
                              ),
                            ),

                          if (locked)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                AppLocalizations.of(context).lessonsCourseLockedHint,
                                textAlign: TextAlign.start,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: surfaces.textMuted,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Progress Bar Section
                if (!locked && model.lessonCount > 0) ...[
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: model.percent / 100,
                            minHeight: 6,
                            backgroundColor: surfaces.surfaceSunken,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              completed ? const Color(0xFF10B981) : colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${model.percent}%',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: surfaces.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 14),

                // Metadata Row: Lessons, Quizzes, Exams
                Row(
                  children: [
                    _buildMetaChip(
                      context,
                      Icons.menu_book_outlined,
                      AppLocalizations.of(context).lessonsCountChip(model.lessonCount),
                    ),
                    const SizedBox(width: 12),
                    _buildMetaChip(
                      context,
                      Icons.quiz_outlined,
                      AppLocalizations.of(context).quizzesCountChip(model.quizCount),
                    ),
                    const SizedBox(width: 12),
                    _buildMetaChip(
                      context,
                      Icons.emoji_events_outlined,
                      AppLocalizations.of(context).examsCountChip(model.examCount),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Footer Row: Status Pill + Chevron Arrow Button
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: completed
                            ? AimColors.success700.withValues(alpha: 0.25)
                            : (inProgress ? colorScheme.primaryContainer : surfaces.surfaceSunken),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        completed
                            ? AppLocalizations.of(context).lessonsCompletedLabel
                            : (inProgress
                                ? AppLocalizations.of(context).lessonsInProgressLabel
                                : AppLocalizations.of(context).lessonsNotStartedLabel),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: completed
                              ? AimColors.success500
                              : (inProgress ? colorScheme.primary : surfaces.textSecondary),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: surfaces.surfaceSunken,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Directionality.of(context) == TextDirection.rtl
                            ? Icons.chevron_left_rounded
                            : Icons.chevron_right_rounded,
                        size: 20,
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetaChip(BuildContext context, IconData icon, String label) {
    final surfaces = aimSurfacesOf(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: surfaces.textMuted),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: surfaces.textSecondary,
          ),
        ),
      ],
    );
  }
}

