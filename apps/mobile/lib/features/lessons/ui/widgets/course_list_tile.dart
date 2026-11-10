// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/course_billing/ui/widgets/course_billing_chip.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// A soft tone per course so the list has some life; the icon box is a
/// tinted tile with a coloured icon (readable in light and dark).
const List<Color> _kCourseTones = [
  Color(0xFF3B82F6), // blue
  Color(0xFFF59E0B), // amber
  Color(0xFF10B981), // green
  Color(0xFFEF6C57), // coral
  Color(0xFF8B5CF6), // violet
];

const List<IconData> _kCourseIcons = [
  Icons.menu_book_rounded,
  Icons.chat_bubble_rounded,
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
    final tone = _kCourseTones[index % _kCourseTones.length];
    final dark = Theme.of(context).brightness == Brightness.dark;
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
              ? AimColors.primary400
              : surfaces.border,
          width: isCurrentEnrollment ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500
                .withValues(alpha: isCurrentEnrollment ? (dark ? 0.30 : 0.18) : (dark ? 0.10 : 0.06)),
            blurRadius: isCurrentEnrollment ? 18 : 12,
            offset: const Offset(0, 5),
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
                    // Left icon tile: tinted square with a coloured icon.
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            tone.withValues(alpha: locked ? 0.10 : (dark ? 0.30 : 0.22)),
                            tone.withValues(alpha: locked ? 0.05 : (dark ? 0.16 : 0.08)),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: tone.withValues(alpha: locked ? 0.15 : 0.30)),
                      ),
                      child: Icon(
                        iconData,
                        color: tone.withValues(alpha: locked ? 0.5 : 1),
                        size: 28,
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
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: surfaces.surfaceSunken,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.lock_outline_rounded,
                                    size: 17,
                                    color: surfaces.textMuted,
                                  ),
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
                            minHeight: 8,
                            backgroundColor: surfaces.surfaceSunken,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              completed ? AimColors.success500 : colorScheme.primary,
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
                Wrap(
                  spacing: 14,
                  runSpacing: 6,
                  children: [
                    _buildMetaChip(
                      context,
                      Icons.menu_book_rounded,
                      const Color(0xFF3B82F6),
                      AppLocalizations.of(context).lessonsCountChip(model.lessonCount),
                    ),
                    _buildMetaChip(
                      context,
                      Icons.edit_note_rounded,
                      const Color(0xFF10B981),
                      AppLocalizations.of(context).quizzesCountChip(model.quizCount),
                    ),
                    _buildMetaChip(
                      context,
                      Icons.emoji_events_rounded,
                      const Color(0xFFF59E0B),
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
                    const SizedBox(width: 8),
                    Expanded(
                      child: Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: CourseBillingChip(course: model),
                      ),
                    ),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withValues(alpha: dark ? 0.22 : 0.10),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Directionality.of(context) == TextDirection.rtl
                            ? Icons.chevron_left_rounded
                            : Icons.chevron_right_rounded,
                        size: 20,
                        color: colorScheme.primary,
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

  Widget _buildMetaChip(BuildContext context, IconData icon, Color color, String label) {
    final surfaces = aimSurfacesOf(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
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

