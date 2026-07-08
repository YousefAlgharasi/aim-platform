// ChapterQuizTile — tappable row at the end of the lesson list linking
// directly to the chapter's quiz (GET /student/lessons?chapterId= —
// sibling `quiz` field). Always enabled: chapter-completion gating is
// enforced server-side (hidden from the Assessments list / rejected on
// attempt) if the lessons aren't done yet.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class ChapterQuizTile extends StatelessWidget {
  const ChapterQuizTile({
    required this.model,
    required this.onTap,
    super.key,
  });

  final ChapterQuizSummaryModel model;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: '${l10n.lessonsQuizRowLabel}: ${model.title}',
      child: Row(
        children: [
          DecoratedBox(
            decoration: const BoxDecoration(
              gradient: AimGradients.gzCoral,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.quiz_outlined,
                size: AimSizes.iconMd,
                color: AimColors.neutral0,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.lessonsQuizRowLabel,
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.primary500,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
                Text(
                  model.title,
                  style:
                      AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: surfaces.textMuted),
        ],
      ),
    );
  }
}
