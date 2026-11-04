import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../widgets/widgets.dart';
import 'locale_provider.dart';

/// Compact AR/EN toggle for auth screens.
class AimLanguageSwitcher extends ConsumerWidget {
  const AimLanguageSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isArabic = ref.watch(localeProvider).languageCode == 'ar';
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      button: true,
      label: isArabic ? 'English' : 'العربية',
      child: Material(
        color: surfaces.surfaceRaised,
        shape: RoundedRectangleBorder(
          borderRadius: AimRadius.borderPill,
          side: BorderSide(color: surfaces.border),
        ),
        child: InkWell(
          customBorder: const RoundedRectangleBorder(
            borderRadius: AimRadius.borderPill,
          ),
          onTap: () => ref
              .read(localeProvider.notifier)
              .setLocale(Locale(isArabic ? 'en' : 'ar')),
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space12,
              vertical: AimSpacing.space8,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.language_rounded,
                  size: 16,
                  color: AimColors.primary500,
                ),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  isArabic ? 'English' : 'العربية',
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.primary500,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
