// HomeDailyChallengeCard — renders the student's backend-selected daily
// challenge and backend-computed progress toward it.
//
// title, description, targetCount, progressCount, and completed are all
// backend-computed. Flutter never picks the challenge or computes progress
// locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeDailyChallengeCard extends StatelessWidget {
  const HomeDailyChallengeCard({required this.challenge, super.key});

  final HomeDailyChallenge challenge;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    String localizeTitle(String raw) {
      final isAr = Localizations.localeOf(context).languageCode == 'ar';
      if (!isAr) return raw;
      switch (raw.trim().toLowerCase()) {
        case 'keep your streak alive':
          return 'حافظ على حماسك وتتابعك';
        case 'finish a lesson':
          return 'أكمل درساً واحداً اليوم';
        case 'lesson double':
          return 'أكمل درسين اليوم';
        default:
          return raw;
      }
    }

    String localizeDesc(String raw) {
      final isAr = Localizations.localeOf(context).languageCode == 'ar';
      if (!isAr) return raw;
      switch (raw.trim().toLowerCase()) {
        case 'stay active today to extend your learning streak.':
          return 'ابقَ نشطاً اليوم لتمديد سلسلة أيام تعلمك.';
        case 'complete 1 lesson today.':
          return 'أكمل درساً واحداً اليوم.';
        case 'complete 2 lessons today.':
          return 'أكمل درسين اليوم.';
        default:
          return raw;
      }
    }

    final displayTitle = localizeTitle(challenge.title);
    final displayDesc = localizeDesc(challenge.description);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: l10n.homeDailyChallengeSemantic(
        displayTitle,
        challenge.progressCount,
        challenge.targetCount,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            challenge.completed
                ? Icons.check_circle_outline
                : Icons.bolt_outlined,
            size: AimSizes.iconMd,
            color: challenge.completed
                ? AimColors.success500
                : AimColors.primary500,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  displayDesc,
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          AIMBadge(
            tone: challenge.completed
                ? AIMBadgeTone.success
                : AIMBadgeTone.primary,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text('${challenge.progressCount}/${challenge.targetCount}'),
          ),
        ],
      ),
    );
  }
}
