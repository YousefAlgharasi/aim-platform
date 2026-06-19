import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

enum AudioPlaybackState { idle, loading, playing, paused, error }

class AudioPlaybackControls extends StatelessWidget {
  final AudioPlaybackState state;
  final double progress;
  final String? duration;
  final VoidCallback? onPlay;
  final VoidCallback? onPause;
  final VoidCallback? onReplay;
  final VoidCallback? onRetry;

  const AudioPlaybackControls({
    super.key,
    required this.state,
    this.progress = 0.0,
    this.duration,
    this.onPlay,
    this.onPause,
    this.onReplay,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: AIMSpacing.sm,
        vertical: AIMSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AIMRadius.lg),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildMainButton(context),
          SizedBox(width: AIMSpacing.sm),
          if (state == AudioPlaybackState.playing ||
              state == AudioPlaybackState.paused) ...[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress.clamp(0.0, 1.0),
                      minHeight: 4,
                      backgroundColor: AIMColors.primary.withOpacity(0.15),
                      valueColor: const AlwaysStoppedAnimation(AIMColors.primary),
                    ),
                  ),
                  if (duration != null) ...[
                    SizedBox(height: AIMSpacing.xs / 2),
                    Text(
                      duration!,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            SizedBox(width: AIMSpacing.xs),
            IconButton(
              icon: const Icon(Icons.replay, size: 20),
              color: AIMColors.primary,
              onPressed: onReplay,
              tooltip: isRtl ? 'إعادة' : 'Replay',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
          ],
          if (state == AudioPlaybackState.error) ...[
            SizedBox(width: AIMSpacing.xs),
            Text(
              isRtl ? 'فشل التشغيل' : 'Playback failed',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ],
          if (state == AudioPlaybackState.loading) ...[
            SizedBox(width: AIMSpacing.xs),
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AIMColors.primary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMainButton(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    switch (state) {
      case AudioPlaybackState.idle:
        return IconButton(
          icon: const Icon(Icons.play_arrow),
          color: AIMColors.primary,
          onPressed: onPlay,
          tooltip: isRtl ? 'تشغيل' : 'Play',
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
      case AudioPlaybackState.loading:
        return const SizedBox(
          width: 40,
          height: 40,
          child: Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        );
      case AudioPlaybackState.playing:
        return IconButton(
          icon: const Icon(Icons.pause),
          color: AIMColors.primary,
          onPressed: onPause,
          tooltip: isRtl ? 'إيقاف مؤقت' : 'Pause',
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
      case AudioPlaybackState.paused:
        return IconButton(
          icon: const Icon(Icons.play_arrow),
          color: AIMColors.primary,
          onPressed: onPlay,
          tooltip: isRtl ? 'استئناف' : 'Resume',
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
      case AudioPlaybackState.error:
        return IconButton(
          icon: const Icon(Icons.refresh),
          color: Theme.of(context).colorScheme.error,
          onPressed: onRetry,
          tooltip: isRtl ? 'إعادة المحاولة' : 'Retry',
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
    }
  }
}
