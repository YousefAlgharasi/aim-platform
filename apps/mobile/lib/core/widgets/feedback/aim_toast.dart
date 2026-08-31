// AIMToast — shared top-floating action and error toast banner.
//
// Features:
// 1. Positioned at the TOP of the screen (below safe area / status bar).
// 2. Smooth slide + fade animations on entry and exit.
// 3. Fully localized in English (LTR) and Arabic (RTL).
// 4. Automatically translates raw technical exceptions (AppException,
//    ApiClientException, timeouts, server errors) to clean user-friendly text.
// 5. Dismissible via tap, swipe-up, or auto-dismiss timer.

import 'dart:async';
import 'package:flutter/material.dart';

import '../../errors/app_exception.dart';
import '../../networking/api_client_exception.dart';
import 'aim_alert_banner.dart';

class AIMToast {
  const AIMToast._();

  static OverlayEntry? _activeEntry;
  static Timer? _dismissTimer;

  /// Shows a top-floating, dismissible banner toast.
  static void show(
    BuildContext context, {
    required String message,
    AIMAlertTone tone = AIMAlertTone.success,
    Duration duration = const Duration(milliseconds: 3500),
    String? title,
  }) {
    dismissCurrent();

    final overlay = Overlay.maybeOf(context, rootOverlay: true) ??
        Overlay.maybeOf(context);

    if (overlay == null) {
      // Fallback for minimal headless widget test environments
      ScaffoldMessenger.maybeOf(context)?.showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.only(top: 16, left: 16, right: 16),
        ),
      );
      return;
    }

    late final OverlayEntry entry;
    entry = OverlayEntry(
      builder: (ctx) => _AIMTopToastOverlay(
        message: message,
        tone: tone,
        duration: duration,
        title: title,
        onDismissed: () {
          if (_activeEntry == entry) {
            entry.remove();
            _activeEntry = null;
          }
        },
      ),
    );

    _activeEntry = entry;
    overlay.insert(entry);
  }

  /// Formats and displays an error toast at the top of the screen.
  /// Automatically translates raw exceptions into clean localized strings.
  static void showError(
    BuildContext context,
    dynamic error, {
    String? customMessage,
    Duration duration = const Duration(milliseconds: 4000),
    String? title,
  }) {
    final localizedMessage = formatLocalizedErrorMessage(
      context,
      error,
      customMessage: customMessage,
    );

    show(
      context,
      message: localizedMessage,
      tone: AIMAlertTone.error,
      duration: duration,
      title: title,
    );
  }

  /// Shows a success toast at the top of the screen.
  static void showSuccess(
    BuildContext context,
    String message, {
    Duration duration = const Duration(milliseconds: 3200),
    String? title,
  }) {
    show(
      context,
      message: message,
      tone: AIMAlertTone.success,
      duration: duration,
      title: title,
    );
  }

  /// Shows an info toast at the top of the screen.
  static void showInfo(
    BuildContext context,
    String message, {
    Duration duration = const Duration(milliseconds: 3500),
    String? title,
  }) {
    show(
      context,
      message: message,
      tone: AIMAlertTone.info,
      duration: duration,
      title: title,
    );
  }

  /// Shows a warning toast at the top of the screen.
  static void showWarning(
    BuildContext context,
    String message, {
    Duration duration = const Duration(milliseconds: 3800),
    String? title,
  }) {
    show(
      context,
      message: message,
      tone: AIMAlertTone.warning,
      duration: duration,
      title: title,
    );
  }

  /// Immediately dismisses any active top toast.
  static void dismissCurrent() {
    _dismissTimer?.cancel();
    _dismissTimer = null;
    if (_activeEntry != null) {
      try {
        _activeEntry!.remove();
      } catch (_) {}
      _activeEntry = null;
    }
  }

  /// Translates raw errors into friendly, localized English or Arabic text.
  static String formatLocalizedErrorMessage(
    BuildContext context,
    dynamic error, {
    String? customMessage,
  }) {
    if (customMessage != null && customMessage.trim().isNotEmpty) {
      return customMessage;
    }

    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    if (error == null) {
      return isArabic
          ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'
          : 'Something went wrong. Please try again.';
    }

    String raw = error.toString();
    String code = '';

    if (error is AppException) {
      code = error.code.toUpperCase();
      raw = error.message;
    } else if (error is ApiClientException) {
      code = error.code.toUpperCase();
      raw = error.message;
    }

    if (code.contains('INTERNAL_SERVER_ERROR') ||
        raw.contains('INTERNAL_SERVER_ERROR') ||
        raw.contains('Internal server error') ||
        raw.contains('500')) {
      return isArabic
          ? 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.'
          : 'Server error. Please try again in a moment.';
    }

    if (code.contains('TIMEOUT') ||
        code.contains('NETWORK') ||
        code.contains('CONNECTION') ||
        raw.contains('timeout') ||
        raw.contains('SocketException') ||
        raw.contains('Failed host lookup')) {
      return isArabic
          ? 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.'
          : 'Network timeout. Please check your internet connection.';
    }

    if (code.contains('UNAUTHORIZED') ||
        code.contains('AUTH') ||
        raw.contains('401') ||
        raw.contains('expired')) {
      return isArabic
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.'
          : 'Your session has expired. Please sign in again.';
    }

    if (code.contains('FORBIDDEN') || raw.contains('403')) {
      return isArabic
          ? 'ليس لديك الإذن للقيام بهذا الإجراء.'
          : 'You do not have permission to perform this action.';
    }

    if (code.contains('NOT_FOUND') || raw.contains('404')) {
      return isArabic
          ? 'المحتوى المطلوب غير متوفر حالياً.'
          : 'The requested resource was not found.';
    }

    if (code.contains('INVALID_CREDENTIALS')) {
      return isArabic
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
          : 'Invalid email or password.';
    }

    // Clean plain user-visible string without raw exception tags
    if (!raw.contains('AppException') &&
        !raw.contains('Exception:') &&
        !raw.contains('Error:') &&
        raw.trim().isNotEmpty &&
        raw.length < 100) {
      return raw;
    }

    return isArabic
        ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
        : 'Something went wrong. Please try again.';
  }
}

