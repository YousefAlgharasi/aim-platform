// Shared help-center accordion: a category card that expands to show its
// FAQ question/answer pairs. Used by both HelpCenterPage and
// ParentHelpCenterPage (screens 48/49) — same widget, different static
// content per page.
//
// This content is static, local app copy (not backend-sourced) per
// SCREENS.md — there is no SupportDatasource endpoint for FAQ content, so
// nothing here is a stand-in for a missing backend call.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class HelpFaqItem {
  const HelpFaqItem({required this.question, required this.answer});

  final String question;
  final String answer;
}

class HelpCategory {
  const HelpCategory({
    required this.title,
    required this.faqs,
  });

  final String title;
  final List<HelpFaqItem> faqs;
}

class HelpCategoryAccordionCard extends StatefulWidget {
  const HelpCategoryAccordionCard({required this.category, super.key});

  final HelpCategory category;

  @override
  State<HelpCategoryAccordionCard> createState() =>
      _HelpCategoryAccordionCardState();
}

class _HelpCategoryAccordionCardState
    extends State<HelpCategoryAccordionCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final category = widget.category;

    return AIMCard(
      variant: AIMCardVariant.standard,
      padded: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: AimRadius.borderLg,
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      category.title,
                      style: AimTextStyles.title
                          .copyWith(color: surfaces.textPrimary),
                    ),
                  ),
                  Text(
                    '${category.faqs.length}',
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textMuted),
                  ),
                  const SizedBox(width: AimSpacing.space4),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    size: AimSizes.iconSm,
                    color: surfaces.textMuted,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AimSpacing.space16,
                0,
                AimSpacing.space16,
                AimSpacing.space16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final faq in category.faqs)
                    Padding(
                      padding:
                          const EdgeInsets.only(bottom: AimSpacing.componentGap),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            faq.question,
                            style: AimTextStyles.bodyMd.copyWith(
                              color: surfaces.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AimSpacing.space2),
                          Text(
                            faq.answer,
                            style: AimTextStyles.bodySm
                                .copyWith(color: surfaces.textSecondary),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
