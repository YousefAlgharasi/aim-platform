import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/entity/auth_flow_status.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';

/// Splash / auth-check placeholder screen.
///
/// Shown while [authFlowProvider] is in the [AuthFlowStatus.checking] state.
/// Displays a loading indicator and transitions automatically once auth
/// resolves via [AppRouter.resolveRouteName].
class SplashPlaceholderPage extends ConsumerWidget {
  const SplashPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(AimSpacing.screenPaddingMobile),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.school_outlined,
                  size: AimSizes.iconLg * 3,
                  color: AimColors.primary500,
                ),
                SizedBox(height: AimSpacing.sectionGap),
                Text(
                  'AIM',
                  style: AimTextStyles.h1.copyWith(
                    color: surfaces.textPrimary,
                    letterSpacing: 2,
                  ),
                ),
                SizedBox(height: AimSpacing.componentGap),
                Text(
                  'Auth state: ${authState.status.name}',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textMuted,
                  ),
                ),
                SizedBox(height: AimSpacing.sectionGap),
                AIMButton(
                  onPressed: () {
                    ref.read(authFlowProvider.notifier).completeBootstrap();
                    Navigator.of(context).pushNamed(AppRoutePaths.signIn);
                  },
                  variant: AIMButtonVariant.outline,
                  child: const Text('Start auth placeholder flow'),
                ),
                SizedBox(height: AimSpacing.componentGap),
                AIMButton(
                  onPressed: authState.status == AuthFlowStatus.signedIn
                      ? () => Navigator.of(context)
                          .pushNamed(AppRoutePaths.mainShell)
                      : null,
                  variant: AIMButtonVariant.ghost,
                  child: const Text('Open main shell'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
