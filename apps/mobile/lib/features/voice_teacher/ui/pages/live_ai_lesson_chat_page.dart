import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';

class VoiceMessage {
  VoiceMessage({
    required this.id,
    required this.sender,
    required this.text,
    this.audioTime,
  });

  final String id;
  final String sender; // 'ai' | 'user'
  final String text;
  final String? audioTime;
}

class LiveAiLessonChatPage extends StatefulWidget {
  const LiveAiLessonChatPage({
    this.lessonTitle,
    super.key,
  });

  final String? lessonTitle;

  @override
  State<LiveAiLessonChatPage> createState() => _LiveAiLessonChatPageState();
}

class _LiveAiLessonChatPageState extends State<LiveAiLessonChatPage> {
  int _step = 1;
  String _state = 'ai-speaking'; // 'ai-speaking' | 'listening' | 'evaluating'
  bool _completed = false;
  int _secs = 0;
  Timer? _timer;
  bool _initialized = false;

  late final List<VoiceMessage> _messages;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      final title = widget.lessonTitle ?? 'Ordering Food & Drinks at a Cafe';
      _messages = [
        VoiceMessage(
          id: '1',
          sender: 'ai',
          text: 'Hello Alex! Welcome to your live voice lesson on "$title". ☕\n\nListen carefully: "Could I get a cup of coffee, please?"',
          audioTime: '00:06',
        ),
      ];
      _startAiTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startAiTimer() {
    _timer?.cancel();
    _timer = Timer(const Duration(seconds: 4), () {
      if (mounted && _state == 'ai-speaking') {
        setState(() {
          _state = 'listening';
          _secs = 0;
        });
        _startListeningTimer();
      }
    });
  }

