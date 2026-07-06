// OnboardingWalkthroughOverlay — first-time-user walkthrough.
//
// Shown at most once per install (see OnboardingWalkthroughNotifier), as a
// full-screen overlay above MainShellPage on first launch after sign-in.
// Purely explanatory UI over already-real app destinations (Home, Learn,
// Placement Test, Progress) — no backend calls, no fabricated data.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class _WalkthroughSlide {
  const _WalkthroughSlide({
    required this.icon,
    required this.titleBuilder,
    required this.bodyBuilder,
  });

  final IconData icon;
  final String Function(AppLocalizations l10n) titleBuilder;
  final String Function(AppLocalizations l10n) bodyBuilder;
}

const _slides = [
  _WalkthroughSlide(
    icon: Icons.waving_hand_outlined,
    titleBuilder: _title0,
    bodyBuilder: _body0,
  ),
  _WalkthroughSlide(
    icon: Icons.assignment_outlined,
    titleBuilder: _title1,
    bodyBuilder: _body1,
  ),
  _WalkthroughSlide(
    icon: Icons.menu_book_outlined,
    titleBuilder: _title2,
    bodyBuilder: _body2,
  ),
  _WalkthroughSlide(
    icon: Icons.local_fire_department_outlined,
    titleBuilder: _title3,
    bodyBuilder: _body3,
  ),
];

String _title0(AppLocalizations l10n) => l10n.onboardingWalkthroughWelcomeTitle;
String _body0(AppLocalizations l10n) => l10n.onboardingWalkthroughWelcomeBody;
String _title1(AppLocalizations l10n) => l10n.onboardingWalkthroughPlacementTitle;
String _body1(AppLocalizations l10n) => l10n.onboardingWalkthroughPlacementBody;
String _title2(AppLocalizations l10n) => l10n.onboardingWalkthroughLessonsTitle;
String _body2(AppLocalizations l10n) => l10n.onboardingWalkthroughLessonsBody;
String _title3(AppLocalizations l10n) => l10n.onboardingWalkthroughStreakTitle;
String _body3(AppLocalizations l10n) => l10n.onboardingWalkthroughStreakBody;

class OnboardingWalkthroughOverlay extends StatefulWidget {
  const OnboardingWalkthroughOverlay({required this.onDone, super.key});

  final VoidCallback onDone;

  @override
  State<OnboardingWalkthroughOverlay> createState() =>
      _OnboardingWalkthroughOverlayState();
}

class _OnboardingWalkthroughOverlayState
    extends State<OnboardingWalkthroughOverlay> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_index == _slides.length - 1) {
      widget.onDone();
      return;
    }
    _controller.nextPage(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isLast = _index == _slides.length - 1;

    return Material(
      color: AimColors.neutral900.withValues(alpha: 0.96),
      child: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: AlignmentDirectional.topEnd,
              child: Padding(
                padding: const EdgeInsets.all(AimSpacing.space8),
                child: TextButton(
                  onPressed: widget.onDone,
                  child: Text(
                    l10n.onboardingWalkthroughSkip,
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.75),
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (context, i) {
                  final slide = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.screenPaddingMobile,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: AimGradients.gzHero,
                            shape: BoxShape.circle,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(AimSpacing.space24),
                            child: Icon(
                              slide.icon,
                              size: AimSizes.iconLg * 1.5,
                              color: AimColors.neutral0,
                            ),
                          ),
                        ),
                        const SizedBox(height: AimSpacing.sectionGap),
                        Text(
                          slide.titleBuilder(l10n),
                          style: AimTextStyles.h2.copyWith(
                            color: AimColors.neutral0,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AimSpacing.componentGap),
                        Text(
                          slide.bodyBuilder(l10n),
                          style: AimTextStyles.bodyMd.copyWith(
                            color: AimColors.neutral0.withValues(alpha: 0.85),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < _slides.length; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space4,
                    ),
                    width: i == _index ? AimSpacing.space24 : AimSpacing.space8,
                    height: AimSpacing.space8,
                    decoration: BoxDecoration(
                      color: AimColors.neutral0.withValues(
                        alpha: i == _index ? 1 : 0.4,
                      ),
                      borderRadius: AimRadius.borderPill,
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
              child: AIMGradientButton(
                label: isLast
                    ? l10n.onboardingWalkthroughGetStarted
                    : l10n.onboardingWalkthroughNext,
                fullWidth: true,
                semanticLabel: isLast
                    ? l10n.onboardingWalkthroughGetStarted
                    : l10n.onboardingWalkthroughNext,
                onPressed: _next,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
