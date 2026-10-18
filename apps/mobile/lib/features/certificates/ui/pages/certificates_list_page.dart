import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/certificate_model.dart';
import '../../logic/provider/certificates_provider.dart';

class CertificatesListPage extends ConsumerStatefulWidget {
  const CertificatesListPage({super.key});

  @override
  ConsumerState<CertificatesListPage> createState() =>
      _CertificatesListPageState();
}

class _CertificatesListPageState extends ConsumerState<CertificatesListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token != null && token.isNotEmpty) {
      ref.read(certificatesListProvider.notifier).load(bearerToken: token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(certificatesListProvider);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.certificatesTitle,
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.commonLoading,
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) when data.isEmpty => _EmptyCertificatesView(
            onExplore: () => context.go(AppRoutePaths.learn),
          ),
        AppAsyncSuccess(:final data) => RefreshIndicator(
            onRefresh: () async {
              final token = ref.read(authFlowProvider).accessToken;
              if (token != null) {
                await ref
                    .read(certificatesListProvider.notifier)
                    .refresh(bearerToken: token);
              }
            },
            child: ListView.separated(
              padding: const EdgeInsetsDirectional.all(
                AimSpacing.screenPaddingMobile,
              ),
              itemCount: data.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AimSpacing.componentGap),
              itemBuilder: (context, index) {
                final cert = data[index];
                return _CertificateCard(certificate: cert);
              },
            ),
          ),
        _ => const SizedBox.shrink(),
      },
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final formattedDate =
        DateFormat.yMMMMd(isRtl ? 'ar' : 'en').format(certificate.issuedAt);

    final totalPts = certificate.totalPoints ??
        certificate.breakdown?.totalPoints ??
        (certificate.overallScorePercent != null
            ? certificate.overallScorePercent! * 10
            : 0);

    final gradePercent = certificate.overallScorePercent ??
        certificate.breakdown?.overallPercent ??
        (totalPts / 10).round();

    return AIMCard(
      onTap: () {
        context.push(
          AppRoutePaths.certificateDetail,
          extra: certificate,
        );
      },
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Medal / Award Icon
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(AimRadius.lg),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.workspace_premium_rounded,
                    color: Colors.white,
                    size: 30,
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.certificateEyebrow,
                        style: AimTextStyles.caption.copyWith(
                          color: const Color(0xFFB45309),
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        certificate.courseTitle,
                        style: AimTextStyles.h3.copyWith(
                          color: surfaces.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        l10n.certificatesIssuedOn(formattedDate),
                        style: AimTextStyles.caption.copyWith(
                          color: surfaces.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space16),
            const Divider(height: 1),
            const SizedBox(height: AimSpacing.space12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // 1,000-Point System Summary
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.certificateTotalScoreLabel,
                      style: AimTextStyles.caption.copyWith(
                        color: surfaces.textMuted,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space2),
                    Text(
                      '$totalPts / 1000 pts',
                      style: AimTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.bold,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ],
                ),
                // Final Grade
                Container(
                  padding: const EdgeInsetsDirectional.symmetric(
                    horizontal: AimSpacing.space12,
                    vertical: AimSpacing.space4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(AimRadius.full),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 16,
                        color: Color(0xFF059669),
                      ),
                      const SizedBox(width: AimSpacing.space4),
                      Text(
                        l10n.certificatesGrade(gradePercent),
                        style: AimTextStyles.caption.copyWith(
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF065F46),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyCertificatesView extends StatelessWidget {
  const _EmptyCertificatesView({required this.onExplore});

  final VoidCallback onExplore;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.card_membership_rounded,
                size: 48,
                color: surfaces.textMuted,
              ),
            ),
            const SizedBox(height: AimSpacing.space24),
            Text(
              l10n.certificatesEmptyTitle,
              style: AimTextStyles.h3.copyWith(
                color: surfaces.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              l10n.certificatesEmptyDescription,
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space24),
            AIMButton(
              onPressed: onExplore,
              child: Text(l10n.commonStart),
            ),
          ],
        ),
      ),
    );
  }
}
