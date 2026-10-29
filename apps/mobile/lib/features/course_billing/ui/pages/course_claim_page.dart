// CourseClaimPage — "Get this course" for paid courses.
//
// Shows the backend price (with any discount), the time rule (N days to
// finish after approval, otherwise fail and pay again), and the student's
// current state (pending / rejected / failed / active). To pay, the student
// picks a wallet, transfers to the number or QR shown, then submits the
// transaction number and a receipt screenshot. An admin confirms it in the
// dashboard, which unlocks the course.


import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../data/course_billing_models.dart';
import '../../logic/course_billing_providers.dart';
import '../widgets/billing_format.dart';

const _maxReceiptBytes = 5 * 1024 * 1024;

class CourseClaimPage extends ConsumerWidget {
  const CourseClaimPage({required this.courseId, required this.courseTitle, super.key});

  final String courseId;
  final String courseTitle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final billing = ref.watch(courseBillingProvider(courseId));

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.billingGetCourseTitle,
        onBack: () => context.canPop() ? context.pop() : context.go(AppRoutePaths.mainShell),
      ),
      body: SafeArea(
        top: false,
        child: billing.when(
          loading: () => const AIMFullScreenLoading(),
          error: (e, _) => AIMFullScreenError(
            message: e is ApiClientException ? e.message : '$e',
            onRetry: () => ref.invalidate(courseBillingProvider(courseId)),
          ),
          data: (data) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(courseBillingProvider(courseId)),
            child: _ClaimContent(courseId: courseId, courseTitle: courseTitle, billing: data),
          ),
        ),
      ),
    );
  }
}

class _ClaimContent extends StatelessWidget {
  const _ClaimContent({required this.courseId, required this.courseTitle, required this.billing});

  final String courseId;
  final String courseTitle;
  final CourseBilling billing;

  void _openCourse(BuildContext context) {
    context.pushReplacement(
      AppRoutePaths.courseChapters,
      extra: {'courseId': courseId, 'courseTitle': courseTitle},
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final access = billing.access;
    final canPay = access.status == CourseAccessStatus.none ||
        access.status == CourseAccessStatus.rejected ||
        access.status == CourseAccessStatus.failed;

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space16,
      ),
      children: [
        _PriceCard(title: courseTitle, price: billing.price),
        const SizedBox(height: AimSpacing.componentGap),
        if (!billing.price.isFree && access.status != CourseAccessStatus.completed) ...[
          _InfoBanner(
            icon: Icons.timer_outlined,
            color: AimColors.primary500,
            text: l10n.billingTimeRule(billing.price.accessDays),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        switch (access.status) {
          CourseAccessStatus.active => _StatusCard(
              icon: Icons.lock_open_rounded,
              color: AimColors.success500,
              title: l10n.billingActiveTitle,
              body: [
                l10n.billingDaysLeft(access.daysLeft ?? 0),
                if (access.expiresAt != null) l10n.billingFinishBy(formatBillingDate(context, access.expiresAt!)),
              ].join(' · '),
              action: l10n.billingOpenCourse,
              onAction: () => _openCourse(context),
            ),
          CourseAccessStatus.completed => _StatusCard(
              icon: Icons.emoji_events_outlined,
              color: AimColors.success500,
              title: l10n.billingCompletedTitle,
              action: l10n.billingOpenCourse,
              onAction: () => _openCourse(context),
            ),
          CourseAccessStatus.free => _StatusCard(
              icon: Icons.check_circle_outline,
              color: AimColors.success500,
              title: l10n.billingFree,
              action: l10n.billingOpenCourse,
              onAction: () => _openCourse(context),
            ),
          CourseAccessStatus.pending => _StatusCard(
              icon: Icons.hourglass_top_rounded,
              color: AimColors.warning500,
              title: l10n.billingPendingTitle,
              body: l10n.billingPendingBody,
            ),
          CourseAccessStatus.rejected => _StatusCard(
              icon: Icons.error_outline,
              color: AimColors.error500,
              title: l10n.billingRejectedTitle,
              body: [
                if (access.rejectionNote != null) l10n.billingAdminNote(access.rejectionNote!),
                l10n.billingRejectedBody,
              ].join('\n'),
            ),
          CourseAccessStatus.failed => _StatusCard(
              icon: Icons.timer_off_outlined,
              color: AimColors.error500,
              title: l10n.billingFailedTitle,
              body: l10n.billingFailedBody,
            ),
          CourseAccessStatus.none => const SizedBox.shrink(),
        },
        if (canPay) ...[
          const SizedBox(height: AimSpacing.componentGap),
          _PaymentForm(courseId: courseId, price: billing.price),
        ],
        const SizedBox(height: AimSpacing.sectionGap),
        Center(
          child: TextButton.icon(
            onPressed: () => context.push(AppRoutePaths.myCoursePayments),
            icon: const Icon(Icons.receipt_long_outlined),
            label: Text(l10n.billingMyPayments),
          ),
        ),
      ],
    );
  }
}

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.title, required this.price});

  final String title;
  final CoursePriceQuote price;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      variant: AIMCardVariant.elevated,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary)),
          const SizedBox(height: AimSpacing.space8),
          if (price.isFree)
            Text(l10n.billingFree, style: AimTextStyles.h2.copyWith(color: AimColors.success500))
          else
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.end,
              spacing: AimSpacing.space8,
              children: [
                Text(
                  formatCurrencyAmount(context, price.amount, price.currency),
                  style: AimTextStyles.h2.copyWith(color: AimColors.primary600),
                ),
                if (price.discountActive)
                  Text(
                    formatCurrencyAmount(context, price.originalAmount, price.currency),
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
              ],
            ),
          if (price.discountActive && price.discountEndsAt != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              l10n.billingOfferEnds(formatBillingDate(context, price.discountEndsAt!)),
              style: AimTextStyles.bodySm.copyWith(color: AimColors.warning600),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.icon, required this.color, required this.text});

  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AimSpacing.space12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: AimRadius.borderMd,
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: AimSizes.iconMd),
          const SizedBox(width: AimSpacing.space12),
          Expanded(
            child: Text(text, style: AimTextStyles.bodySm.copyWith(color: aimSurfacesOf(context).textPrimary)),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({
    required this.icon,
    required this.color,
    required this.title,
    this.body,
    this.action,
    this.onAction,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String? body;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: AimRadius.borderLg,
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(icon, color: color),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(title, style: AimTextStyles.title.copyWith(color: surfaces.textPrimary)),
              ),
            ],
          ),
          if (body != null && body!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(body!, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary)),
          ],
          if (action != null) ...[
            const SizedBox(height: AimSpacing.space12),
            AIMButton(fullWidth: true, onPressed: onAction, child: Text(action!)),
          ],
        ],
      ),
    );
  }
}

