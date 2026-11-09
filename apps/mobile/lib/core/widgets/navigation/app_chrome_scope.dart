import 'dart:collection';

import 'package:flutter/widgets.dart';

/// How the app frame's top bar is drawn for the current screen.
enum ChromeBarMode {
  /// Main screens (Dashboard, Courses, Improve, Practice): AIM, streak, bell.
  root,

  /// Menu screens (Achievements, Support, ...): back + title + streak + bell.
  section,

  /// Screens you drill into (a certificate, a ticket, ...): back + title.
  detail,
}

/// What a page asks the frame's top bar to show.
@immutable
class ChromeBarSpec {
  const ChromeBarSpec({
    this.title,
    this.titleWidget,
    this.subtitle,
    this.actions = const [],
    this.onBack,
  });

  final String? title;
  final Widget? titleWidget;
  final String? subtitle;
  final List<Widget> actions;

  /// What the back arrow does; the frame goes back one page when null.
  final VoidCallback? onBack;
}

/// Collects the top-bar requests of the pages inside the app frame. The page
/// shown on top is the one registered last; when it goes away the page under
/// it is shown again.
class ChromeBarHost extends ChangeNotifier {
  final LinkedHashMap<Object, ChromeBarSpec> _specs = LinkedHashMap();
  bool _disposed = false;

  /// The spec of the page on top, or null when none asked for a bar.
  ChromeBarSpec? get active => _specs.isEmpty ? null : _specs.values.last;

  void set(Object owner, ChromeBarSpec spec) {
    // Pages unregister after a frame, which can be after the whole frame has
    // gone (sign-out), so a disposed host just ignores them.
    if (_disposed) return;
    // Updating in place keeps the registration order.
    _specs[owner] = spec;
    notifyListeners();
  }

  void remove(Object owner) {
    if (_disposed) return;
    if (_specs.remove(owner) != null) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}

/// Provided by the app frame. Pages use it to hand their title (and actions)
/// to the frame's single top bar instead of drawing a second bar.
class AppChromeScope extends InheritedWidget {
  const AppChromeScope({
    super.key,
    required this.host,
    required this.mode,
    required super.child,
  });

  final ChromeBarHost host;
  final ChromeBarMode mode;

  static AppChromeScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AppChromeScope>();

  @override
  bool updateShouldNotify(AppChromeScope old) => old.mode != mode || old.host != host;
}

/// Registers a [ChromeBarSpec] while mounted and draws nothing itself.
class ChromeBarRegistrar extends StatefulWidget {
  const ChromeBarRegistrar({super.key, required this.host, required this.spec});

  final ChromeBarHost host;
  final ChromeBarSpec spec;

  @override
  State<ChromeBarRegistrar> createState() => _ChromeBarRegistrarState();
}

class _ChromeBarRegistrarState extends State<ChromeBarRegistrar> {
  late ChromeBarHost _host = widget.host;
  bool _disposed = false;

  @override
  void initState() {
    super.initState();
    _publish();
  }

  @override
  void didUpdateWidget(ChromeBarRegistrar old) {
    super.didUpdateWidget(old);
    if (old.host != widget.host) {
      old.host.remove(this);
      _host = widget.host;
    }
    _publish();
  }

  // The frame rebuilds its bar from this, which must not happen while the
  // tree is still building: publish after the frame.
  void _publish() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_disposed) return;
      _host.set(this, widget.spec);
    });
  }

  @override
  void dispose() {
    _disposed = true;
    final host = _host;
    // Also after the frame: the host notifies the frame's bar.
    WidgetsBinding.instance.addPostFrameCallback((_) => host.remove(this));
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
