// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "New ticket" (50)
//   docs/design/ui-for-all-system-mobile/screenshots/light/50-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/50-screen.png
//
// Create support ticket page.
//
// Form with category, severity, subject, and description fields.
// Submits to POST /support/tickets via repository.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-35: restyled to match design screen 50 — gradient header ("New
// ticket"), AIMSelect/AIMInput/AIMTextarea form fields, gradient "Submit
// Ticket" button.
//
// Wired to the real POST /support-tickets endpoint via createTicketProvider
// (SupportRemoteDatasourceImpl). Category options match the backend's
// CreateSupportTicketDto enum exactly (bug_report/account_issue/
// learning_issue/billing_issue/general/other).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../logic/provider/support_provider.dart';

class CreateTicketPage extends ConsumerStatefulWidget {
  const CreateTicketPage({super.key});

  @override
  ConsumerState<CreateTicketPage> createState() => _CreateTicketPageState();
}

class _CreateTicketPageState extends ConsumerState<CreateTicketPage> {
  String _category = 'general';
  String _severity = 'medium';
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _subjectError;
  String? _descriptionError;

  List<AIMSelectOption> _getCategoryOptions(AppLocalizations l10n) => [
        AIMSelectOption(value: 'bug_report', label: l10n.supportCategoryBugReport),
        AIMSelectOption(value: 'account_issue', label: l10n.supportCategoryAccountIssue),
        AIMSelectOption(value: 'learning_issue', label: l10n.supportCategoryLearningIssue),
        AIMSelectOption(value: 'billing_issue', label: l10n.supportCategoryBillingIssue),
        AIMSelectOption(value: 'general', label: l10n.supportCategoryGeneral),
        AIMSelectOption(value: 'other', label: l10n.supportCategoryOther),
      ];

  List<AIMSelectOption> _getSeverityOptions(AppLocalizations l10n) => [
        AIMSelectOption(value: 'low', label: l10n.supportSeverityLow),
        AIMSelectOption(value: 'medium', label: l10n.supportSeverityMedium),
        AIMSelectOption(value: 'high', label: l10n.supportSeverityHigh),
        AIMSelectOption(value: 'critical', label: l10n.supportSeverityCritical),
      ];

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final submitState = ref.watch(createTicketProvider);
    final isSubmitting = switch (submitState) {
      AppAsyncLoading() => true,
      _ => false,
    };
    final submitError = switch (submitState) {
      AppAsyncFailure(:final message) => message,
      _ => null,
    };

    ref.listen(createTicketProvider, (previous, next) {
      if (next is AppAsyncSuccess<dynamic> && context.canPop()) {
        context.pop();
      }
    });

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _CreateTicketHeader(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              children: [
                AIMSelect(
                  label: l10n.supportCategoryLabel,
                  options: _getCategoryOptions(l10n),
                  value: _category,
                  onChanged: (value) {
                    if (value != null) setState(() => _category = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMSelect(
                  label: l10n.supportSeverityLabel,
                  options: _getSeverityOptions(l10n),
                  value: _severity,
                  onChanged: (value) {
                    if (value != null) setState(() => _severity = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMInput(
                  label: l10n.supportSubjectLabel,
                  controller: _subjectController,
                  placeholder: l10n.supportSubjectPlaceholder,
                  error: _subjectError,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMTextarea(
                  label: l10n.supportDescriptionLabel,
                  controller: _descriptionController,
                  placeholder: l10n.supportDescriptionPlaceholder,
                  rows: 5,
                  error: _descriptionError,
                ),
                if (submitError != null) ...[
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    submitError,
                    style: AimTextStyles.bodySm
                        .copyWith(color: AimColors.error500),
                  ),
                ],
                const SizedBox(height: AimSpacing.sectionGap),
                AIMGradientButton(
                  label: l10n.supportSubmitTicket,
                  onPressed: isSubmitting ? null : () => _handleSubmit(l10n),
                  loading: isSubmitting,
                  fullWidth: true,
                  semanticLabel: l10n.supportSubmitTicket,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit(AppLocalizations l10n) {
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();
    setState(() {
      _subjectError = subject.isEmpty ? l10n.supportSubjectRequired : null;
      _descriptionError =
          description.isEmpty ? l10n.supportDescriptionRequired : null;
    });
    if (_subjectError != null || _descriptionError != null) return;

    ref.read(createTicketProvider.notifier).submit(
          category: _category,
          severity: _severity,
          subject: subject,
          description: description,
        );
  }
}

class _CreateTicketHeader extends StatelessWidget {
  const _CreateTicketHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: AppLocalizations.of(context).commonBack,
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              AppLocalizations.of(context).supportNewTicket,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
