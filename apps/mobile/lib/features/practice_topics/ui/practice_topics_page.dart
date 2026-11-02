// PracticeTopicsPage — pick a topic for Practice Speaking or Write a Paragraph.
// Speaking starts an AI voice session for the topic; writing opens the editor.
// Access (a started, active course) is enforced by the backend: 402 shows the locked card.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../data/practice_topics_models.dart';
import '../logic/practice_topics_providers.dart';

class PracticeTopicsPage extends ConsumerStatefulWidget {
  const PracticeTopicsPage({required this.kind, super.key});

  /// 'speaking' or 'writing'.
  final String kind;

  @override
  ConsumerState<PracticeTopicsPage> createState() => _PracticeTopicsPageState();
}

class _PracticeTopicsPageState extends ConsumerState<PracticeTopicsPage> {
  String? _startingId;
  String? _startError;
  bool _locked = false;

  bool get _isSpeaking => widget.kind == 'speaking';

  Future<void> _open(PracticeTopic topic) async {
    if (!_isSpeaking) {
      context.push(AppRoutePaths.practiceWritingTopic, extra: topic);
      return;
    }
    final l10n = AppLocalizations.of(context);
    setState(() {
      _startingId = topic.id;
      _startError = null;
    });
    try {
      final start = await ref.read(practiceTopicsDatasourceProvider).startSpeaking(topic.id);
      if (!mounted) return;
      context.push(AppRoutePaths.voiceTeacher, extra: {
        'contextRef': start.contextRef,
        'practiceAttemptId': start.attemptId,
        'practiceTitle': topic.title,
        'practiceXp': topic.xpReward,
        'practiceSeconds': topic.timeLimitSeconds,
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        if (isPracticeLocked(e)) {
          _locked = true;
        } else {
          _startError = e is ApiClientException && e.message.isNotEmpty ? e.message : l10n.practiceStartError;
        }
      });
    } finally {
      if (mounted) setState(() => _startingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final topics = ref.watch(practiceTopicsProvider(widget.kind));

    return Scaffold(
      appBar: AIMTopAppBar(
        title: _isSpeaking ? l10n.homeMissionPracticeSpeaking : l10n.homeMissionWriteParagraph,
        onBack: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.mainShell),
      ),
      body: SafeArea(
        top: false,
        child: topics.when(
          loading: () => const AIMFullScreenLoading(),
          error: (e, _) => isPracticeLocked(e)
              ? _LockedView(onChoose: () => context.go(AppRoutePaths.mainShell))
              : AIMFullScreenError(
                  message: e is ApiClientException ? e.message : '$e',
                  onRetry: () => ref.invalidate(practiceTopicsProvider(widget.kind)),
                ),
          data: (list) {
            if (_locked) return _LockedView(onChoose: () => context.go(AppRoutePaths.mainShell));
            if (list.isEmpty) {
              return AIMEmptyState(
                icon: const Icon(Icons.forum_outlined),
                title: l10n.practiceNoTopicsTitle,
                subtitle: l10n.practiceNoTopicsBody,
              );
            }
            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(practiceTopicsProvider(widget.kind)),
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                  vertical: AimSpacing.space16,
                ),
                children: [
                  Text(
                    _isSpeaking ? l10n.practiceSpeakingSubtitle : l10n.practiceWritingSubtitle,
                    style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  if (_startError != null) ...[
                    AIMAlertBanner(tone: AIMAlertTone.error, child: Text(_startError!)),
                    const SizedBox(height: AimSpacing.componentGap),
                  ],
                  for (final topic in list) ...[
                    _TopicCard(
                      topic: topic,
                      busy: _startingId == topic.id,
                      onTap: _startingId == null ? () => _open(topic) : null,
                    ),
                    const SizedBox(height: AimSpacing.space12),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _TopicCard extends StatelessWidget {
  const _TopicCard({required this.topic, required this.busy, required this.onTap});

  final PracticeTopic topic;
  final bool busy;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: onTap != null,
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  topic.title,
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary, fontWeight: AimFontWeights.bold),
                ),
              ),
              if (busy)
                const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            ],
          ),
          if (topic.description != null && topic.description!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(topic.description!, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary)),
          ],
          const SizedBox(height: AimSpacing.space12),
          Wrap(
            spacing: AimSpacing.space8,
            runSpacing: AimSpacing.space8,
            children: [
              if (topic.levelCode != null) AIMBadge(tone: AIMBadgeTone.neutral, child: Text(topic.levelCode!)),
              AIMBadge(tone: AIMBadgeTone.primary, child: Text(l10n.practiceXpBadge(topic.xpReward))),
              if (topic.timeLimitSeconds != null)
                AIMBadge(
                  tone: AIMBadgeTone.neutral,
                  child: Text(l10n.practiceMinutesBadge((topic.timeLimitSeconds! / 60).round())),
                ),
              if (topic.minWords != null)
                AIMBadge(tone: AIMBadgeTone.neutral, child: Text(l10n.practiceMinWordsBadge(topic.minWords!))),
            ],
          ),
        ],
      ),
    );
  }
}

class _LockedView extends StatelessWidget {
  const _LockedView({required this.onChoose});

  final VoidCallback onChoose;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AIMEmptyState(
      icon: const Icon(Icons.lock_outline_rounded),
      title: l10n.practiceLockedTitle,
      subtitle: l10n.practiceLockedBody,
      action: AIMButton(onPressed: onChoose, child: Text(l10n.practiceChooseCourse)),
    );
  }
}
