import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/models/certificate_model.dart';
import '../../logic/provider/certificates_provider.dart';

class CertificateDetailPage extends ConsumerWidget {
  const CertificateDetailPage({
    super.key,
    this.initialCertificate,
    this.certificateId,
  });

  final CertificateModel? initialCertificate;
  final String? certificateId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    if (initialCertificate != null) {
      return _CertificateScaffold(certificate: initialCertificate!);
    }

    final id = certificateId;
    if (id == null || id.isEmpty) {
      return Scaffold(
        appBar: AIMTopAppBar(
          title: l10n.certificateDetailTitle,
          leading: IconButton(
            icon: Icon(
              isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
              size: AimSizes.iconSm,
            ),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Text(
            l10n.commonError,
            style: AimTextStyles.bodyMd,
          ),
        ),
      );
    }

    final asyncCert = ref.watch(certificateDetailProvider(id));

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.certificateDetailTitle,
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: asyncCert.when(
        data: (cert) => _CertificateDetailBody(certificate: cert),
        loading: () => AIMFullScreenLoading(
          semanticLabel: l10n.commonLoading,
        ),
        error: (err, _) => AIMFullScreenError(
          message: err.toString(),
          onRetry: () => ref.refresh(certificateDetailProvider(id)),
        ),
      ),
    );
  }
}

class _CertificateScaffold extends StatelessWidget {
  const _CertificateScaffold({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.certificateDetailTitle,
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: _CertificateDetailBody(certificate: certificate),
    );
  }
}

