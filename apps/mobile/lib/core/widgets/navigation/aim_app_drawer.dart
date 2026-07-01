import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Data for a single entry in [AIMAppDrawer].
class AIMDrawerItemData {
  const AIMDrawerItemData({
    required this.icon,
    required this.label,
    required this.onTap,
    this.selected = false,
    this.trailing,
  });

  final Widget icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;

  /// Optional trailing content rendered at the end of the row, e.g. an
  /// unread-count badge or a `chevron_right` affordance icon. Defaults to
  /// `null` (no trailing content), matching the widget's original layout.
  final Widget? trailing;
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
    this.menuLabel,
    this.moreLabel,
    this.moreItems,
  });

  /// User avatar/name block shown above the menu items.
  final Widget header;

  /// Navigation entries.
  final List<AIMDrawerItemData> items;

  /// Optional content below the menu items, e.g. a sign-out button.
  final Widget? footer;

  final String? semanticLabel;

  /// Optional uppercase section label rendered above [items] (e.g. "MENU").
  /// Only rendered when [moreItems] is also provided, to match the
  /// mockup's two-section layout; ignored in the single-list default case.
  final String? menuLabel;

  /// Optional uppercase section label rendered above [moreItems] (e.g.
  /// "MORE"). Defaults to `null` — when `null` no label is drawn.
  final String? moreLabel;

  /// Optional second group of entries (e.g. Notifications, Achievements)
  /// rendered below [items]. Defaults to `null`, in which case the widget
  /// renders exactly as it did before this field existed.
  final List<AIMDrawerItemData>? moreItems;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final hasMoreSection = moreItems != null && moreItems!.isNotEmpty;

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
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  vertical: AimSpacing.space8,
                ),
                children: [
                  if (hasMoreSection && menuLabel != null)
                    _AIMDrawerSectionLabel(
                      label: menuLabel!,
                      color: surfaces.textMuted,
                    ),
                  for (final item in items)
                    _AIMDrawerItem(data: item, surfaces: surfaces, soft: soft),
                  if (hasMoreSection) ...[
                    if (moreLabel != null)
                      _AIMDrawerSectionLabel(
                        label: moreLabel!,
                        color: surfaces.textMuted,
                      ),
                    for (final item in moreItems!)
                      _AIMDrawerItem(
                        data: item,
                        surfaces: surfaces,
                        soft: soft,
                      ),
                  ],
                ],
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

class _AIMDrawerSectionLabel extends StatelessWidget {
  const _AIMDrawerSectionLabel({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.space24,
        AimSpacing.space16,
        AimSpacing.space24,
        AimSpacing.space8,
      ),
      child: Text(
        label,
        style: AimTextStyles.caption.copyWith(
          color: color,
          fontWeight: AimFontWeights.semibold,
          letterSpacing: 0.6,
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
                    if (data.trailing != null) ...[
                      const SizedBox(width: AimSpacing.componentGap),
                      data.trailing!,
                    ],
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
