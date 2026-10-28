import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/core/theme/aim_theme_extensions.dart';
import 'package:aim_mobile/core/widgets/buttons/aim_button.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../logic/app_update_controller.dart';
import '../logic/app_update_provider.dart';

/// Wraps the whole app (via `MaterialApp.router(builder: ...)`) and checks
/// for updates at launch and whenever the app returns to the foreground.
///
/// - Update required → blocking screen over the app (the app underneath stays
///   mounted so nothing is lost if the policy is relaxed again).
/// - Update available → dismissible banner.
/// - Play update downloaded (Android) → snackbar offering a restart.
class AppUpdateGate extends ConsumerStatefulWidget {
  const AppUpdateGate({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<AppUpdateGate> createState() => _AppUpdateGateState();
}

class _AppUpdateGateState extends ConsumerState<AppUpdateGate>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _check());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _check();
  }

  void _check() {
    if (!mounted) return;
    ref.read(appUpdateControllerProvider.notifier).check();
  }

  void _onStateChanged(AppUpdateState? previous, AppUpdateState next) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;
    final l10n = AppLocalizations.of(context);
    final controller = ref.read(appUpdateControllerProvider.notifier);

    final wasShowingBanner = previous?.showOptionalBanner ?? false;
    if (next.showOptionalBanner && !wasShowingBanner) {
      messenger.showMaterialBanner(
        MaterialBanner(
          content: Text(l10n.appUpdateAvailableMessage),
          leading: const Icon(Icons.system_update_outlined),
          actions: [
            TextButton(
              onPressed: () {
                messenger.hideCurrentMaterialBanner();
                controller.dismissBanner();
              },
              child: Text(l10n.appUpdateLater),
            ),
            TextButton(
              onPressed: () {
                messenger.hideCurrentMaterialBanner();
                controller.openUpdate();
              },
              child: Text(l10n.appUpdateAction),
            ),
          ],
        ),
      );
    } else if (!next.showOptionalBanner && wasShowingBanner) {
      messenger.hideCurrentMaterialBanner();
    }

    final wasReady = previous?.flexibleUpdateReady ?? false;
    if (next.flexibleUpdateReady && !wasReady) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(l10n.appUpdateDownloadedMessage),
          duration: const Duration(days: 1),
          action: SnackBarAction(
            label: l10n.appUpdateRestart,
            onPressed: controller.completeFlexibleUpdate,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AppUpdateState>(appUpdateControllerProvider, _onStateChanged);
    final requirement = ref.watch(
      appUpdateControllerProvider.select((s) => s.requirement),
    );

    return Stack(
      children: [
        widget.child,
        if (requirement == AppUpdateRequirement.required)
          const Positioned.fill(child: _UpdateRequiredScreen()),
      ],
    );
  }
}

class _UpdateRequiredScreen extends ConsumerWidget {
  const _UpdateRequiredScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final theme = Theme.of(context);

    return Material(
      color: theme.scaffoldBackgroundColor,
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space24,
              vertical: AimSpacing.space32,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.system_update_outlined,
                  size: AimSpacing.space64,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(height: AimSpacing.space24),
                Text(
                  l10n.appUpdateRequiredTitle,
                  textAlign: TextAlign.center,
                  style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space12),
                Text(
                  l10n.appUpdateRequiredMessage,
                  textAlign: TextAlign.center,
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textSecondary),
                ),
                const SizedBox(height: AimSpacing.space32),
                AIMButton(
                  fullWidth: true,
                  onPressed: () => ref
                      .read(appUpdateControllerProvider.notifier)
                      .openUpdate(),
                  child: Text(l10n.appUpdateNow),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