class _CertificateDetailBody extends StatelessWidget {
  const _CertificateDetailBody({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final formattedDate =
        DateFormat.yMMMMd(isRtl ? 'ar' : 'en').format(certificate.issuedAt);

    final breakdown = certificate.breakdown;
    final totalPts = certificate.totalPoints ??
        breakdown?.totalPoints ??
        (certificate.overallScorePercent != null
            ? certificate.overallScorePercent! * 10
            : 0);

    final gradePercent = certificate.overallScorePercent ??
        breakdown?.overallPercent ??
        (totalPts / 10).round();

    return SingleChildScrollView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Certificate parchment card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(
                color: const Color(0xFFD97706).withValues(alpha: 0.5),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsetsDirectional.all(AimSpacing.space24),
            child: Column(
              children: [
                // Top Golden Seal
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFFFBBF24), Color(0xFFD97706)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.verified_rounded,
                      color: Colors.white,
                      size: 38,
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.space16),

                // Eyebrow
                Text(
                  l10n.certificateEyebrow,
                  style: AimTextStyles.caption.copyWith(
                    color: const Color(0xFFB45309),
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space8),

                // Main Heading
                Text(
                  'AIM Language Platform',
                  style: AimTextStyles.h2.copyWith(
                    color: const Color(0xFF1E293B),
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space16),

                const Divider(color: Color(0xFFE2E8F0)),
                const SizedBox(height: AimSpacing.space16),

                // Student statement
                Text(
                  l10n.certificateCertifiesThat,
                  style: AimTextStyles.bodySm.copyWith(
                    color: const Color(0xFF64748B),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space8),

                // Student Name
                Text(
                  certificate.studentName ?? 'Student',
                  style: AimTextStyles.h2.copyWith(
                    color: const Color(0xFF0F172A),
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space8),

                // Completion statement
                Text(
                  l10n.certificateHasCompleted,
                  style: AimTextStyles.bodySm.copyWith(
                    color: const Color(0xFF64748B),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space8),

                // Course title
                Text(
                  certificate.courseTitle,
                  style: AimTextStyles.h3.copyWith(
                    color: const Color(0xFF1E293B),
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space8),

                // Date
                Text(
                  l10n.certificatesIssuedOn(formattedDate),
                  style: AimTextStyles.caption.copyWith(
                    color: const Color(0xFF94A3B8),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: AimSpacing.space24),

          // 1,000-Point System Evaluation Card
          AIMCard(
            child: Padding(
              padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.analytics_outlined,
                        color: Color(0xFF4F46E5),
                        size: 20,
                      ),
                      const SizedBox(width: AimSpacing.space8),
                      Expanded(
                        child: Text(
                          l10n.certificateCourseEvaluation,
                          style: AimTextStyles.title.copyWith(
                            color: surfaces.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.space16),

                  if (breakdown != null) ...[
                    _BreakdownItemRow(
                      label: l10n.certificatePractices,
                      weight: '20%',
                      points: '${breakdown.practicePoints} / 200 pts',
                      detail:
                          '${breakdown.practiceAccuracyPercent}% ${l10n.certificateAccuracy}',
                    ),
                    const Divider(height: AimSpacing.space16),
                    _BreakdownItemRow(
                      label: l10n.certificateQuizzes,
                      weight: '20%',
                      points: '${breakdown.quizPoints} / 200 pts',
                      detail:
                          '${breakdown.quizAveragePercent}% ${l10n.certificateAverage}',
                    ),
                    const Divider(height: AimSpacing.space16),
                    _BreakdownItemRow(
                      label: l10n.certificateChapterExams,
                      weight: '20%',
                      points: '${breakdown.chapterExamPoints} / 200 pts',
                      detail:
                          '${breakdown.chapterExamAveragePercent}% ${l10n.certificateAverage}',
                    ),
                    const Divider(height: AimSpacing.space16),
                    _BreakdownItemRow(
                      label: l10n.certificateFinalExam,
                      weight: '40%',
                      points: '${breakdown.finalExamPoints} / 400 pts',
                      detail: '${breakdown.finalExamPercent}%',
                    ),
                    const SizedBox(height: AimSpacing.space16),
                  ],

                  // Grand Total Banner
                  Container(
                    padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFEEF2FF), Color(0xFFE0E7FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(AimRadius.md),
                      border: Border.all(color: const Color(0xFFC7D2FE)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.certificateTotalScoreLabel,
                              style: AimTextStyles.caption.copyWith(
                                color: const Color(0xFF4338CA),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: AimSpacing.space4),
                            Text(
                              '$totalPts / 1000 pts',
                              style: AimTextStyles.h3.copyWith(
                                color: const Color(0xFF1E1B4B),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              l10n.certificateFinalGradeLabel,
                              style: AimTextStyles.caption.copyWith(
                                color: const Color(0xFF047857),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: AimSpacing.space4),
                            Text(
                              '$gradePercent%',
                              style: AimTextStyles.h2.copyWith(
                                color: const Color(0xFF065F46),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: AimSpacing.space16),

          // Verification Link Button
          if (certificate.verificationUrl != null &&
              certificate.verificationUrl!.isNotEmpty) ...[
            AIMButton(
              variant: AIMButtonVariant.secondary,
              leadingIcon: const Icon(Icons.link_rounded),
              onPressed: () {
                Clipboard.setData(
                  ClipboardData(text: certificate.verificationUrl!),
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(l10n.certificateCopiedToast),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              child: Text(l10n.certificateCopyVerification),
            ),
            const SizedBox(height: AimSpacing.space12),
          ],

          // Footer
          Center(
            child: Text(
              l10n.certificateIdLabel(certificate.id),
              style: AimTextStyles.caption.copyWith(
                color: surfaces.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: AimSpacing.space24),
        ],
      ),
    );
  }
}

class _BreakdownItemRow extends StatelessWidget {
  const _BreakdownItemRow({
    required this.label,
    required this.weight,
    required this.points,
    required this.detail,
  });

  final String label;
  final String weight;
  final String points;
  final String detail;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      label,
                      style: AimTextStyles.bodyMd.copyWith(
                        fontWeight: FontWeight.w600,
                        color: surfaces.textPrimary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: AimSpacing.space8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: surfaces.surfaceSunken,
                      borderRadius: BorderRadius.circular(AimRadius.sm),
                    ),
                    child: Text(
                      weight,
                      style: AimTextStyles.caption.copyWith(
                        color: surfaces.textMuted,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                detail,
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
            ],
          ),
        ),
        Text(
          points,
          style: AimTextStyles.bodyMd.copyWith(
            fontWeight: FontWeight.bold,
            color: surfaces.textPrimary,
          ),
        ),
      ],
    );
  }
}
