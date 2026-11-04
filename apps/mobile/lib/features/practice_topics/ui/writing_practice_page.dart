// WritingPracticePage — write a paragraph on a topic, get the AI's 0-100 score (display only),
// the main corrections and XP. Marking and XP are decided by the backend.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../data/practice_topics_models.dart';
import '../logic/practice_topics_providers.dart';

class WritingPracticePage extends ConsumerStatefulWidget {
  const WritingPracticePage({required this.topic, super.key});

  final PracticeTopic topic;

  @override
  ConsumerState<WritingPracticePage> createState() => _WritingPracticePageState();
}

class _WritingPracticePageState extends ConsumerState<WritingPracticePage> {
  final _controller = TextEditingController();
  Timer? _timer;
  int? _secondsLeft;
  bool _submitting = false;
  String? _error;
  WritingResult? _result;
  bool _locked = false;

  @override
  void initState() {
    super.initState();
    _startClock();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  // The writing time is a guide: the clock counts down and stops at 0; the student can still submit.
  void _startClock() {
    _timer?.cancel();
    _secondsLeft = widget.topic.timeLimitSeconds;
    if (_secondsLeft == null) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted || _secondsLeft == null || _secondsLeft! <= 0 || _result != null) {
        t.cancel();
        return;
      }
      setState(() => _secondsLeft = _secondsLeft! - 1);
    });
  }

  int get _words => _controller.text.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
  bool get _canSubmit => !_submitting && _words >= (widget.topic.minWords ?? 1);

  Future<void> _submit() async {
    if (!_canSubmit) return;
    final l10n = AppLocalizations.of(context);
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final result = await ref
          .read(practiceTopicsDatasourceProvider)
          .submitWriting(widget.topic.id, _controller.text.trim());
      if (!mounted) return;
      _timer?.cancel();
      setState(() => _result = result);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        if (isPracticeLocked(e)) {
          _locked = true;
        } else {
          _error = e is ApiClientException && e.message.isNotEmpty ? e.message : l10n.practiceMarkFailed;
        }
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _retry() {
    setState(() {
      _result = null;
      _controller.clear();
    });
    _startClock();
  }

  String _mmss(int s) => '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final topic = widget.topic;
    return Scaffold(
      appBar: AIMTopAppBar(
        title: topic.title,
        onBack: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.practiceWriting),
      ),
      body: SafeArea(
        top: false,
        child: _locked
            ? AIMEmptyState(
                icon: const Icon(Icons.lock_outline_rounded),
                title: l10n.practiceLockedTitle,
                subtitle: l10n.practiceLockedBody,
                action: AIMButton(
                  onPressed: () => context.go(AppRoutePaths.mainShell),
                  child: Text(l10n.practiceChooseCourse),
                ),
              )
            : ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                  vertical: AimSpacing.space16,
                ),
                children: [
                  if (topic.description != null && topic.description!.isNotEmpty) ...[
                    Text(
                      topic.description!,
                      style: AimTextStyles.bodyMd.copyWith(color: aimSurfacesOf(context).textSecondary),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                  ],
                  if (_result == null) ..._editor(l10n, topic) else ..._resultView(l10n, _result!),
                ],
              ),
      ),
    );
  }

  List<Widget> _editor(AppLocalizations l10n, PracticeTopic topic) {
    final surfaces = aimSurfacesOf(context);
    final words = l10n.practiceWordCount(_words) +
        (topic.minWords != null ? ' · ${l10n.practiceAtLeast(topic.minWords!)}' : '');
    return [
      Row(
        children: [
          Expanded(child: Text(words, style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted))),
          if (_secondsLeft != null)
            Text(
              _secondsLeft! > 0 ? _mmss(_secondsLeft!) : l10n.practiceTimeUp,
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: AimFontWeights.bold,
              ),
            ),
        ],
      ),
      const SizedBox(height: AimSpacing.space8),
      AIMTextarea(
        controller: _controller,
        rows: 9,
        maxLength: 6000,
        placeholder: l10n.practiceWritePlaceholder,
        disabled: _submitting,
        onChanged: (_) => setState(() {}),
      ),
      if (_error != null) ...[
        const SizedBox(height: AimSpacing.space12),
        AIMAlertBanner(tone: AIMAlertTone.error, child: Text(_error!)),
      ],
      const SizedBox(height: AimSpacing.componentGap),
      AIMButton(
        fullWidth: true,
        loading: _submitting,
        onPressed: _canSubmit ? _submit : null,
        child: Text(_submitting ? l10n.practiceMarking : l10n.practiceSubmitForMarking),
      ),
    ];
  }

  List<Widget> _resultView(AppLocalizations l10n, WritingResult result) {
    final surfaces = aimSurfacesOf(context);
    return [
      AIMCard(
        variant: AIMCardVariant.elevated,
        child: Column(
          children: [
            Text(l10n.practiceYourScore, style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted)),
            const SizedBox(height: AimSpacing.space4),
            Text(
              '${result.score}/100',
              style: AimTextStyles.h1.copyWith(color: AimColors.primary600, fontWeight: AimFontWeights.bold),
            ),
            const SizedBox(height: AimSpacing.space8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(value: result.score / 100, minHeight: 10),
            ),
            const SizedBox(height: AimSpacing.space12),
            if (result.xpAwarded > 0)
              AIMBadge(tone: AIMBadgeTone.primary, child: Text(l10n.practiceXpBadge(result.xpAwarded)))
            else
              Text(
                l10n.practiceAlreadyEarnedToday,
                textAlign: TextAlign.center,
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
              ),
            const SizedBox(height: AimSpacing.space12),
            Text(result.summary, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary)),
          ],
        ),
      ),
      if (result.corrections.isNotEmpty) ...[
        const SizedBox(height: AimSpacing.componentGap),
        Text(l10n.practiceWhatToFix, style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary)),
        const SizedBox(height: AimSpacing.space8),
        for (final c in result.corrections) ...[
          AIMCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: c.original,
                        style: const TextStyle(
                          decoration: TextDecoration.lineThrough,
                          color: AimColors.error500,
                        ),
                      ),
                      const TextSpan(text: '  →  '),
                      TextSpan(
                        text: c.correction,
                        style: const TextStyle(color: AimColors.success500, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                if (c.explanation.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(c.explanation, style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary)),
                ],
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
        ],
      ],
      const SizedBox(height: AimSpacing.componentGap),
      Row(
        children: [
          Expanded(
            child: AIMButton(
              variant: AIMButtonVariant.outline,
              onPressed: _retry,
              child: Text(l10n.practiceTryAgain),
            ),
          ),
          const SizedBox(width: AimSpacing.space12),
          Expanded(
            child: AIMButton(
              onPressed: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.practiceWriting),
              child: Text(l10n.practiceMoreTopics),
            ),
          ),
        ],
      ),
    ];
  }
}
