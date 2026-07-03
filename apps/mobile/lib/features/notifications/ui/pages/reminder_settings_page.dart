// P13-058: Student reminder settings UI.
//
// Lets the student view active learning/review/deadline reminders and
// request pause/resume/cancel. The backend remains the final authority
// on the resulting schedule state and on actual dispatch timing.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Reminders" (42)
//   docs/design/ui-for-all-system-mobile/screenshots/light/42-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/42-screen.png
//
// TASK-32: restyled to match design screen 42 — gradient header, and a
// real schedule-time subtitle ("Every day · 7:00 PM") derived from the
// backend's `cronExpression`. A paused reminder still shows "Resume" (not
// "Pause" again, unlike the mockup) — that's the functionally correct
// action for a paused schedule, kept over pixel-matching the mockup.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

const _kReminderTypeLabels = {
  'learning_plan': 'Learning plan',
  'review': 'Review',
  'deadline': 'Deadline',
  'streak': 'Streak',
  'custom': 'Custom',
};

const _kWeekdayNames = [
  'Sundays', 'Mondays', 'Tuesdays', 'Wednesdays',
  'Thursdays', 'Fridays', 'Saturdays',
];

/// Formats a real 5-field cron expression ("min hour dom month dow") into a
/// short human label, e.g. "Every day · 7:00 PM" or "Sundays · 9:00 AM".
/// Returns null for null/unparseable/complex expressions — the caller then
/// shows no subtitle rather than fabricating one.
String? _formatCronSchedule(String? cron) {
  if (cron == null) return null;
  final parts = cron.trim().split(RegExp(r'\s+'));
  if (parts.length != 5) return null;

  final minute = int.tryParse(parts[0]);
  final hour = int.tryParse(parts[1]);
  final dayOfMonth = parts[2];
  final month = parts[3];
  final dayOfWeek = parts[4];
  if (minute == null || hour == null || month != '*') return null;

  final period = hour < 12 ? 'AM' : 'PM';
  final displayHour = hour % 12 == 0 ? 12 : hour % 12;
  final timeStr = '$displayHour:${minute.toString().padLeft(2, '0')} $period';

  if (dayOfMonth == '*' && dayOfWeek == '*') {
    return 'Every day · $timeStr';
  }
  if (dayOfMonth == '*') {
    final dow = int.tryParse(dayOfWeek);
    if (dow != null && dow >= 0 && dow <= 6) {
      return '${_kWeekdayNames[dow]} · $timeStr';
    }
  }
  return null;
}

class ReminderSettingsPage extends ConsumerStatefulWidget {
  const ReminderSettingsPage({super.key});

  @override
  ConsumerState<ReminderSettingsPage> createState() =>
      _ReminderSettingsPageState();
}

class _ReminderSettingsPageState extends ConsumerState<ReminderSettingsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationRemindersProvider.notifier).load(bearerToken: token);
  }

  void _onPause(String scheduleId) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationRemindersProvider.notifier).pause(
          bearerToken: token,
          scheduleId: scheduleId,
        );
  }

  void _onResume(String scheduleId) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationRemindersProvider.notifier).resume(
          bearerToken: token,
          scheduleId: scheduleId,
        );
  }

  void _onCancel(String scheduleId) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationRemindersProvider.notifier).cancel(
          bearerToken: token,
          scheduleId: scheduleId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final remindersState = ref.watch(notificationRemindersProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _ReminderSettingsHeader(),
          Expanded(
            child: switch (remindersState) {
              AppAsyncLoading() ||
              AppAsyncIdle() =>
                const AIMFullScreenLoading(
                  semanticLabel: 'Loading reminder schedules',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? const AIMEmptyState(
                      title: 'No reminders yet',
                      subtitle: 'Reminders you enable will appear here.',
                      semanticLabel: 'No reminder schedules',
                    )
                  : ListView.separated(
                      padding: const EdgeInsetsDirectional.fromSTEB(
                        AimSpacing.screenPaddingMobile,
                        AimSpacing.sectionGap,
                        AimSpacing.screenPaddingMobile,
                        AimSpacing.sectionGap,
                      ),
                      itemCount: data.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: AimSpacing.listItemGap),
                      itemBuilder: (context, index) {
                        final schedule = data[index];
                        return _ReminderScheduleTile(
                          schedule: schedule,
                          onPause: () => _onPause(schedule.id),
                          onResume: () => _onResume(schedule.id),
                          onCancel: () => _onCancel(schedule.id),
                        );
                      },
                    ),
            },
          ),
        ],
      ),
    );
  }
}

class _ReminderSettingsHeader extends StatelessWidget {
  const _ReminderSettingsHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Reminders',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReminderScheduleTile extends StatelessWidget {
  const _ReminderScheduleTile({
    required this.schedule,
    required this.onPause,
    required this.onResume,
    required this.onCancel,
  });

  final ReminderScheduleModel schedule;
  final VoidCallback onPause;
  final VoidCallback onResume;
  final VoidCallback onCancel;

  AIMBadgeTone _toneForStatus(String status) {
    switch (status) {
      case 'active':
        return AIMBadgeTone.success;
      case 'paused':
        return AIMBadgeTone.warning;
      case 'cancelled':
        return AIMBadgeTone.error;
      case 'completed':
        return AIMBadgeTone.neutral;
      default:
        return AIMBadgeTone.neutral;
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isCancelled = schedule.status == 'cancelled';
    final isCompleted = schedule.status == 'completed';
    final isPaused = schedule.status == 'paused';
    final isActionable = !isCancelled && !isCompleted;
    final scheduleLabel = _formatCronSchedule(schedule.cronExpression);

    return AIMCard(
      variant: AIMCardVariant.standard,
      semanticLabel:
          '${_kReminderTypeLabels[schedule.reminderType] ?? schedule.reminderType} reminder, status ${schedule.status}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _kReminderTypeLabels[schedule.reminderType] ??
                    schedule.reminderType,
                style: AimTextStyles.bodyMd.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              AIMBadge(
                tone: _toneForStatus(schedule.status),
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(schedule.status),
              ),
            ],
          ),
          if (scheduleLabel != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              scheduleLabel,
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
          if (isActionable) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              children: [
                if (isPaused)
                  Expanded(
                    child: AIMButton(
                      variant: AIMButtonVariant.secondary,
                      onPressed: onResume,
                      semanticLabel: 'Resume reminder',
                      child: const Text('Resume'),
                    ),
                  )
                else
                  Expanded(
                    child: AIMButton(
                      variant: AIMButtonVariant.secondary,
                      onPressed: onPause,
                      semanticLabel: 'Pause reminder',
                      child: const Text('Pause'),
                    ),
                  ),
                const SizedBox(width: AimSpacing.innerGap),
                Expanded(
                  child: AIMButton(
                    variant: AIMButtonVariant.ghost,
                    onPressed: onCancel,
                    semanticLabel: 'Cancel reminder',
                    child: const Text('Cancel'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
