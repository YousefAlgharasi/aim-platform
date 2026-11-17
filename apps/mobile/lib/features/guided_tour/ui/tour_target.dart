import 'package:flutter/material.dart';

/// Marks a widget as something a guided-tour step can point at.
///
/// Wrap the element in `TourTarget(id: 'daily-goal', child: ...)` using the id
/// the step names in `tour_definitions.dart`. It adds no layout of its own.
/// If an id is on screen more than once, the first one that can be seen is
/// used, like the web tour.
class TourTarget extends StatefulWidget {
  const TourTarget({super.key, required this.id, required this.child});

  final String id;
  final Widget child;

  @override
  State<TourTarget> createState() => _TourTargetState();
}

class _TourTargetState extends State<TourTarget> {
  final GlobalKey _key = GlobalKey();

  @override
  void initState() {
    super.initState();
    TourTargets._add(widget.id, _key);
  }

  @override
  void didUpdateWidget(covariant TourTarget old) {
    super.didUpdateWidget(old);
    if (old.id != widget.id) {
      TourTargets._remove(old.id, _key);
      TourTargets._add(widget.id, _key);
    }
  }

  @override
  void dispose() {
    TourTargets._remove(widget.id, _key);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      KeyedSubtree(key: _key, child: widget.child);
}

/// Finds the on-screen elements the tour steps point at.
class TourTargets {
  const TourTargets._();

  static final Map<String, List<GlobalKey>> _byId = {};

  static void _add(String id, GlobalKey key) =>
      (_byId[id] ??= <GlobalKey>[]).add(key);

  static void _remove(String id, GlobalKey key) {
    final keys = _byId[id];
    if (keys == null) return;
    keys.remove(key);
    if (keys.isEmpty) _byId.remove(id);
  }

  /// The context of the first target with this id that is built, laid out and
  /// on the page being shown; null when there is none (the step is skipped).
  static BuildContext? find(String id) {
    for (final key in List<GlobalKey>.of(_byId[id] ?? const [])) {
      final context = key.currentContext;
      if (context == null || !context.mounted) continue;
      final route = ModalRoute.of(context);
      if (route != null && !route.isCurrent) continue;
      final box = context.findRenderObject();
      if (box is! RenderBox || !box.attached || !box.hasSize) continue;
      if (box.size.isEmpty) continue;
      return context;
    }
    return null;
  }

  /// The target's rectangle in screen coordinates, or null.
  static Rect? rectOf(BuildContext? context) {
    if (context == null || !context.mounted) return null;
    final box = context.findRenderObject();
    if (box is! RenderBox || !box.attached || !box.hasSize) return null;
    return box.localToGlobal(Offset.zero) & box.size;
  }
}
