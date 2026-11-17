import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/state/app_async_state.dart';
import '../../../core/widgets/widgets.dart';
import '../../auth/logic/provider/auth_context_provider.dart';
import '../../shell/logic/main_shell_tab_provider.dart';
import '../data/tour_definitions.dart';
import '../logic/guided_tour_provider.dart';

/// Top-bar "?" that starts the tour for the current screen. Only shown on
/// screens that have one; a dot marks a tour not yet taken (same as web).
class TourHelpButton extends ConsumerWidget {
  const TourHelpButton({super.key, required this.location});

  final String location;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tourId = tourIdForScreen(
      location: location,
      mainTab: ref.watch(mainShellTabIndexProvider),
    );
    final userId = switch (ref.watch(authContextProvider)) {
      AppAsyncSuccess(:final data) => data.user.id,
      _ => null,
    };
    if (tourId == null || userId == null) return const SizedBox.shrink();

    final state = ref.watch(guidedTourProvider(userId));
    final unseen = state.loaded && state.canRemember && !state.isSeen(tourId);
    final surfaces = aimSurfacesOf(context);
    final label = TourStrings.help.of(context.isArabic);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          visualDensity: VisualDensity.compact,
          tooltip: label,
          icon: Icon(Icons.help_outline_rounded,
              size: 24, color: surfaces.textPrimary),
          onPressed: () =>
              ref.read(guidedTourProvider(userId).notifier).start(tourId),
        ),
        if (unseen)
          PositionedDirectional(
            top: 7,
            end: 8,
            child: IgnorePointer(
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: AimColors.primary500,
                  shape: BoxShape.circle,
                  border: Border.all(color: surfaces.background, width: 2),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
