import 'dart:async';

import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:flutter/material.dart';

/// Displays a countdown timer based on a backend-provided [expiresAt] timestamp.
///
/// Flutter does **not** enforce expiry — it only renders the remaining time.
/// The backend is the single source of truth for whether an attempt has expired.
class AttemptTimerWidget extends StatefulWidget {
  const AttemptTimerWidget({super.key, required this.expiresAt});

  /// ISO 8601 expiry timestamp from the backend, or `null` if the attempt is
  /// untimed.
  final String? expiresAt;

  @override
  State<AttemptTimerWidget> createState() => _AttemptTimerWidgetState();
}

class _AttemptTimerWidgetState extends State<AttemptTimerWidget> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _initTimer();
  }

  @override
  void didUpdateWidget(covariant AttemptTimerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.expiresAt != widget.expiresAt) {
      _timer?.cancel();
      _initTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _initTimer() {
    if (widget.expiresAt == null) return;

    final expiry = DateTime.tryParse(widget.expiresAt!);
    if (expiry == null) return;

    _updateRemaining(expiry);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateRemaining(expiry);
    });
  }

  void _updateRemaining(DateTime expiry) {
    final now = DateTime.now().toUtc();
    final diff = expiry.difference(now);
    setState(() {
      _remaining = diff.isNegative ? Duration.zero : diff;
    });
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:$minutes:$seconds';
    }
    return '$minutes:$seconds';
  }

  Color _timerColor() {
    if (_remaining.inSeconds < 60) return AimColors.error500;
    if (_remaining.inMinutes < 5) return AimColors.warning500;
    return AimColors.neutral700;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.expiresAt == null) return const SizedBox.shrink();

    final color = _timerColor();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.timer_outlined, size: 18, color: color),
        const SizedBox(width: 4),
        Text(
          _formatDuration(_remaining),
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}
