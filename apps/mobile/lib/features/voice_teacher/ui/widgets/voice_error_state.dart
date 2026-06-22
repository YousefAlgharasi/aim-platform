import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

enum VoiceErrorType {
  networkError,
  microphoneError,
  serverError,
  unknownError,
}

class VoiceErrorState extends StatelessWidget {
  final VoiceErrorType errorType;
  final String? fallbackText;
  final VoidCallback? onRetry;
  final VoidCallback? onDismiss;

  const VoiceErrorState({
    super.key,
    required this.errorType,
    this.fallbackText,
    this.onRetry,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.all(AimSpacing.space16),
      padding: EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: theme.colorScheme.errorContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(AimRadius.md),
        border: Border.all(
          color: theme.colorScheme.error.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                _iconForType(errorType),
                size: 20,
                color: theme.colorScheme.error,
              ),
              SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  _titleForType(errorType, isRtl),
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.error,
                  ),
                ),
              ),
              if (onDismiss != null)
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: onDismiss,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 28,
                    minHeight: 28,
                  ),
                ),
            ],
          ),
          SizedBox(height: AimSpacing.space4),
          Text(
            _messageForType(errorType, isRtl),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onErrorContainer,
            ),
          ),
          if (fallbackText != null && fallbackText!.isNotEmpty) ...[
            SizedBox(height: AimSpacing.space8),
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(AimSpacing.space8),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(AimRadius.sm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isRtl ? 'رد المعلم (نصي):' : 'Teacher response (text):',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: AimSpacing.space4),
                  Text(
                    fallbackText!,
                    style: theme.textTheme.bodyMedium,
                    textDirection: _containsArabic(fallbackText!)
                        ? TextDirection.rtl
                        : TextDirection.ltr,
                  ),
                ],
              ),
            ),
          ],
          if (onRetry != null) ...[
            SizedBox(height: AimSpacing.space8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh, size: 18),
                label: Text(isRtl ? 'إعادة المحاولة' : 'Try Again'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AimColors.primary500,
                  side: BorderSide(color: AimColors.primary500.withOpacity(0.3)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  IconData _iconForType(VoiceErrorType type) {
    switch (type) {
      case VoiceErrorType.networkError:
        return Icons.wifi_off;
      case VoiceErrorType.microphoneError:
        return Icons.mic_off;
      case VoiceErrorType.serverError:
        return Icons.cloud_off;
      case VoiceErrorType.unknownError:
        return Icons.error_outline;
    }
  }

  String _titleForType(VoiceErrorType type, bool isRtl) {
    switch (type) {
      case VoiceErrorType.networkError:
        return isRtl ? 'خطأ في الاتصال' : 'Connection Error';
      case VoiceErrorType.microphoneError:
        return isRtl ? 'خطأ في الميكروفون' : 'Microphone Error';
      case VoiceErrorType.serverError:
        return isRtl ? 'خطأ في الخادم' : 'Server Error';
      case VoiceErrorType.unknownError:
        return isRtl ? 'حدث خطأ' : 'Something Went Wrong';
    }
  }

  String _messageForType(VoiceErrorType type, bool isRtl) {
    switch (type) {
      case VoiceErrorType.networkError:
        return isRtl
            ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
            : 'Check your internet connection and try again';
      case VoiceErrorType.microphoneError:
        return isRtl
            ? 'لم نتمكن من الوصول إلى الميكروفون. تحقق من الأذونات'
            : 'Could not access the microphone. Check permissions';
      case VoiceErrorType.serverError:
        return isRtl
            ? 'الخادم غير متاح حالياً. حاول لاحقاً'
            : 'Server is currently unavailable. Try again later';
      case VoiceErrorType.unknownError:
        return isRtl
            ? 'حدث خطأ غير متوقع. حاول مرة أخرى'
            : 'An unexpected error occurred. Please try again';
    }
  }

  bool _containsArabic(String text) {
    return RegExp(r'[؀-ۿ]').hasMatch(text);
  }
}
