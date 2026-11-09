import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/theme.dart';
import 'navigation/app_chrome_scope.dart';

/// Building blocks for the pages that use the same layout as the student web
/// app: a large title with a back arrow, a gradient "hero" panel, filter pills
/// and cards. They sit inside the app chrome (top bar + bottom tab bar), so
/// none of them draws its own app bar.

/// Page heading: back arrow (only when there is a page to go back to), a large
/// start-aligned title, an optional subtitle beneath and an optional action at
/// the end.
class PageTitleBar extends StatelessWidget {
  const PageTitleBar({
    super.key,
    required this.title,
    this.subtitle,
    this.action,
  });

  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    // On menu and detail screens the app frame's single top bar shows the
    // title (and the action); only main screens draw the big heading here.
    final chrome = AppChromeScope.maybeOf(context);
    if (chrome != null && chrome.mode != ChromeBarMode.root) {
      return ChromeBarRegistrar(
        host: chrome.host,
        spec: ChromeBarSpec(
          title: title,
          subtitle: subtitle,
          actions: action == null ? const [] : [action!],
        ),
      );
    }
    final inFrame = chrome != null;

    final surfaces = aimSurfacesOf(context);
    final canPop = !inFrame && _canPop(context);
    final rtl = Directionality.of(context) == TextDirection.rtl;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            if (canPop)
              Padding(
                padding: const EdgeInsetsDirectional.only(end: 12),
                child: Material(
                  color: surfaces.surfaceSunken,
                  shape: const CircleBorder(),
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => context.pop(),
                    child: SizedBox(
                      width: 40,
                      height: 40,
                      child: Icon(
                        rtl
                            ? Icons.arrow_forward_rounded
                            : Icons.arrow_back_rounded,
                        size: 20,
                        color: surfaces.textPrimary,
                        semanticLabel: MaterialLocalizations.of(context)
                            .backButtonTooltip,
                      ),
                    ),
                  ),
                ),
              ),
            Expanded(
              child: Text(
                title,
                style: AimTextStyles.h1.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            if (action != null) ...[
              const SizedBox(width: 12),
              action!,
            ],
          ],
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Padding(
            padding: EdgeInsetsDirectional.only(start: canPop ? 52 : 0),
            child: Text(
              subtitle!,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ),
        ],
      ],
    );
  }

  static bool _canPop(BuildContext context) {
    try {
      return context.canPop();
    } catch (_) {
      return false;
    }
  }
}

/// The gradient summary panel at the top of a page.
class HeroPanel extends StatelessWidget {
  const HeroPanel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
      decoration: BoxDecoration(
        gradient: AimGradients.gzHero,
        borderRadius: BorderRadius.circular(AimRadius.lg),
      ),
      child: DefaultTextStyle.merge(
        style: const TextStyle(color: Colors.white),
        child: child,
      ),
    );
  }
}

/// One option of a [FilterPills] row.
class FilterPillOption<T> {
  const FilterPillOption(this.value, this.label);
  final T value;
  final String label;
}

/// A horizontally scrolling row of pill-shaped filters.
class FilterPills<T> extends StatelessWidget {
  const FilterPills({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
  });

  final List<FilterPillOption<T>> options;
  final T value;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final o in options)
            Padding(
              padding: const EdgeInsetsDirectional.only(end: 8),
              child: Semantics(
                button: true,
                selected: o.value == value,
                child: InkWell(
                  borderRadius: BorderRadius.circular(100),
                  onTap: () => onChanged(o.value),
                  child: Container(
                    padding: const EdgeInsetsDirectional.symmetric(
                      horizontal: 16,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: o.value == value
                          ? AimColors.primary500
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(
                        color: o.value == value
                            ? AimColors.primary500
                            : surfaces.border,
                      ),
                    ),
                    child: Text(
                      o.label,
                      style: AimTextStyles.bodySm.copyWith(
                        fontWeight: FontWeight.w600,
                        color: o.value == value
                            ? Colors.white
                            : surfaces.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// A small rounded status chip.
class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        label,
        style: AimTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
