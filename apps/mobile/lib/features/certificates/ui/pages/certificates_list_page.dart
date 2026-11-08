import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/localization/inline_tr.dart';
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
        title: context.tr('Certificates', 'الشهادات'),
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(top: false, child: switch (state) {
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
      }),
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final locale = context.isArabic ? 'ar' : 'en';
    final nf = NumberFormat.decimalPattern(locale);
    final issued = DateFormat.yMMMMd(locale).format(certificate.issuedAt);

    final pts = certificate.totalPoints ?? certificate.breakdown?.totalPoints;
    final pct = certificate.overallScorePercent ??
        certificate.breakdown?.overallPercent ??
        (pts != null ? (pts / 10).round() : null);

    return AIMCard(
      onTap: () => context.push(AppRoutePaths.certificateDetail, extra: certificate),
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.tr('Certificate of completion', 'شهادة إتمام'),
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.primary500,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    certificate.courseTitle.isEmpty
                        ? context.tr('Course', 'الدورة')
                        : certificate.courseTitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.bodyLg.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    fill(context.tr('Issued {date}', 'صدرت {date}'), {'date': issued}),
                    style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                  ),
                ],
              ),
            ),
            if (pct != null) ...[
              const SizedBox(width: AimSpacing.space12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AimColors.success500.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      '${nf.format(pct)}%',
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.success500,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (pts != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      '\u2066${nf.format(pts)} / ${nf.format(1000)}\u2069',
                      style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                    ),
                  ],
                ],
              ),
            ],
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
              context.tr('No certificates yet', 'لا شهادات بعد'),
              style: AimTextStyles.h3.copyWith(
                color: surfaces.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              context.tr('Complete a course and pass its final exam to earn your first certificate.', 'أكمل دورة واجتز امتحانها النهائي لتحصل على أول شهادة.'),
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space24),
            AIMButton(
              onPressed: onExplore,
              child: Text(context.tr('Courses', 'الدورات')),
            ),
          ],
        ),
      ),
    );
  }
}
