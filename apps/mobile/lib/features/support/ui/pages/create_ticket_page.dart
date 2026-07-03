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
// Note: POST /support/tickets is "Planned / Not Yet Active" and
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task — see the task note). Submitting now shows a
// graceful "not available yet" message instead of either faking a success
// response or leaving the button stuck in a permanent loading spinner
// (the previous behavior: `_isSubmitting` was set to true and never reset).

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class CreateTicketPage extends StatefulWidget {
  const CreateTicketPage({super.key});

  @override
  State<CreateTicketPage> createState() => _CreateTicketPageState();
}

class _CreateTicketPageState extends State<CreateTicketPage> {
  String _category = 'general';
  String _severity = 'medium';
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isSubmitting = false;
  String? _subjectError;
  String? _descriptionError;
  String? _submitError;

  List<AIMSelectOption> _categoryOptions(AppLocalizations l10n) => [
        AIMSelectOption(
            value: 'technical', label: l10n.supportCategoryTechnicalIssue),
        AIMSelectOption(value: 'billing', label: l10n.supportCategoryBilling),
        AIMSelectOption(value: 'account', label: l10n.supportCategoryAccount),
        AIMSelectOption(value: 'content', label: l10n.supportCategoryContent),
        AIMSelectOption(
            value: 'feedback', label: l10n.supportCategoryFeedback),
        AIMSelectOption(value: 'general', label: l10n.supportCategoryGeneral),
      ];

  List<AIMSelectOption> _severityOptions(AppLocalizations l10n) => [
        AIMSelectOption(value: 'low', label: l10n.supportSeverityLow),
        AIMSelectOption(value: 'medium', label: l10n.supportSeverityMedium),
        AIMSelectOption(value: 'high', label: l10n.supportSeverityHigh),
        AIMSelectOption(
            value: 'critical', label: l10n.supportSeverityCritical),
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
                  options: _categoryOptions(l10n),
                  value: _category,
                  onChanged: (value) {
                    if (value != null) setState(() => _category = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMSelect(
                  label: l10n.supportSeverityLabel,
                  options: _severityOptions(l10n),
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
                if (_submitError != null) ...[
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    _submitError!,
                    style: AimTextStyles.bodySm
                        .copyWith(color: AimColors.error500),
                  ),
                ],
                const SizedBox(height: AimSpacing.sectionGap),
                AIMGradientButton(
                  label: l10n.supportSubmitTicketButton,
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  loading: _isSubmitting,
                  fullWidth: true,
                  semanticLabel: l10n.supportSubmitTicketSemantic,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit() {
    final l10n = AppLocalizations.of(context);
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();
    setState(() {
      _subjectError = subject.isEmpty ? l10n.supportSubjectRequired : null;
      _descriptionError =
          description.isEmpty ? l10n.supportDescriptionRequired : null;
      _submitError = null;
    });
    if (_subjectError != null || _descriptionError != null) return;

    setState(() => _isSubmitting = true);

    // POST /support/tickets is "Planned / Not Yet Active" and
    // SupportDatasource has no concrete implementation yet — a real
    // submission can't be attempted here without inventing backend
    // behavior. Show a graceful, honest message instead of faking success.
    setState(() {
      _isSubmitting = false;
      _submitError = l10n.supportTicketSubmitUnavailable;
    });
  }
}

class _CreateTicketHeader extends StatelessWidget {
  const _CreateTicketHeader();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
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
              label: l10n.commonBack,
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
                    padding: EdgeInsets.all(AimSpacing.space12),
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
              l10n.supportNewTicketTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