class _AIMTopToastOverlay extends StatefulWidget {
  const _AIMTopToastOverlay({
    required this.message,
    required this.tone,
    required this.duration,
    this.title,
    required this.onDismissed,
  });

  final String message;
  final AIMAlertTone tone;
  final Duration duration;
  final String? title;
  final VoidCallback onDismissed;

  @override
  State<_AIMTopToastOverlay> createState() => _AIMTopToastOverlayState();
}

class _AIMTopToastOverlayState extends State<_AIMTopToastOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _offsetAnimation;
  late final Animation<double> _fadeAnimation;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
      reverseDuration: const Duration(milliseconds: 240),
    );

    _offsetAnimation = Tween<Offset>(
      begin: const Offset(0, -0.6),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    ));

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );

    _controller.forward();
    _timer = Timer(widget.duration, _dismiss);
  }

  void _dismiss() {
    if (!mounted) return;
    _timer?.cancel();
    _timer = null;
    _controller.reverse().then((_) {
      if (mounted) {
        widget.onDismissed();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final topPadding = mediaQuery.padding.top;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final (Color bg, Color border, Color text, IconData icon) =
        switch (widget.tone) {
      AIMAlertTone.error => isDark
          ? (
              const Color(0xFF2D1215),
              const Color(0xFF7F1D1D),
              const Color(0xFFFCA5A5),
              Icons.error_outline_rounded
            )
          : (
              const Color(0xFFFEF2F2),
              const Color(0xFFFECACA),
              const Color(0xFF991B1B),
              Icons.error_outline_rounded
            ),
      AIMAlertTone.success => isDark
          ? (
              const Color(0xFF0F291E),
              const Color(0xFF065F46),
              const Color(0xFF6EE7B7),
              Icons.check_circle_outline_rounded
            )
          : (
              const Color(0xFFF0FDF4),
              const Color(0xFFBBF7D0),
              const Color(0xFF166534),
              Icons.check_circle_outline_rounded
            ),
      AIMAlertTone.warning => isDark
          ? (
              const Color(0xFF2E200B),
              const Color(0xFF78350F),
              const Color(0xFFFDE68A),
              Icons.warning_amber_rounded
            )
          : (
              const Color(0xFFFFFBEB),
              const Color(0xFFFDE68A),
              const Color(0xFF92400E),
              Icons.warning_amber_rounded
            ),
      AIMAlertTone.info => isDark
          ? (
              const Color(0xFF131E3A),
              const Color(0xFF1E3A8A),
              const Color(0xFF93C5FD),
              Icons.info_outline_rounded
            )
          : (
              const Color(0xFFEFF6FF),
              const Color(0xFFBFDBFE),
              const Color(0xFF1E40AF),
              Icons.info_outline_rounded
            ),
    };

    return Positioned(
      top: topPadding + 10,
      left: 16,
      right: 16,
      child: SlideTransition(
        position: _offsetAnimation,
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: GestureDetector(
            onVerticalDragUpdate: (details) {
              if (details.primaryDelta != null && details.primaryDelta! < -3) {
                _dismiss();
              }
            },
            onTap: _dismiss,
            child: Material(
              color: Colors.transparent,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: border, width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.1),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(icon, color: text, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (widget.title != null) ...[
                            Text(
                              widget.title!,
                              style: TextStyle(
                                color: text,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 2),
                          ],
                          Text(
                            widget.message,
                            style: TextStyle(
                              color: text,
                              fontSize: 13.5,
                              fontWeight: FontWeight.w500,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.close_rounded,
                      color: text.withValues(alpha: 0.6),
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
