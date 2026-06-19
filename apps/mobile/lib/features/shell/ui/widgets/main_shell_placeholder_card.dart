import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';

/// Placeholder card used by stub tab screens inside [MainShellPage].
///
/// Renders a centred [AIMCard] with a [title] and [description] to indicate
/// that a screen is not yet implemented. Replace with the real screen widget
/// when the corresponding feature task is executed.
class MainShellPlaceholderCard extends StatelessWidget {
  const MainShellPlaceholderCard({
    required this.title,
    required this.description,
    super.key,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.sectionGap),
        child: AIMCard(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.componentGap),
              Text(
                description,
                style:
                    AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