  void _startListeningTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted && _state == 'listening') {
        setState(() {
          _secs++;
        });
      }
    });
  }

  void _handleMicTap() {
    if (_state == 'listening') {
      _timer?.cancel();
      setState(() {
        _state = 'evaluating';
      });

      final userText = _step == 1
          ? 'Could I get a cup of coffee, please?'
          : _step == 2
              ? 'Could you bring us the bill, please?'
              : 'What do you recommend for lunch today?';

      setState(() {
        _messages.add(
          VoiceMessage(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            sender: 'user',
            text: userText,
            audioTime: '00:${_secs.toString().padLeft(2, '0')}',
          ),
        );
      });

      Timer(const Duration(milliseconds: 1800), () {
        if (mounted) {
          if (_step < 3) {
            setState(() {
              _step++;
              _state = 'ai-speaking';
            });
            _startAiTimer();

            final nextPrompt = _step == 2
                ? 'Excellent pronunciation! Now try asking for the check: "Could you bring us the bill, please?"'
                : 'Spot on! Now ask for recommendations: "What do you recommend for lunch today?"';

            setState(() {
              _messages.add(
                VoiceMessage(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  sender: 'ai',
                  text: nextPrompt,
                  audioTime: '00:05',
                ),
              );
            });
          } else {
            setState(() {
              _completed = true;
            });
          }
        }
      });
    } else if (_state == 'ai-speaking') {
      _timer?.cancel();
      setState(() {
        _state = 'listening';
        _secs = 0;
      });
      _startListeningTimer();
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.lessonTitle ?? 'Ordering Food & Drinks at a Cafe';
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    if (_completed) {
      return _buildTrophyScreen(surfaces, title, l10n);
    }

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: Column(
            children: [
              _buildHeader(surfaces, l10n),
              Expanded(
                child: _buildTranscriptFeed(surfaces, l10n),
              ),
              _buildControlPanel(surfaces, l10n),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(AimSurfaceTheme surfaces, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space12,
      ),
      decoration: BoxDecoration(
        color: surfaces.surface,
        border: Border(
          bottom: BorderSide(color: surfaces.border, width: 1),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: Icon(Icons.close, color: surfaces.textPrimary, size: 22),
                onPressed: () => context.pop(),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: const BoxDecoration(
                      gradient: AimGradients.gzHero,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(Icons.star, color: AimColors.neutral0, size: 14),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    l10n.voiceAiTitle,
                    style: AimTextStyles.caption.copyWith(
                      fontWeight: AimFontWeights.extrabold,
                      color: surfaces.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                l10n.voiceAiStep(_step),
                style: AimTextStyles.caption.copyWith(
                  color: AimColors.primary500,
                  fontWeight: AimFontWeights.bold,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: AimRadius.borderPill,
            child: LinearProgressIndicator(
              value: _step / 3,
              minHeight: 6,
              backgroundColor: surfaces.border,
              valueColor: const AlwaysStoppedAnimation<Color>(AimColors.primary500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTranscriptFeed(AimSurfaceTheme surfaces, AppLocalizations l10n) {
    return ListView.builder(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final message = _messages[index];
        final isUser = message.sender == 'user';

        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Column(
            crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(bottom: 4),
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.75,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  gradient: isUser ? AimGradients.gzHero : null,
                  color: isUser ? null : surfaces.surface,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isUser ? 16 : 0),
                    bottomRight: Radius.circular(isUser ? 0 : 16),
                  ),
                  border: isUser ? null : Border.all(color: surfaces.border),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.neutral900.withValues(alpha: 0.03),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  message.text,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: isUser ? AimColors.neutral0 : surfaces.textPrimary,
                  ),
                ),
              ),
              if (message.audioTime != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12, left: 4, right: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.volume_up, size: 12, color: AimColors.primary500),
                      const SizedBox(width: 4),
                      Text(
                        l10n.voiceAiAudio(message.audioTime!),
                        style: AimTextStyles.caption.copyWith(
                          color: AimColors.primary500,
                          fontWeight: AimFontWeights.semibold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildControlPanel(AimSurfaceTheme surfaces, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space24,
      ),
      decoration: BoxDecoration(
        color: surfaces.surface,
        border: Border(
          top: BorderSide(color: surfaces.border, width: 1),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildEqualizerWaveform(),
          const SizedBox(height: 16),
          _buildStatusBadge(l10n),
          const SizedBox(height: 16),
          _buildMicButton(),
          const SizedBox(height: 12),
          Text(
            _state == 'listening'
                ? l10n.voiceAiFinishHint
                : l10n.voiceAiStartHint,
            style: AimTextStyles.caption.copyWith(
              color: surfaces.textMuted,
              fontWeight: AimFontWeights.medium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEqualizerWaveform() {
    return SizedBox(
      height: 36,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(12, (index) {
          final heights = [10.0, 18.0, 28.0, 34.0, 24.0, 36.0, 22.0, 14.0, 30.0, 16.0, 12.0, 8.0];
          final height = _state != 'evaluating' ? heights[index] : 6.0;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            margin: const EdgeInsets.symmetric(horizontal: 2.5),
            width: 5,
            height: height,
            decoration: BoxDecoration(
              color: _state == 'ai-speaking'
                  ? AimColors.primary500
                  : _state == 'listening'
                      ? AimColors.error500
                      : AimColors.neutral300,
              borderRadius: BorderRadius.circular(10),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStatusBadge(AppLocalizations l10n) {
    if (_state == 'ai-speaking') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: AimColors.primary500.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.volume_up, size: 14, color: AimColors.primary500),
            const SizedBox(width: 6),
            Text(
              l10n.voiceAiStatusAiSpeaking,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.primary500,
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ],
        ),
      );
    } else if (_state == 'listening') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: AimColors.error500.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.mic, size: 14, color: AimColors.error500),
            const SizedBox(width: 6),
            Text(
              l10n.voiceAiStatusListening(_secs.toString().padLeft(2, '0')),
              style: AimTextStyles.caption.copyWith(
                color: AimColors.error500,
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: AimColors.primary500.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 10,
              height: 10,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(AimColors.primary500),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              l10n.voiceAiStatusEvaluating,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.primary500,
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildMicButton() {
    final isListening = _state == 'listening';

    return GestureDetector(
      onTap: _state == 'evaluating' ? null : _handleMicTap,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (isListening) ...[
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AimColors.error500.withValues(alpha: 0.1),
              ),
            ),
            Container(
              width: 86,
              height: 86,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AimColors.error500.withValues(alpha: 0.15),
              ),
            ),
          ],
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: isListening ? null : AimGradients.gzHero,
              color: isListening ? AimColors.error500 : null,
              boxShadow: [
                BoxShadow(
                  color: (isListening ? AimColors.error500 : AimColors.primary500).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.mic,
              color: AimColors.neutral0,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrophyScreen(AimSurfaceTheme surfaces, String lessonTitle, AppLocalizations l10n) {
    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space32,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  Positioned(
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AimColors.success500.withValues(alpha: 0.12),
                      ),
                    ),
                  ),
                  Container(
                    width: 76,
                    height: 76,
                    decoration: const BoxDecoration(
                      gradient: AimGradients.gzFire,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AimColors.warning500,
                          blurRadius: 20,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.emoji_events,
                        color: AimColors.neutral0,
                        size: 38,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AimSpacing.space24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AimColors.success500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  l10n.voiceAiCompletedBadge,
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.success500,
                    fontWeight: AimFontWeights.extrabold,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                l10n.voiceAiMasteredTitle,
                style: AimTextStyles.h2.copyWith(
                  color: surfaces.textPrimary,
                  fontSize: 28,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                l10n.voiceAiCompletedSubtitle(lessonTitle),
                textAlign: TextAlign.center,
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: AimSpacing.space32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: AimRadius.borderLg,
                  border: Border.all(color: surfaces.border),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.neutral900.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text(
                          l10n.voiceAiXpEarned,
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                            fontWeight: AimFontWeights.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '+50 XP',
                          style: AimTextStyles.bodyLg.copyWith(
                            color: AimColors.primary500,
                            fontWeight: AimFontWeights.extrabold,
                            fontSize: 20,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 1,
                      height: 32,
                      color: surfaces.border,
                    ),
                    Column(
                      children: [
                        Text(
                          l10n.voiceAiAccuracy,
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                            fontWeight: AimFontWeights.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.check, size: 16, color: AimColors.success500),
                            const SizedBox(width: 4),
                            Text(
                              l10n.voiceAiAccuracyScore,
                              style: AimTextStyles.bodyLg.copyWith(
                                color: AimColors.success500,
                                fontWeight: AimFontWeights.extrabold,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Spacer(flex: 3),
              AIMGradientButton(
                label: l10n.voiceAiReturnButton,
                fullWidth: true,
                onPressed: () => context.pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
