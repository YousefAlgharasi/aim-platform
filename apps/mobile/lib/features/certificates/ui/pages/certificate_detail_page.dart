import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/models/certificate_model.dart';
import '../../logic/provider/certificates_provider.dart';
import '../widgets/certificate_painter.dart';

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
          title: context.tr('Certificate', 'الشهادة'),
          leading: IconButton(
            icon: Icon(
              isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
              size: AimSizes.iconSm,
            ),
            onPressed: () => context.pop(),
          ),
        ),
        body: SafeArea(top: false, child: Center(
          child: Text(
            l10n.commonError,
            style: AimTextStyles.bodyMd,
          ),
        )),
      );
    }

    final asyncCert = ref.watch(certificateDetailProvider(id));

    return Scaffold(
      appBar: AIMTopAppBar(
        title: context.tr('Certificate', 'الشهادة'),
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(top: false, child: asyncCert.when(
        data: (cert) => _CertificateDetailBody(certificate: cert),
        loading: () => AIMFullScreenLoading(
          semanticLabel: l10n.commonLoading,
        ),
        error: (err, _) => AIMFullScreenError(
          message: err.toString(),
          onRetry: () => ref.refresh(certificateDetailProvider(id)),
        ),
      )),
    );
  }
}

class _CertificateScaffold extends StatelessWidget {
  const _CertificateScaffold({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Scaffold(
      appBar: AIMTopAppBar(
        title: context.tr('Certificate', 'الشهادة'),
        leading: IconButton(
          icon: Icon(
            isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios,
            size: AimSizes.iconSm,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(top: false, child: _CertificateDetailBody(certificate: certificate)),
    );
  }
}

/// Certificate detail — the same layout as the web app: the certificate
/// picture, then the score breakdown and the assessments it was based on.
class _CertificateDetailBody extends StatelessWidget {
  const _CertificateDetailBody({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final rtl = context.isArabic;
    final locale = rtl ? 'ar' : 'en';
    final nf = NumberFormat.decimalPattern(locale);
    String fmt(num n) => nf.format(n);

    final issued = DateFormat.yMMMMd(locale).format(certificate.issuedAt);
    final b = certificate.breakdown;
    final pct = certificate.overallScorePercent ??
        b?.overallPercent ??
        (certificate.totalPoints != null
            ? (certificate.totalPoints! / 10).round()
            : null);
    final course = certificate.courseTitle.isEmpty
        ? context.tr('Course', 'الدورة')
        : certificate.courseTitle;

    // The mark is out of 100. Each part is shown on that same scale, so the
    // parts add up to the mark. Chapter exams are not part of it.
    double on100(int points) => points.round() / 10;
    final rows = <({String label, int points, int max, int percent, bool hasPercent})>[
      if (b != null && b.practiceMaxPoints > 0)
        (
          label: context.tr('Lesson practice', 'تدريبات الدروس'),
          points: b.practicePoints,
          max: b.practiceMaxPoints,
          percent: b.practiceAccuracyPercent,
          hasPercent: true,
        ),
      if (b != null && b.quizMaxPoints > 0)
        (
          label: context.tr('Chapter quizzes', 'اختبارات الفصول'),
          points: b.quizPoints,
          max: b.quizMaxPoints,
          percent: b.quizAveragePercent,
          hasPercent: true,
        ),
      if (b != null && b.finalExamMaxPoints > 0)
        (
          label: context.tr('Final exam', 'الامتحان النهائي'),
          points: b.finalExamPoints,
          max: b.finalExamMaxPoints,
          percent: b.finalExamPercent,
          hasPercent: true,
        ),
    ];

    final painter = CertificatePainter(
      studentName: certificate.studentName,
      courseTitle: course,
      scorePercent: pct,
      issuedText: issued,
      reference: certificate.id.length >= 8
          ? certificate.id.substring(0, 8).toUpperCase()
          : certificate.id.toUpperCase(),
      rtl: rtl,
      // A left-to-right isolate keeps "73 / 100" in that order in Arabic too.
      scoreText: pct == null ? null : '\u2066${fmt(pct)} / ${fmt(100)}\u2069',
      labels: CertificateLabels(
        brand: 'AIM English',
        title: context.tr('Certificate of completion', 'شهادة إتمام'),
        presentedTo: context.tr('This certificate is proudly presented to', 'تُمنح هذه الشهادة بكل فخر إلى'),
        forCompleting: context.tr('for successfully completing', 'لإتمامه بنجاح'),
        finalScore: context.tr('Final score', 'الدرجة النهائية'),
        issued: context.tr('Issued', 'تاريخ الإصدار'),
        reference: context.tr('Certificate ID', 'رقم الشهادة'),
      ),
    );

    return SingleChildScrollView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CertificateView(
            painter: painter,
            semanticLabel: fill(
              context.tr('Certificate of completion for {course}', 'شهادة إتمام دورة {course}'),
              {'course': course},
            ),
          ),
          if (rows.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              context.tr('Score breakdown', 'تفاصيل الدرجات'),
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMCard(
              child: Padding(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    for (final (i, r) in rows.indexed) ...[
                      if (i > 0) const SizedBox(height: AimSpacing.space16),
                      _BreakdownRow(
                        label: r.label,
                        trailing: fill(
                          context.tr('{pts} / {max} pts', '{pts} / {max} نقطة'),
                          {'pts': fmt(on100(r.points)), 'max': fmt(on100(r.max))},
                        ),
                        percentText: r.hasPercent ? ' · ${fmt(r.percent)}%' : '',
                        value: r.max > 0 ? (r.points / r.max).clamp(0.0, 1.0) : 0,
                      ),
                    ],
                    if (pct != null) ...[
                      const SizedBox(height: AimSpacing.space16),
                      Divider(height: 1, color: surfaces.divider),
                      const SizedBox(height: AimSpacing.space12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            context.tr('Your mark', 'درجتك'),
                            style: AimTextStyles.bodyLg.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            '\u2066${fmt(pct)} / ${fmt(100)}\u2069',
                            style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
          if (certificate.scoreSnapshot.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              context.tr('Assessments', 'التقييمات'),
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMCard(
              child: Padding(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                child: Column(
                  children: [
                    for (final (i, s) in certificate.scoreSnapshot.indexed) ...[
                      if (i > 0) const SizedBox(height: AimSpacing.space16),
                      _AssessmentRow(entry: s),
                    ],
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: AimSpacing.space24),
        ],
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  const _BreakdownRow({
    required this.label,
    required this.trailing,
    required this.percentText,
    required this.value,
  });

  final String label;
  final String trailing;
  final String percentText;
  final double value;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                label,
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space8),
            Text(
              '$trailing$percentText',
              style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 8,
            color: AimColors.primary500,
            backgroundColor: surfaces.surfaceSunken,
          ),
        ),
      ],
    );
  }
}

class _AssessmentRow extends StatelessWidget {
  const _AssessmentRow({required this.entry});

  final CertificateScoreEntryModel entry;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final kind = entry.isFinalExam
        ? context.tr('Final exam', 'الامتحان النهائي')
        : entry.type == 'exam'
            ? context.tr('Exam', 'امتحان')
            : context.tr('Quiz', 'اختبار قصير');
    final tone = entry.passed ? AimColors.success500 : AimColors.error500;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                entry.title,
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                '$kind · ${entry.score} / ${entry.maxScore}',
                style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(width: AimSpacing.space8),
        Container(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: tone.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(100),
          ),
          child: Text(
            '${entry.scorePercent}% · ${entry.passed ? context.tr('Passed', 'ناجح') : context.tr('Not passed', 'غير ناجح')}',
            style: AimTextStyles.caption.copyWith(color: tone, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}
