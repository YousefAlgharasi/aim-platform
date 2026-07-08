// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Help center" (48)
//   docs/design/ui-for-all-system-mobile/screenshots/light/48-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/48-screen.png
//
// TASK-34: restyled to match design screen 48 — gradient header, expandable
// category accordion cards with FAQ question/answer pairs and a count
// badge. Content is static local app copy per SCREENS.md — there is no
// SupportDatasource endpoint for FAQ content (backend is read-only for this
// task), so nothing here is a stand-in for a missing backend call.
//
// "Create Ticket" is kept as a bottom CTA (not shown in the mockup, which
// only depicts the FAQ browsing state) since it's a real, working
// navigation to the create-ticket screen (AppRoutePaths.createTicket) —
// removing it would remove real functionality, not just cosmetic mismatch.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import '../widgets/help_faq_accordion.dart';

class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  static const List<HelpCategory> _categories = [
    HelpCategory(
      title: 'Lessons & Content',
      faqs: [
        HelpFaqItem(
          question: 'How do I start a lesson?',
          answer: 'Open the Learn tab, choose a course and chapter, then '
              'tap any lesson to begin.',
        ),
        HelpFaqItem(
          question: 'Can I learn offline?',
          answer: 'AIM Plus lets you download lessons for offline study '
              'from each lesson page.',
        ),
      ],
    ),
    HelpCategory(
      title: 'Assessments & Grades',
      faqs: [
        HelpFaqItem(
          question: 'When is my assessment graded?',
          answer: 'Most assessments are graded automatically right after '
              'you submit. Results appear on the assessment result screen.',
        ),
        HelpFaqItem(
          question: 'Can I retake a failed assessment?',
          answer: 'If retakes are allowed for that assessment, a new '
              'attempt button appears on its detail page.',
        ),
      ],
    ),
    HelpCategory(
      title: 'Account & Profile',
      faqs: [
        HelpFaqItem(
          question: 'How do I change my profile details?',
          answer: 'Go to Profile, then Edit Profile, to update your name '
              'and other account details.',
        ),
        HelpFaqItem(
          question: 'How do I change my password?',
          answer: 'Password changes are managed from your account '
              'settings on the sign-in screen.',
        ),
      ],
    ),
    HelpCategory(
      title: 'Billing & Subscription',
      faqs: [
        HelpFaqItem(
          question: 'How do I see my invoices?',
          answer: 'Open Subscription from your profile, then tap '
              'Invoices to see your billing history.',
        ),
        HelpFaqItem(
          question: 'How do I cancel my subscription?',
          answer: 'Open Subscription and use the Cancel option — access '
              'continues until the end of the current billing period.',
        ),
      ],
    ),
    HelpCategory(
      title: 'Technical Issues',
      faqs: [
        HelpFaqItem(
          question: 'The app is not loading my content.',
          answer: 'Check your internet connection and try again. If the '
              'problem continues, create a support ticket.',
        ),
      ],
    ),
    HelpCategory(
      title: 'General Help',
      faqs: [
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

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _HelpCenterHeader(),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.sectionGap,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: Row(
              children: [
                Expanded(
                  child: _HelpQuickLink(
                    icon: Icons.confirmation_number_outlined,
                    label: 'My Tickets',
                    onTap: () => context.push(AppRoutePaths.ticketList),
                  ),
                ),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: _HelpQuickLink(
                    icon: Icons.feedback_outlined,
                    label: 'Feedback',
                    onTap: () => context.push(AppRoutePaths.feedback),
                  ),
                ),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: _HelpQuickLink(
                    icon: Icons.info_outline,
                    label: 'Status',
                    onTap: () => context.push(AppRoutePaths.supportStatus),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              itemCount: _categories.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AimSpacing.listItemGap),
              itemBuilder: (context, index) =>
                  HelpCategoryAccordionCard(category: _categories[index]),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
              child: AIMGradientButton(
                label: 'Create Ticket',
                icon: const Icon(Icons.add),
                onPressed: () => context.push(AppRoutePaths.createTicket),
                fullWidth: true,
                semanticLabel: 'Create a support ticket',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HelpQuickLink extends StatelessWidget {
  const _HelpQuickLink({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AimRadius.md),
        child: Container(
          padding: const EdgeInsets.symmetric(
            vertical: AimSpacing.space12,
            horizontal: AimSpacing.space8,
          ),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(AimRadius.md),
            border: Border.all(color: surfaces.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: AimSizes.iconMd, color: AimColors.primary500),
              const SizedBox(height: AimSpacing.space4),
              Text(
                label,
                style: AimTextStyles.caption,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HelpCenterHeader extends StatelessWidget {
  const _HelpCenterHeader();

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
              'Help Center',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
