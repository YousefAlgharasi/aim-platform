import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

enum RecordingState { idle, recording, stopped, cancelled }

class RecordingStateBar extends StatelessWidget {
  final RecordingState state;
  final String? duration;
  final VoidCallback? onStop;
  final VoidCallback? onCancel;
  final VoidCallback? onSend;

  const RecordingStateBar({
    super.key,
    required this.state,
    this.duration,
    this.onStop,
    this.onCancel,
    this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    if (state == RecordingState.idle || state == RecordingState.cancelled) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: AimSpacing.md,
        vertical: AimSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: state == RecordingState.recording
            ? Colors.red.withOpacity(0.08)
            : theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AimRadius.lg),
      ),
      child: Row(
        children: [
          if (state == RecordingState.recording) ...[
            _PulsingDot(),
            SizedBox(width: AimSpacing.sm),
            Text(
              duration ?? '0:00',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.red,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
            const Spacer(),
            _ActionButton(
              icon: Icons.close,
              label: isRtl ? 'إلغاء' : 'Cancel',
              color: theme.colorScheme.onSurfaceVariant,
              onTap: onCancel,
            ),
            SizedBox(width: AimSpacing.sm),
            _ActionButton(
              icon: Icons.stop,
              label: isRtl ? 'إيقاف' : 'Stop',
              color: Colors.red,
              onTap: onStop,
            ),
          ],
          if (state == RecordingState.stopped) ...[
            Icon(Icons.check_circle, color: AimColors.primary, size: 20),
            SizedBox(width: AimSpacing.sm),
            Text(
              isRtl ? 'تم التسجيل' : 'Recorded',
              style: theme.textTheme.bodyMedium,
            ),
            if (duration != null) ...[
              SizedBox(width: AimSpacing.xs),
              Text(
                duration!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const Spacer(),
            _ActionButton(
              icon: Icons.delete_outline,
              label: isRtl ? 'حذف' : 'Discard',
              color: theme.colorScheme.error,
              onTap: onCancel,
            ),
            SizedBox(width: AimSpacing.sm),
            _ActionButton(
              icon: Icons.send,
              label: isRtl ? 'إرسال' : 'Send',
              color: AimColors.primary,
              onTap: onSend,
            ),
          ],
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(AimRadius.sm),
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: AimSpacing.sm,
          vertical: AimSpacing.xs,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: color),
            SizedBox(width: AimSpacing.xs),
            Text(
              label,
              style: TextStyle(color: color, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Opacity(
          opacity: 0.4 + (_controller.value * 0.6),
          child: Container(
            width: 10,
            height: 10,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.red,
            ),
          ),
        );
      },
    );
  }
}
