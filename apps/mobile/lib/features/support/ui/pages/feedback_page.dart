// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Send feedback" (51)
//   docs/design/ui-for-all-system-mobile/screenshots/light/51-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/51-screen.png
//
// Student feedback submission page.
//
// Form with category dropdown, optional 1-5 star rating, title, and body.
// Submits to POST /feedback via repository.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-35: restyled to match design screen 51 — gradient header ("Send
// feedback"), AIMSelect/AIMInput/AIMTextarea fields, real star rating
// labeled "How would you rate AIM?", gradient "Submit" button.
//
// Note: POST /feedback is "Planned / Not Yet Active" and SupportDatasource
// has no concrete implementation (out of scope for this UI-only
// verification task). Submitting shows a graceful "not available yet"
// message instead of faking success or leaving the button stuck in a
// permanent loading spinner (the previous behavior never reset
// `_isSubmitting`).

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({super.key});

  @override
  State<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  String _category = 'general';
  int? _rating;
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  bool _isSubmitting = false;
  String? _titleError;
  String? _bodyError;
  String? _submitError;

  List<AIMSelectOption> _categoryOptions(AppLocalizations l10n) => [
        AIMSelectOption(value: 'general', label: l10n.supportCategoryGeneral),
        AIMSelectOption(
            value: 'feature', label: l10n.supportCategoryFeatureRequest),
        AIMSelectOption(value: 'bug', label: l10n.supportCategoryBugReport),
        AIMSelectOption(value: 'content', label: l10n.supportCategoryContent),
        AIMSelectOption(
            value: 'ux', label: l10n.supportCategoryUserExperience),
      ];

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
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
          const _FeedbackHeader(),
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
                Text(
                  l10n.supportRateAimQuestion,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space4),
                _StarRating(
                  rating: _rating,
                  onChanged: (value) => setState(() => _rating = value),
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMInput(
                  label: l10n.supportTitleLabel,
                  controller: _titleController,
                  placeholder: l10n.supportTitlePlaceholder,
                  error: _titleError,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMTextarea(
                  label: l10n.supportFeedbackLabel,
                  controller: _bodyController,
                  placeholder: l10n.supportFeedbackPlaceholder,
                  rows: 5,
                  error: _bodyError,
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
                  label: l10n.commonSubmit,
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  loading: _isSubmitting,
                  fullWidth: true,
                  semanticLabel: l10n.supportSubmitFeedbackSemantic,
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
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();
    setState(() {
      _titleError = title.isEmpty ? l10n.supportTitleRequired : null;
      _bodyError = body.isEmpty ? l10n.supportFeedbackDetailsRequired : null;
      _submitError = null;
    });
    if (_titleError != null || _bodyError != null) return;

    setState(() => _isSubmitting = true);

    // POST /feedback is "Planned / Not Yet Active" and SupportDatasource
    // has no concrete implementation yet — a real submission can't be
    // attempted here without inventing backend behavior. Show a graceful,
    // honest message instead of faking success.
    setState(() {
      _isSubmitting = false;
      _submitError = l10n.supportFeedbackSubmitUnavailable;
    });
  }
}

class _StarRating extends StatelessWidget {
  const _StarRating({required this.rating, required this.onChanged});

  final int? rating;
  final ValueChanged<int?> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        final filled = rating != null && starValue <= rating!;
        return Semantics(
          button: true,
          label: l10n.supportRateStarsSemantic(starValue),
          child: InkWell(
            onTap: () => onChanged(rating == starValue ? null : starValue),
            customBorder: const CircleBorder(),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space4),
              child: Icon(
                filled ? Icons.star : Icons.star_border,
                size: AimSizes.iconLg,
                color: filled ? AimColors.warning500 : AimColors.neutral300,
              ),
            ),
          ),
        );
      }),
    );
  }
}

class _FeedbackHeader extends StatelessWidget {
  const _FeedbackHeader();

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
              l10n.supportSendFeedbackTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
