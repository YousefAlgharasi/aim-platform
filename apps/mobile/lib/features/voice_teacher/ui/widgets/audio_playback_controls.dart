import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space8,
        vertical: AimSpacing.space4,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AimRadius.lg),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildMainButton(context),
          const SizedBox(width: AimSpacing.space8),
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
                      backgroundColor: AimColors.primary500.withValues(alpha: 0.15),
                      valueColor: const AlwaysStoppedAnimation(AimColors.primary500),
                    ),
                  ),
                  if (duration != null) ...[
                    const SizedBox(height: AimSpacing.space4 / 2),
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
            const SizedBox(width: AimSpacing.space4),
            IconButton(
              icon: const Icon(Icons.replay, size: 20),
              color: AimColors.primary500,
              onPressed: onReplay,
              tooltip: l10n.voiceTeacherReplayTooltip,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
          ],
          if (state == AudioPlaybackState.error) ...[
            const SizedBox(width: AimSpacing.space4),
            Text(
              l10n.voiceTeacherPlaybackFailedLabel,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ],
          if (state == AudioPlaybackState.loading) ...[
            const SizedBox(width: AimSpacing.space4),
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AimColors.primary500,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMainButton(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    switch (state) {
      case AudioPlaybackState.idle:
        return IconButton(
          icon: const Icon(Icons.play_arrow),
          color: AimColors.primary500,
          onPressed: onPlay,
          tooltip: l10n.voiceTeacherPlayTooltip,
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
          color: AimColors.primary500,
          onPressed: onPause,
          tooltip: l10n.voiceTeacherPauseTooltip,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
      case AudioPlaybackState.paused:
        return IconButton(
          icon: const Icon(Icons.play_arrow),
          color: AimColors.primary500,
          onPressed: onPlay,
          tooltip: l10n.voiceTeacherResumeTooltip,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
      case AudioPlaybackState.error:
        return IconButton(
          icon: const Icon(Icons.refresh),
          color: Theme.of(context).colorScheme.error,
          onPressed: onRetry,
          tooltip: l10n.voiceTeacherRetryTooltip,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        );
    }
  }
}
