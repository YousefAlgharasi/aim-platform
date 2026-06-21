// P13-058: Student reminder settings UI.
//
// Lets the student view active learning/review/deadline reminders and
// request pause/resume/cancel. The backend remains the final authority
// on the resulting schedule state and on actual dispatch timing.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Reminders'),
      body: SafeArea(
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
    final isCancelled = schedule.status == 'cancelled';
    final isCompleted = schedule.status == 'completed';
    final isPaused = schedule.status == 'paused';
    final isActionable = !isCancelled && !isCompleted;

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
                child: Text(schedule.status),
              ),
            ],
          ),
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
