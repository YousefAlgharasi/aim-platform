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
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

String _reminderTypeLabel(AppLocalizations l10n, String reminderType) {
  switch (reminderType) {
    case 'learning_plan':
      return l10n.notificationsReminderTypeLearningPlan;
    case 'review':
      return l10n.notificationsReminderTypeReview;
    case 'deadline':
      return l10n.notificationsReminderTypeDeadline;
    case 'streak':
      return l10n.notificationsReminderTypeStreak;
    case 'custom':
      return l10n.notificationsReminderTypeCustom;
    default:
      return reminderType;
  }
}

/// Formats a real 5-field cron expression ("min hour dom month dow") into a
/// short human label, e.g. "Every day · 7:00 PM" or "Sundays · 9:00 AM".
/// Returns null for null/unparseable/complex expressions — the caller then
/// shows no subtitle rather than fabricating one. Weekday and time are
/// rendered via `intl` so they're locale-correct (e.g. Arabic weekday
/// names/digits).
String? _formatCronSchedule(AppLocalizations l10n, String locale, String? cron) {
  if (cron == null) return null;
  final parts = cron.trim().split(RegExp(r'\s+'));
  if (parts.length != 5) return null;

  final minute = int.tryParse(parts[0]);
  final hour = int.tryParse(parts[1]);
  final dayOfMonth = parts[2];
  final month = parts[3];
  final dayOfWeek = parts[4];
  if (minute == null || hour == null || month != '*') return null;

  // 2023-01-01 was a Sunday, so DateTime.utc(2023, 1, 1 + dow) maps a cron
  // day-of-week (0=Sunday..6=Saturday) onto a real date purely to borrow
  // intl's locale-aware weekday/time formatting.
  final timeStr =
      DateFormat.jm(locale).format(DateTime.utc(2023, 1, 1, hour, minute));

  if (dayOfMonth == '*' && dayOfWeek == '*') {
    return l10n.notificationsEveryDayLabel(timeStr);
  }
  if (dayOfMonth == '*') {
    final dow = int.tryParse(dayOfWeek);
    if (dow != null && dow >= 0 && dow <= 6) {
      final weekday =
          DateFormat.EEEE(locale).format(DateTime.utc(2023, 1, 1 + dow));
      return l10n.notificationsEveryWeekdayLabel(weekday, timeStr);
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
    final l10n = AppLocalizations.of(context);

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
                AIMFullScreenLoading(
                  semanticLabel: l10n.notificationsRemindersLoadingSemantic,
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? AIMEmptyState(
                      title: l10n.notificationsNoRemindersTitle,
                      subtitle: l10n.notificationsNoRemindersSubtitle,
                      semanticLabel: l10n.notificationsNoRemindersSemantic,
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
    final l10n = AppLocalizations.of(context);
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
              label: l10n.commonBack,
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
              l10n.notificationsRemindersTitle,
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
    final l10n = AppLocalizations.of(context);
    final locale = Localizations.localeOf(context).toString();
    final isCancelled = schedule.status == 'cancelled';
    final isCompleted = schedule.status == 'completed';
    final isPaused = schedule.status == 'paused';
    final isActionable = !isCancelled && !isCompleted;
    final scheduleLabel =
        _formatCronSchedule(l10n, locale, schedule.cronExpression);
    final typeLabel = _reminderTypeLabel(l10n, schedule.reminderType);

    return AIMCard(
      variant: AIMCardVariant.standard,
      semanticLabel:
          l10n.notificationsReminderSemantic(typeLabel, schedule.status),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                typeLabel,
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
                      semanticLabel: l10n.notificationsResumeSemantic,
                      child: Text(l10n.notificationsResumeLabel),
                    ),
                  )
                else
                  Expanded(
                    child: AIMButton(
                      variant: AIMButtonVariant.secondary,
                      onPressed: onPause,
                      semanticLabel: l10n.notificationsPauseSemantic,
                      child: Text(l10n.notificationsPauseLabel),
                    ),
                  ),
                const SizedBox(width: AimSpacing.innerGap),
                Expanded(
                  child: AIMButton(
                    variant: AIMButtonVariant.ghost,
                    onPressed: onCancel,
                    semanticLabel: l10n.notificationsCancelSemantic,
                    child: Text(l10n.commonCancel),
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
