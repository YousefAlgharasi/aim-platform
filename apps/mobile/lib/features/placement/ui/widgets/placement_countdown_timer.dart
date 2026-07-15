// P4-052: PlacementCountdownTimer.
//
// Scope: Placement Test timer display only.
//
// Renders a countdown derived from [expiresAt] — a server-computed absolute
// timestamp (attempt.started_at + duration_seconds) — rather than a purely
// client-local timer, so pausing/backgrounding the app or clock skew never
// changes what the backend actually enforces. This widget is a display
// concern only: the backend independently rejects/auto-submits the attempt
// once real time passes expiresAt (PlacementAttemptTimerService), so a
// student manipulating the device clock gains nothing.

import 'dart:async';

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/theme/theme.dart';

class PlacementCountdownTimer extends StatefulWidget {
  const PlacementCountdownTimer({
    super.key,
    required this.expiresAt,
    this.onExpired,
  });

  /// ISO-8601 timestamp from the backend (PlacementAttemptStartResponse.expires_at).
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
    final surfaces = aimSurfacesOf(context);
    final isLow = _remaining.inSeconds <= 60;

    return Semantics(
      label: 'Time remaining ${_format(_remaining)}',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: AimSizes.iconSm,
            color: isLow ? AimColors.error500 : surfaces.textSecondary,
          ),
          const SizedBox(width: AimSpacing.space4),
          Text(
            _format(_remaining),
            style: AimTextStyles.bodySm.copyWith(
              color: isLow ? AimColors.error500 : surfaces.textSecondary,
              fontWeight: isLow ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
