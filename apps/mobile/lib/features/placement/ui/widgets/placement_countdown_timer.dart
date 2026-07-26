import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';

/// Scope: Placement Test timer display only.
class PlacementCountdownTimer extends StatefulWidget {
  const PlacementCountdownTimer({
    super.key,
    required this.expiresAt,
    this.onExpired,
  });

  /// ISO-8601 timestamp from the backend.
  final String expiresAt;

  /// Called once, when the countdown reaches zero.
  final VoidCallback? onExpired;

  @override
  State<PlacementCountdownTimer> createState() => _PlacementCountdownTimerState();
}

class _PlacementCountdownTimerState extends State<PlacementCountdownTimer> {
  Timer? _ticker;
  Duration _remaining = Duration.zero;
  bool _expiredFired = false;

  @override
  void initState() {
    super.initState();
    _tick();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _tick() {
    final expiry = DateTime.tryParse(widget.expiresAt);
    if (expiry == null) return;

    final remaining = expiry.difference(DateTime.now());
    if (!mounted) return;

    setState(() {
      _remaining = remaining.isNegative ? Duration.zero : remaining;
    });

    if (_remaining == Duration.zero && !_expiredFired) {
      _expiredFired = true;
      widget.onExpired?.call();
    }
  }

  String _format(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final hours = d.inHours;
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return hours > 0 ? '$hours:$minutes:$seconds' : '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final isLow = _remaining.inSeconds <= 60 && _remaining.inSeconds > 0;
    final color = isLow ? AimColors.error500 : AimColors.primary500;

    return Semantics(
      label: 'Time remaining ${_format(_remaining)}',
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space4,
        ),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: AimRadius.borderPill,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.timer_outlined,
              size: AimSizes.iconSm,
              color: color,
            ),
            const SizedBox(width: AimSpacing.space4),
            Text(
              _format(_remaining),
              style: AimTextStyles.label.copyWith(
                color: color,
                fontWeight: AimFontWeights.semibold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
