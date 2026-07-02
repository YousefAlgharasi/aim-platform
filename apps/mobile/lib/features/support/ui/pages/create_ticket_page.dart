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

import 'package:aim_mobile/core/widgets/widgets.dart';

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

  static const _categoryOptions = [
    AIMSelectOption(value: 'technical', label: 'Technical Issue'),
    AIMSelectOption(value: 'billing', label: 'Billing'),
    AIMSelectOption(value: 'account', label: 'Account'),
    AIMSelectOption(value: 'content', label: 'Content'),
    AIMSelectOption(value: 'feedback', label: 'Feedback'),
    AIMSelectOption(value: 'general', label: 'General'),
  ];

  static const _severityOptions = [
    AIMSelectOption(value: 'low', label: 'Low'),
    AIMSelectOption(value: 'medium', label: 'Medium'),
    AIMSelectOption(value: 'high', label: 'High'),
    AIMSelectOption(value: 'critical', label: 'Critical'),
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
                  label: 'Category',
                  options: _categoryOptions,
                  value: _category,
                  onChanged: (value) {
                    if (value != null) setState(() => _category = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMSelect(
                  label: 'Severity',
                  options: _severityOptions,
                  value: _severity,
                  onChanged: (value) {
                    if (value != null) setState(() => _severity = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMInput(
                  label: 'Subject',
                  controller: _subjectController,
                  placeholder: 'Briefly describe the issue',
                  error: _subjectError,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMTextarea(
                  label: 'Description',
                  controller: _descriptionController,
                  placeholder: 'Tell us what happened, step by step...',
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
                  label: 'Submit Ticket',
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  loading: _isSubmitting,
                  fullWidth: true,
                  semanticLabel: 'Submit ticket',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit() {
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();
    setState(() {
      _subjectError = subject.isEmpty ? 'Subject is required' : null;
      _descriptionError =
          description.isEmpty ? 'Description is required' : null;
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
      _submitError = 'Ticket submission is not available yet. Please try '
          'again later.';
    });
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
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'New ticket',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
