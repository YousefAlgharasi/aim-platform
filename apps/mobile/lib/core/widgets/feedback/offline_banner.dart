// OfflineBanner — slim bar at the top of every screen while offline.
//
// Wraps the whole app (MaterialApp.router builder). When [NetworkStatus]
// reports offline it shows "You're offline…" — or "…showing saved content"
// once a screen has been filled from the offline cache — above the app, and
// takes over the status-bar inset so screens below don't double it.

import 'package:flutter/material.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../networking/network_status.dart';
import '../../theme/theme.dart';

class OfflineBanner extends StatelessWidget {
  const OfflineBanner({required this.child, this.networkStatus, super.key});

  final Widget child;

  /// Defaults to [NetworkStatus.instance]. Injectable for tests.
  final NetworkStatus? networkStatus;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<NetworkStatusValue>(
      valueListenable: networkStatus ?? NetworkStatus.instance,
      builder: (context, status, _) {
        if (!status.offline) return child;

        final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);
        final text = status.showingSavedData
            ? (l10n?.offlineBannerSavedData ?? "You're offline. Showing saved content.")
            : (l10n?.offlineBanner ?? "You're offline. Check your internet connection.");
        final topInset = MediaQuery.paddingOf(context).top;

        return Column(
          children: [
            Material(
              color: AimColors.neutral800,
              child: Semantics(
                liveRegion: true,
                child: Padding(
                  padding: EdgeInsetsDirectional.only(
                    top: topInset + AimSpacing.space4,
                    bottom: AimSpacing.space4,
                    start: AimSpacing.space16,
                    end: AimSpacing.space16,
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.wifi_off_rounded,
                          size: 16, color: AimColors.neutral0),
                      const SizedBox(width: AimSpacing.space8),
                      Expanded(
                        child: Text(
                          text,
                          style: AimTextStyles.bodySm.copyWith(
                            color: AimColors.neutral0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                child: child,
              ),
            ),
          ],
        );
      },
    );
  }
}