class _PaymentForm extends ConsumerStatefulWidget {
  const _PaymentForm({required this.courseId, required this.price});

  final String courseId;
  final CoursePriceQuote price;

  @override
  ConsumerState<_PaymentForm> createState() => _PaymentFormState();
}

class _PaymentFormState extends ConsumerState<_PaymentForm> {
  final _transactionController = TextEditingController();
  PaymentWallet? _wallet;
  Uint8List? _receipt;
  String _receiptName = 'receipt.jpg';
  String? _receiptMime;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _transactionController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _transactionController.dispose();
    super.dispose();
  }

  bool get _ready =>
      _wallet != null && _transactionController.text.trim().isNotEmpty && _receipt != null && !_submitting;

  Future<void> _pickReceipt() async {
    final l10n = AppLocalizations.of(context);
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 2000,
      maxHeight: 2000,
      imageQuality: 85,
    );
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (!mounted) return;
    if (bytes.length > _maxReceiptBytes) {
      setState(() => _error = l10n.billingReceiptTooLarge);
      return;
    }
    final lower = file.name.toLowerCase();
    setState(() {
      _receipt = bytes;
      _receiptName = file.name;
      _receiptMime = lower.endsWith('.png')
          ? 'image/png'
          : lower.endsWith('.webp')
              ? 'image/webp'
              : 'image/jpeg';
      _error = null;
    });
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context);
    final wallet = _wallet;
    final receipt = _receipt;
    if (wallet == null || receipt == null) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ref.read(courseBillingDatasourceProvider).submitPayment(
            courseId: widget.courseId,
            walletId: wallet.id,
            transactionNumber: _transactionController.text.trim(),
            receiptBytes: receipt,
            receiptFileName: _receiptName,
            receiptMimeType: _receiptMime,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.billingSubmitted)));
      ref.invalidate(courseBillingProvider(widget.courseId));
      ref.invalidate(myCoursePaymentsProvider);
      final token = ref.read(authFlowProvider).accessToken;
      if (token != null && token.isNotEmpty) {
        ref.read(studentCoursesProvider.notifier).refresh(bearerToken: token);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiClientException ? e.message : '$e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final wallets = ref.watch(paymentWalletsProvider);
    final datasource = ref.watch(courseBillingDatasourceProvider);

    return wallets.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(AimSpacing.space24),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => _InfoBanner(
        icon: Icons.error_outline,
        color: AimColors.error500,
        text: e is ApiClientException ? e.message : '$e',
      ),
      data: (list) {
        if (list.isEmpty) {
          return _InfoBanner(icon: Icons.info_outline, color: AimColors.warning500, text: l10n.billingNoWallets);
        }
        final selected = _wallet == null ? null : list.where((w) => w.id == _wallet!.id).firstOrNull;
        return AIMCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _StepTitle(l10n.billingStepWallet),
              DropdownButtonFormField<String>(
                initialValue: selected?.id,
                isExpanded: true,
                hint: Text(l10n.billingWalletHint),
                decoration: const InputDecoration(border: OutlineInputBorder()),
                items: [
                  for (final w in list)
                    DropdownMenuItem(
                      value: w.id,
                      child: Row(
                        children: [
                          _WalletLogo(url: w.logoPath == null ? null : datasource.resolve(w.logoPath!).toString()),
                          const SizedBox(width: AimSpacing.space12),
                          Expanded(child: Text(w.name, overflow: TextOverflow.ellipsis)),
                        ],
                      ),
                    ),
                ],
                onChanged: _submitting
                    ? null
                    : (id) => setState(() => _wallet = list.firstWhere((w) => w.id == id)),
              ),
              if (selected != null) ...[
                const SizedBox(height: AimSpacing.space12),
                _WalletDetails(
                  wallet: selected,
                  amount: formatCurrencyAmount(context, widget.price.amount, widget.price.currency),
                  qrUrl: selected.qrImagePath == null ? null : datasource.resolve(selected.qrImagePath!).toString(),
                ),
              ],
              const SizedBox(height: AimSpacing.space16),
              _StepTitle(l10n.billingStepTransaction),
              TextField(
                controller: _transactionController,
                enabled: !_submitting,
                maxLength: 100,
                textInputAction: TextInputAction.done,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  hintText: l10n.billingTransactionHint,
                  counterText: '',
                ),
              ),
              const SizedBox(height: AimSpacing.space16),
              _StepTitle(l10n.billingStepReceipt),
              if (_receipt != null) ...[
                ClipRRect(
                  borderRadius: AimRadius.borderMd,
                  child: Image.memory(_receipt!, height: 200, fit: BoxFit.contain),
                ),
                const SizedBox(height: AimSpacing.space8),
              ],
              OutlinedButton.icon(
                onPressed: _submitting ? null : _pickReceipt,
                icon: const Icon(Icons.photo_library_outlined),
                label: Text(_receipt == null ? l10n.billingPickReceipt : l10n.billingChangeReceipt),
              ),
              if (_error != null) ...[
                const SizedBox(height: AimSpacing.space12),
                Text(_error!, style: AimTextStyles.bodySm.copyWith(color: AimColors.error500)),
              ],
              const SizedBox(height: AimSpacing.space16),
              AIMButton(
                fullWidth: true,
                size: AIMButtonSize.large,
                loading: _submitting,
                disabled: !_ready,
                onPressed: _submit,
                child: Text(_submitting ? l10n.billingSubmitting : l10n.billingSubmit),
              ),
              const SizedBox(height: AimSpacing.space8),
              Text(
                l10n.billingPendingBody,
                style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StepTitle extends StatelessWidget {
  const _StepTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space8),
      child: Text(
        text,
        style: AimTextStyles.bodyMd.copyWith(
          color: aimSurfacesOf(context).textPrimary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _WalletLogo extends StatelessWidget {
  const _WalletLogo({required this.url});

  static const double size = 28;

  final String? url;

  @override
  Widget build(BuildContext context) {
    const fallback = Icon(Icons.account_balance_wallet_outlined, size: size * 0.8, color: AimColors.primary500);
    if (url == null) return const SizedBox(width: size, height: size, child: fallback);
    return ClipRRect(
      borderRadius: BorderRadius.circular(6),
      child: Image.network(
        url!,
        width: size,
        height: size,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => const SizedBox(width: size, height: size, child: fallback),
      ),
    );
  }
}

class _WalletDetails extends StatelessWidget {
  const _WalletDetails({required this.wallet, required this.amount, this.qrUrl});

  final PaymentWallet wallet;
  final String amount;
  final String? qrUrl;

  void _showQr(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) => Dialog(
        child: InteractiveViewer(
          child: Padding(
            padding: const EdgeInsets.all(AimSpacing.space12),
            child: Image.network(
              qrUrl!,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined, size: 48),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final number = wallet.accountNumber;
    return Container(
      padding: const EdgeInsets.all(AimSpacing.space12),
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: AimRadius.borderMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.billingTransferTo(amount),
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w700),
          ),
          if (wallet.accountName != null) ...[
            const SizedBox(height: AimSpacing.space8),
            Text('${l10n.billingAccountName}: ${wallet.accountName}',
                style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary)),
          ],
          if (number != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${l10n.billingAccountNumber}: $number',
                    style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w700),
                    textDirection: TextDirection.ltr,
                    textAlign: TextAlign.start,
                  ),
                ),
                TextButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: number));
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.billingCopied)));
                  },
                  icon: const Icon(Icons.copy_rounded, size: 18),
                  label: Text(l10n.billingCopy),
                ),
              ],
            ),
          ],
          if (wallet.instructions != null) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(wallet.instructions!, style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary)),
          ],
          if (qrUrl != null) ...[
            const SizedBox(height: AimSpacing.space12),
            Center(
              child: GestureDetector(
                onTap: () => _showQr(context),
                child: Column(
                  children: [
                    ClipRRect(
                      borderRadius: AimRadius.borderMd,
                      child: Image.network(
                        qrUrl!,
                        height: 180,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined, size: 48),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space4),
                    Text(l10n.billingTapToEnlarge, style: AimTextStyles.caption.copyWith(color: surfaces.textMuted)),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
