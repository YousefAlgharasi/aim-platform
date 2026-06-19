import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/widgets/navigation/aim_top_app_bar.dart';

enum VoiceScreenState { idle, listening, processing, playing }

class VoiceTeacherScreen extends StatefulWidget {
  final String sessionId;

  const VoiceTeacherScreen({super.key, required this.sessionId});

  @override
  State<VoiceTeacherScreen> createState() => _VoiceTeacherScreenState();
}

class _VoiceTeacherScreenState extends State<VoiceTeacherScreen> {
  VoiceScreenState _state = VoiceScreenState.idle;
  final List<_ChatBubble> _messages = [];

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AIMTopAppBar(
        title: isRtl ? 'المعلم الصوتي' : 'Voice Teacher',
        leading: IconButton(
          icon: Icon(isRtl ? Icons.arrow_forward : Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.mic_none,
                          size: 64,
                          color: AIMColors.primary.withOpacity(0.4),
                        ),
                        SizedBox(height: AIMSpacing.md),
                        Text(
                          isRtl
                              ? 'اضغط على الزر للبدء بالتحدث'
                              : 'Tap the button to start speaking',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(AIMSpacing.md),
                    reverse: true,
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[_messages.length - 1 - index];
                      return _buildBubble(context, msg, isRtl);
                    },
                  ),
          ),
          _buildBottomBar(context, isRtl),
        ],
      ),
    );
  }

  Widget _buildBubble(BuildContext context, _ChatBubble msg, bool isRtl) {
    final theme = Theme.of(context);
    final isTeacher = msg.role == 'teacher';

    return Align(
      alignment: isTeacher
          ? (isRtl ? Alignment.centerRight : Alignment.centerLeft)
          : (isRtl ? Alignment.centerLeft : Alignment.centerRight),
      child: Container(
        margin: EdgeInsets.only(bottom: AIMSpacing.sm),
        padding: EdgeInsets.symmetric(
          horizontal: AIMSpacing.md,
          vertical: AIMSpacing.sm,
        ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isTeacher
              ? theme.colorScheme.surfaceContainerHighest
              : AIMColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: theme.textTheme.bodyMedium,
              textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
            ),
            if (msg.audioRef != null)
              Padding(
                padding: EdgeInsets.only(top: AIMSpacing.xs),
                child: Icon(
                  Icons.play_circle_outline,
                  size: 20,
                  color: AIMColors.primary,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, bool isRtl) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(AIMSpacing.lg),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          top: BorderSide(color: theme.dividerColor),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_state == VoiceScreenState.listening)
              Padding(
                padding: EdgeInsets.only(bottom: AIMSpacing.sm),
                child: Text(
                  isRtl ? 'جارٍ الاستماع...' : 'Listening...',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AIMColors.primary,
                  ),
                ),
              ),
            if (_state == VoiceScreenState.processing)
              Padding(
                padding: EdgeInsets.only(bottom: AIMSpacing.sm),
                child: Text(
                  isRtl ? 'جارٍ المعالجة...' : 'Processing...',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            GestureDetector(
              onTap: _state == VoiceScreenState.idle ? _onRecordTap : null,
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _state == VoiceScreenState.listening
                      ? Colors.red
                      : AIMColors.primary,
                ),
                child: Icon(
                  _state == VoiceScreenState.listening
                      ? Icons.stop
                      : Icons.mic,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onRecordTap() {
    setState(() {
      _state = VoiceScreenState.listening;
    });
  }
}

class _ChatBubble {
  final String role;
  final String text;
  final String? audioRef;

  const _ChatBubble({
    required this.role,
    required this.text,
    this.audioRef,
  });
}
