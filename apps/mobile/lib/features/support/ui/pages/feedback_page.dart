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
// Wired to the real POST /feedback endpoint via submitFeedbackProvider
// (SupportRemoteDatasourceImpl). Category options match the backend's
// CreateFeedbackDto enum exactly (bug_report/suggestion/compliment/
// complaint/other).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import '../../logic/provider/support_provider.dart';

class FeedbackPage extends ConsumerStatefulWidget {
  const FeedbackPage({super.key});

  @override
  ConsumerState<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends ConsumerState<FeedbackPage> {
  String _category = 'suggestion';
  int? _rating;
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  String? _titleError;
  String? _bodyError;

  List<AIMSelectOption> _getCategoryOptions(AppLocalizations l10n) => [
        AIMSelectOption(value: 'suggestion', label: l10n.supportCategorySuggestion),
        AIMSelectOption(value: 'bug_report', label: l10n.supportCategoryBugReport),
        AIMSelectOption(value: 'compliment', label: l10n.supportCategoryCompliment),
        AIMSelectOption(value: 'complaint', label: l10n.supportCategoryComplaint),
        AIMSelectOption(value: 'other', label: l10n.supportCategoryOther),
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
    final submitState = ref.watch(submitFeedbackProvider);
    final isSubmitting = switch (submitState) {
      AppAsyncLoading() => true,
      _ => false,
    };
    final submitError = switch (submitState) {
      AppAsyncFailure(:final message) => message,
      _ => null,
    };

    ref.listen(submitFeedbackProvider, (previous, next) {
      if (next is AppAsyncSuccess<dynamic> && context.canPop()) {
        context.pop();
      }
    });

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
                  options: _getCategoryOptions(l10n),
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
                  label: l10n.supportFeedbackTitleLabel,
                  controller: _titleController,
                  placeholder: l10n.supportFeedbackTitlePlaceholder,
                  error: _titleError,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMTextarea(
                  label: l10n.supportFeedbackBodyLabel,
                  controller: _bodyController,
                  placeholder: l10n.supportFeedbackBodyPlaceholder,
                  rows: 5,
                  error: _bodyError,
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
                  label: l10n.commonSubmit,
                  onPressed: isSubmitting ? null : () => _handleSubmit(l10n),
                  loading: isSubmitting,
                  fullWidth: true,
                  semanticLabel: l10n.commonSubmit,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit(AppLocalizations l10n) {
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();
    setState(() {
      _titleError = title.isEmpty ? l10n.supportFeedbackTitleRequired : null;
      _bodyError = body.isEmpty ? l10n.supportFeedbackBodyRequired : null;
    });
    if (_titleError != null || _bodyError != null) return;

    ref.read(submitFeedbackProvider.notifier).submit(
          category: _category,
          rating: _rating,
          title: title,
          body: body,
        );
  }
}

class _StarRating extends StatelessWidget {
  const _StarRating({required this.rating, required this.onChanged});

  final int? rating;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        final filled = rating != null && rating! >= starValue;
        return Semantics(
          button: true,
          label: '$starValue star',
          child: InkWell(
            onTap: () => onChanged(starValue),
            borderRadius: BorderRadius.circular(AimRadius.sm),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.space4,
                vertical: AimSpacing.space8,
              ),
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
              AppLocalizations.of(context).supportFeedback,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
