import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The currently selected bottom-nav tab index in [MainShellPage].
///
/// Lets descendant pages (e.g. Home's "Browse Courses" action) switch tabs
/// without needing a [BuildContext] lookup into shell-private state.
final mainShellTabIndexProvider = StateProvider<int>((ref) => 0);
