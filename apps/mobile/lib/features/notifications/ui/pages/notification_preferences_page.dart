// P13-057: Student notification preferences UI.
//
// Lets the student enable/disable notification channels per category and
// configure quiet hours. These are requests only — the backend remains
// the final authority on eligibility, quiet-hour enforcement, and final
// delivery state.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

import '../../logic/entity/notification_entities.dart';
import '../../logic/provider/notification_providers.dart';

const _kChannels = ['in_app', 'push', 'email'];
const _kCategories = [
  'learning_reminder',
  'deadline_reminder',
  'progress_update',
  'assessment_result',
  'parent_summary',
  'system_alert',
];

const _kCategoryLabels = {
  'learning_reminder': 'Learning reminders',
  'deadline_reminder': 'Deadline reminders',
  'progress_update': 'Progress updates',
  'assessment_result': 'Assessment results',
  'parent_summary': 'Progress digests',
  'system_alert': 'System alerts',
};

const _kChannelLabels = {
  'in_app': 'In-app',
  'push': 'Push',
  'email': 'Email',
};

class NotificationPreferencesPage extends ConsumerStatefulWidget {
  const NotificationPreferencesPage({super.key});

  @override
  ConsumerState<NotificationPreferencesPage> createState() =>
      _NotificationPreferencesPageState();
}

class _NotificationPreferencesPageState
    extends ConsumerState<NotificationPreferencesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationPreferencesProvider.notifier).load(bearerToken: token);
    ref.read(notificationQuietHoursProvider.notifier).load(bearerToken: token);
  }

  void _onToggle(String channel, String category, bool enabled) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationPreferencesProvider.notifier).setEnabled(
          bearerToken: token,
          channel: channel,
          category: category,
          enabled: enabled,
        );
  }

  void _onSaveQuietHours({
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(notificationQuietHoursProvider.notifier).update(
          bearerToken: token,
          enabled: enabled,
          startTime: startTime,
          endTime: endTime,
          timezone: timezone,
        );
  }

  @override
  Widget build(BuildContext context) {
    final preferencesState = ref.watch(notificationPreferencesProvider);
    final quietHoursState = ref.watch(notificationQuietHoursProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Notification settings'),
      body: SafeArea(
        child: switch (preferencesState) {
          AppAsyncLoading() ||
          AppAsyncIdle() =>
            const AIMFullScreenLoading(
              semanticLabel: 'Loading notification preferences',
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Channels', style: AimTextStyles.h2),
                  const SizedBox(height: AimSpacing.componentGap),
                  _PreferencesTable(
                    preferences: data,
                    onToggle: _onToggle,
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  Text('Quiet hours', style: AimTextStyles.h2),
                  const SizedBox(height: AimSpacing.componentGap),
                  _QuietHoursSection(
                    state: quietHoursState,
                    onSave: _onSaveQuietHours,
                  ),
                ],
              ),
            ),
        },
      ),
    );
  }
}

class _PreferencesTable extends StatelessWidget {
  const _PreferencesTable({
    required this.preferences,
    required this.onToggle,
  });

  final List<NotificationPreferenceModel> preferences;
  final void Function(String channel, String category, bool enabled) onToggle;

  bool _isEnabled(String channel, String category) {
    final match = preferences.where(
      (p) => p.channel == channel && p.category == category,
    );
    // Defaults to enabled when the backend has not yet stored an explicit
    // preference row for this channel/category combination.
    return match.isEmpty ? true : match.first.enabled;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final category in _kCategories) ...[
          AIMCard(
            variant: AIMCardVariant.standard,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _kCategoryLabels[category] ?? category,
                  style: AimTextStyles.bodyMd.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AimSpacing.innerGap),
                for (final channel in _kChannels)
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: AimSpacing.space4,
                    ),
                    child: AIMSwitch(
                      label: _kChannelLabels[channel] ?? channel,
                      value: _isEnabled(channel, category),
                      semanticLabel:
                          '${_kChannelLabels[channel]} notifications for ${_kCategoryLabels[category]}',
                      onChanged: (enabled) =>
                          onToggle(channel, category, enabled),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.listItemGap),
        ],
      ],
    );
  }
}

class _QuietHoursSection extends StatefulWidget {
  const _QuietHoursSection({required this.state, required this.onSave});

  final AppAsyncState<QuietHoursModel> state;
  final void Function({
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) onSave;

  @override
  State<_QuietHoursSection> createState() => _QuietHoursSectionState();
}

class _QuietHoursSectionState extends State<_QuietHoursSection> {
  bool _enabled = false;
  String _startTime = '22:00';
  String _endTime = '07:00';
  String _timezone = 'UTC';
  bool _initialized = false;

  void _syncFromModel(QuietHoursModel model) {
    if (_initialized) return;
    _initialized = true;
    _enabled = model.enabled;
    _startTime = model.startTime ?? _startTime;
    _endTime = model.endTime ?? _endTime;
    _timezone = model.timezone ?? _timezone;
  }

  Future<void> _pickTime(bool isStart) async {
    final parts = (isStart ? _startTime : _endTime).split(':');
    final initial = TimeOfDay(
      hour: int.tryParse(parts.elementAt(0)) ?? 0,
      minute: int.tryParse(parts.elementAt(1)) ?? 0,
    );

    final picked = await showTimePicker(context: context, initialTime: initial);
    if (picked == null) return;

    final formatted =
        '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';

    setState(() {
      if (isStart) {
        _startTime = formatted;
      } else {
        _endTime = formatted;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.state is AppAsyncSuccess<QuietHoursModel>) {
      _syncFromModel((widget.state as AppAsyncSuccess<QuietHoursModel>).data);
    }

    final isLoading = widget.state is AppAsyncLoading<QuietHoursModel>;

    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AIMSwitch(
            label: 'Enable quiet hours',
            value: _enabled,
            disabled: isLoading,
            semanticLabel: 'Enable quiet hours',
            onChanged: (value) => setState(() => _enabled = value),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          _TimeRow(
            label: 'Start',
            time: _startTime,
            disabled: isLoading,
            onTap: () => _pickTime(true),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          _TimeRow(
            label: 'End',
            time: _endTime,
            disabled: isLoading,
            onTap: () => _pickTime(false),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMButton(
            onPressed: isLoading
                ? null
                : () => widget.onSave(
                      enabled: _enabled,
                      startTime: _startTime,
                      endTime: _endTime,
                      timezone: _timezone,
                    ),
            loading: isLoading,
            fullWidth: true,
            child: const Text('Save quiet hours'),
          ),
        ],
      ),
    );
  }
}

class _TimeRow extends StatelessWidget {
  const _TimeRow({
    required this.label,
    required this.time,
    required this.onTap,
    required this.disabled,
  });

  final String label;
  final String time;
  final VoidCallback onTap;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return InkWell(
      onTap: disabled ? null : onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
            ),
            Text(
              time,
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
