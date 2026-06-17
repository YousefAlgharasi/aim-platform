import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../ds_preview_state.dart';
import '../sections/ds_button_section.dart';
import '../sections/ds_color_section.dart';
import '../sections/ds_feedback_section.dart';
import '../sections/ds_foundations_section.dart';
import '../sections/ds_learning_section.dart';
import '../sections/ds_navigation_section.dart';
import '../sections/ds_typography_section.dart';

/// Debug-only design system preview screen.
///
/// Entry point: call [DSPreviewPage.push] from a debug gesture or route.
/// Production navigation is never touched — this page pushes itself
/// modally on top of whatever is showing.
///
/// ```dart
/// if (kDebugMode) DSPreviewPage.push(context);
/// ```
class DSPreviewPage extends StatefulWidget {
  const DSPreviewPage({super.key});

  /// Push the preview modally. No-op in release builds.
  static void push(BuildContext context) {
    if (!kDebugMode) return;
    Navigator.of(context, rootNavigator: true).push<void>(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => const DSPreviewPage(),
        settings: const RouteSettings(name: '/debug/design-system'),
      ),
    );
  }

  @override
  State<DSPreviewPage> createState() => _DSPreviewPageState();
}

class _DSPreviewPageState extends State<DSPreviewPage> {
  final _state = DSPreviewState();
  int _tab = 0;

  static const _tabs = [
    'Foundations',
    'Buttons',
    'Forms',
    'Feedback',
    'Navigation',
    'Learning',
  ];

  @override
  void dispose() {
    _state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _state,
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          themeMode: _state.themeMode,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          builder: (context, child) => Directionality(
            textDirection: _state.textDirection,
            child: child!,
          ),
          home: _PreviewShell(
            state: _state,
            selectedTab: _tab,
            onTabChanged: (i) => setState(() => _tab = i),
            tabs: _tabs,
            onClose: () => Navigator.of(context, rootNavigator: true).pop(),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Shell with top controls + scrollable body
// ---------------------------------------------------------------------------

class _PreviewShell extends StatelessWidget {
  const _PreviewShell({
    required this.state,
    required this.selectedTab,
    required this.onTabChanged,
    required this.tabs,
    required this.onClose,
  });

  final DSPreviewState state;
  final int selectedTab;
  final ValueChanged<int> onTabChanged;
  final List<String> tabs;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      appBar: _DSAppBar(
        state: state,
        onClose: onClose,
      ),
      body: Column(
        children: [
          // Tab strip
          Container(
            color: surfaces.surface,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.space8,
                vertical: AimSpacing.space8,
              ),
              child: Row(
                children: [
                  for (int i = 0; i < tabs.length; i++)
                    _TabChip(
                      label: tabs[i],
                      selected: i == selectedTab,
                      onTap: () => onTabChanged(i),
                    ),
                ],
              ),
            ),
          ),
          // Body
          Expanded(
            child: _PreviewBody(tabIndex: selectedTab),
          ),
        ],
      ),
    );
  }
}

class _DSAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _DSAppBar({required this.state, required this.onClose});

  final DSPreviewState state;
  final VoidCallback onClose;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      height: preferredSize.height + MediaQuery.of(context).padding.top,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        color: surfaces.surface,
        border: Border(bottom: BorderSide(color: surfaces.border)),
      ),
      child: Row(
        children: [
          const SizedBox(width: AimSpacing.space4),
          IconButton(
            icon: Icon(Icons.close, color: surfaces.textPrimary),
            tooltip: 'Close preview',
            onPressed: onClose,
          ),
          Expanded(
            child: Text(
              '⚙ Design System Preview',
              style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // EN / AR toggle
          _ToggleButton(
            label: state.isArabic ? 'AR' : 'EN',
            icon: Icons.translate,
            onTap: state.toggleLocale,
          ),
          // Light / Dark toggle
          _ToggleButton(
            label: state.isDark ? 'Dark' : 'Light',
            icon: state.isDark ? Icons.dark_mode : Icons.light_mode,
            onTap: state.toggleTheme,
          ),
          const SizedBox(width: AimSpacing.space8),
        ],
      ),
    );
  }
}

class _ToggleButton extends StatelessWidget {
  const _ToggleButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return InkWell(
      onTap: onTap,
      borderRadius: AimRadius.borderSm,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space8,
          vertical: AimSpacing.space4,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: AimSizes.iconSm, color: surfaces.textSecondary),
            const SizedBox(width: 4),
            Text(
              label,
              style: AimTextStyles.caption
                  .copyWith(color: surfaces.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AimMotion.durationFast,
        margin: const EdgeInsets.only(right: AimSpacing.space8),
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space4,
        ),
        decoration: BoxDecoration(
          color: selected ? AimColors.primary500 : surfaces.surfaceSunken,
          borderRadius: AimRadius.borderPill,
        ),
        child: Text(
          label,
          style: AimTextStyles.label.copyWith(
            color: selected ? AimColors.neutral0 : surfaces.textSecondary,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Scrollable body per tab
// ---------------------------------------------------------------------------

class _PreviewBody extends StatelessWidget {
  const _PreviewBody({required this.tabIndex});

  final int tabIndex;

  @override
  Widget build(BuildContext context) {
    final Widget content = switch (tabIndex) {
      0 => const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DSColorSection(),
            DSTypographySection(),
            DSFoundationsSection(),
          ],
        ),
      1 => const DSButtonSection(),
      2 => const DSFormSection(),
      3 => const DSFeedbackSection(),
      4 => const DSNavigationSection(),
      5 => const DSLearningSection(),
      _ => const SizedBox.shrink(),
    };

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AimSpacing.space16),
      child: content,
    );
  }
}
