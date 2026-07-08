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

  static const _categoryOptions = [
    AIMSelectOption(value: 'suggestion', label: 'Suggestion'),
    AIMSelectOption(value: 'bug_report', label: 'Bug report'),
    AIMSelectOption(value: 'compliment', label: 'Compliment'),
    AIMSelectOption(value: 'complaint', label: 'Complaint'),
    AIMSelectOption(value: 'other', label: 'Other'),
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
                  label: 'Category',
                  options: _categoryOptions,
                  value: _category,
                  onChanged: (value) {
                    if (value != null) setState(() => _category = value);
                  },
                ),
                const SizedBox(height: AimSpacing.componentGap),
                Text(
                  'How would you rate AIM?',
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
                  label: 'Title',
                  controller: _titleController,
                  placeholder: 'A short summary',
                  error: _titleError,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMTextarea(
                  label: 'Your feedback',
                  controller: _bodyController,
                  placeholder: 'Tell us what you think...',
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
                  label: 'Submit',
                  onPressed: isSubmitting ? null : _handleSubmit,
                  loading: isSubmitting,
                  fullWidth: true,
                  semanticLabel: 'Submit feedback',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit() {
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();
    setState(() {
      _titleError = title.isEmpty ? 'Title is required' : null;
      _bodyError = body.isEmpty ? 'Feedback details are required' : null;
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
  final ValueChanged<int?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        final filled = rating != null && starValue <= rating!;
        return Semantics(
          button: true,
          label: 'Rate $starValue out of 5',
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
              'Send feedback',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
