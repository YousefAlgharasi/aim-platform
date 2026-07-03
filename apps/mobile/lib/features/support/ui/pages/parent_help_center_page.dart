// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Parent help" (49)
//   docs/design/ui-for-all-system-mobile/screenshots/light/49-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/49-screen.png
//
// TASK-34: restyled to match design screen 49 — same pattern as
// HelpCenterPage (gradient header, expandable FAQ accordion cards), parent-
// specific category content. Static local app copy, no backend dependency
// (see help_center_page.dart's header for the same note on
// SupportDatasource).

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/help_faq_accordion.dart';

class ParentHelpCenterPage extends StatelessWidget {
  const ParentHelpCenterPage({super.key});

  static List<HelpCategory> _categories(AppLocalizations l10n) => [
    HelpCategory(
      title: l10n.supportCategoryStudentProgress,
      faqs: const [
        HelpFaqItem(
          question: "How do I track my child's progress?",
          answer: 'Your parent dashboard shows mastery, streaks, and '
              'recent activity for each learner.',
        ),
      ],
    ),
    HelpCategory(
      title: l10n.supportCategoryCoursesContent,
      faqs: const [
        HelpFaqItem(
          question: 'How do I see which courses my child is taking?',
          answer: "Open your parent dashboard and select your child's "
              'profile to see their enrolled courses.',
        ),
      ],
    ),
    HelpCategory(
      title: l10n.supportCategoryBillingPayments,
      faqs: const [
        HelpFaqItem(
          question: 'How do I see my invoices?',
          answer: 'Open Subscription from your profile, then tap '
              'Invoices to see your billing history.',
        ),
        HelpFaqItem(
          question: 'How do I change my plan?',
          answer: 'Open Subscription and use the Change Plan option to '
              'pick a different plan.',
        ),
      ],
    ),
    HelpCategory(
      title: l10n.supportCategoryAccountManagement,
      faqs: const [
        HelpFaqItem(
          question: 'How do I link a student account?',
          answer: 'Student accounts are linked from your parent profile '
              'settings.',
        ),
      ],
    ),
    HelpCategory(
      title: l10n.supportCategoryPrivacySafety,
      faqs: const [
        HelpFaqItem(
          question: "How is my child's data protected?",
          answer: 'AIM only collects data needed for learning progress '
              'and never shares it with third parties for advertising.',
        ),
      ],
    ),
    HelpCategory(
      title: l10n.supportCategoryGeneralHelp,
      faqs: const [
        HelpFaqItem(
          question: "Didn't find what you're looking for?",
          answer: 'Create a support ticket and our team will get back to '
              'you.',
        ),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final categories = _categories(l10n);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _ParentHelpCenterHeader(),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              itemCount: categories.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AimSpacing.listItemGap),
              itemBuilder: (context, index) =>
                  HelpCategoryAccordionCard(category: categories[index]),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
              child: AIMGradientButton(
                label: l10n.supportCreateTicketButton,
                icon: const Icon(Icons.add),
                onPressed: () => context.push(AppRoutePaths.createTicket),
                fullWidth: true,
                semanticLabel: l10n.supportCreateTicketSemantic,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ParentHelpCenterHeader extends StatelessWidget {
  const _ParentHelpCenterHeader();

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
              l10n.supportParentHelpTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
