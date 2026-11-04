// PracticeSessionBar — shown under the voice screen when it was opened from Practice Speaking:
// topic title, countdown (when the topic has a time limit) and Finish, which asks the backend
// to award the XP (it checks the student actually spoke).

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../logic/practice_topics_providers.dart';

class PracticeSessionInfo {
  const PracticeSessionInfo({
    required this.attemptId,
    required this.title,
    required this.xpReward,
    this.timeLimitSeconds,
  });

  final String attemptId;
  final String title;
  final int xpReward;
  final int? timeLimitSeconds;
}

class PracticeSessionBar extends ConsumerStatefulWidget {
  const PracticeSessionBar({required this.practice, super.key});

  final PracticeSessionInfo practice;

  @override
  ConsumerState<PracticeSessionBar> createState() => _PracticeSessionBarState();
}

class _PracticeSessionBarState extends ConsumerState<PracticeSessionBar> {
  Timer? _timer;
  int _elapsed = 0;
  bool _finishing = false;
  String? _error;
  int? _xp;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted && _xp == null) setState(() => _elapsed++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _finish() async {
    if (_finishing) return;
    final l10n = AppLocalizations.of(context);
    setState(() {
      _finishing = true;
      _error = null;
    });
    try {
      final xp = await ref.read(practiceTopicsDatasourceProvider).completeSpeaking(widget.practice.attemptId);
      if (!mounted) return;
      _timer?.cancel();
      setState(() => _xp = xp);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiClientException && e.message.isNotEmpty ? e.message : l10n.practiceFinishFailed);
    } finally {
      if (mounted) setState(() => _finishing = false);
    }
  }

  String _mmss(int s) => '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final limit = widget.practice.timeLimitSeconds;
    final left = limit == null ? null : (limit - _elapsed).clamp(0, limit);

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.space12),
        child: AIMCard(
          child: _xp != null
              ? Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${l10n.practiceWellDone}  ${l10n.practiceXpBadge(_xp!)}',
                        style: AimTextStyles.bodyMd.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: AimFontWeights.bold,
                        ),
                      ),
                    ),
                    AIMButton(
                      size: AIMButtonSize.small,
                      onPressed: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.practiceSpeaking),
                      child: Text(l10n.practiceMoreTopics),
                    ),
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.practice.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AimTextStyles.bodyMd.copyWith(
                                  color: surfaces.textPrimary,
                                  fontWeight: AimFontWeights.bold,
                                ),
                              ),
                              Text(
                                l10n.practiceFinishToEarn(widget.practice.xpReward),
                                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                              ),
                            ],
                          ),
                        ),
                        if (left != null)
                          Padding(
                            padding: const EdgeInsetsDirectional.only(end: AimSpacing.space12),
                            child: Text(
                              left > 0 ? _mmss(left) : l10n.practiceTimeUp,
                              style: AimTextStyles.bodyMd.copyWith(
                                color: surfaces.textPrimary,
                                fontWeight: AimFontWeights.bold,
                              ),
                            ),
                          ),
                        AIMButton(
                          size: AIMButtonSize.small,
                          loading: _finishing,
                          onPressed: _finish,
                          child: Text(_finishing ? l10n.practiceFinishing : l10n.practiceFinish),
                        ),
                      ],
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: AimSpacing.space8),
                      AIMAlertBanner(tone: AIMAlertTone.error, child: Text(_error!)),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}
