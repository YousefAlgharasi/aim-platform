import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../theme/theme.dart';

/// Reusable quick theme toggle icon button (Sun/Moon).
/// Toggles [themeModeProvider] between dark and light mode.
class AimQuickThemeToggle extends ConsumerWidget {
  const AimQuickThemeToggle({
    super.key,
    this.size = 36,
    this.iconSize = 18,
  });

  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final mode = ref.watch(themeModeProvider);
    final brightness = Theme.of(context).brightness;
    final isDark = mode == ThemeMode.dark ||
        (mode == ThemeMode.system && brightness == Brightness.dark);

    return GestureDetector(
      onTap: () {
        ref.read(themeModeProvider.notifier).state =
            isDark ? ThemeMode.light : ThemeMode.dark;
      },
      child: Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: surfaces.surfaceSunken,
          shape: BoxShape.circle,
          border: Border.all(color: surfaces.border),
        ),
        child: Icon(
          isDark ? Icons.nights_stay_outlined : Icons.wb_sunny_outlined,
          color: isDark ? AimColors.neutral300 : AimColors.warning500,
          size: iconSize,
        ),
      ),
    );
  }
}
