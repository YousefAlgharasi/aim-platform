import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Data for a single entry in [AIMAppDrawer].
class AIMDrawerItemData {
  const AIMDrawerItemData({
    required this.icon,
    required this.label,
    required this.onTap,
    this.selected = false,
  });

  final Widget icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;
}

/// Side navigation drawer shown from [MainShellPage]'s `Scaffold.drawer`.
///
/// Drop-in compatible with `Scaffold(drawer: AIMAppDrawer(...))` or
/// `endDrawer`. Renders a [header], a scrollable list of [items], and an
/// optional [footer] (e.g. a sign-out action).
///
/// ```dart
/// Scaffold(
///   drawer: AIMAppDrawer(
///     header: AIMDrawerUserHeader(...),
///     items: [
///       AIMDrawerItemData(icon: Icon(Icons.home_outlined), label: 'Home', onTap: ..., selected: true),
///     ],
///     footer: AIMButton(child: Text('Sign out'), onPressed: ...),
///   ),
/// )
/// ```
class AIMAppDrawer extends StatelessWidget {
  const AIMAppDrawer({
    required this.items,
    required this.header,
    super.key,
    this.footer,
    this.semanticLabel,
  });

  /// User avatar/name block shown above the menu items.
  final Widget header;

  /// Navigation entries.
  final List<AIMDrawerItemData> items;

  /// Optional content below the menu items, e.g. a sign-out button.
  final Widget? footer;

  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);

    return Drawer(
      backgroundColor: surfaces.surface,
      semanticLabel: semanticLabel,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
              child: header,
            ),
            Divider(height: 1, color: surfaces.divider),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(
                  vertical: AimSpacing.space8,
                ),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return _AIMDrawerItem(
                    data: item,
                    surfaces: surfaces,
                    soft: soft,
                  );
                },
              ),
            ),
            if (footer != null) ...[
              Divider(height: 1, color: surfaces.divider),
              Padding(
                padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
                child: footer,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AIMDrawerItem extends StatelessWidget {
  const _AIMDrawerItem({
    required this.data,
    required this.surfaces,
    required this.soft,
  });

  final AIMDrawerItemData data;
  final AimSurfaceTheme surfaces;
  final AimSoftFillTheme soft;

  @override
  Widget build(BuildContext context) {
    final background = data.selected ? soft.primary : Colors.transparent;
    final foreground =
        data.selected ? soft.onPrimary : surfaces.textSecondary;

    return Padding(
      padding: const EdgeInsetsDirectional.symmetric(
        horizontal: AimSpacing.space12,
        vertical: AimSpacing.space4,
      ),
      child: Material(
        color: background,
        borderRadius: AimRadius.borderMd,
        child: InkWell(
          onTap: data.onTap,
          borderRadius: AimRadius.borderMd,
          splashColor: surfaces.statePressed,
          highlightColor: surfaces.statePressed,
          child: Semantics(
            button: true,
            selected: data.selected,
            label: data.label,
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                minHeight: AimSizes.touchTarget,
              ),
              child: Padding(
                padding: const EdgeInsetsDirectional.symmetric(
                  horizontal: AimSpacing.space12,
                ),
                child: Row(
                  children: [
                    IconTheme(
                      data: IconThemeData(
                        color: foreground,
                        size: AimSizes.iconMd,
                      ),
                      child: data.icon,
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: Text(
                        data.label,
                        style: AimTextStyles.bodyMd.copyWith(
                          color: foreground,
                          fontWeight: data.selected
                              ? AimFontWeights.semibold
                              : AimFontWeights.regular,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
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
