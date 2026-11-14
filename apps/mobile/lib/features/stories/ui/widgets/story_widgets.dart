// The course story on the course screens: a card with how many parts are read and the next one to open,
// and one tile per chapter (next to the chapter quiz). The server decides when a part unlocks.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/routing/app_route_paths.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../learner_tools/data/learner_tools_api.dart';
import 'story_scene_view.dart';

/// Where one chapter's part of a story is read.
String storyPartRoute(String storyId, int part) =>
    '${AppRoutePaths.storyReader}?id=${Uri.encodeQueryComponent(storyId)}&part=$part';

bool _ar(BuildContext context) => Localizations.localeOf(context).languageCode == 'ar';

/// The course's story, shown at the top of the course screen.
class CourseStoryCard extends StatelessWidget {
  const CourseStoryCard({required this.story, super.key});

  final CourseStory story;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final s = story.summary;
    final title = (_ar(context) && (s.titleAr ?? '').isNotEmpty) ? s.titleAr! : s.title;
    final total = story.parts.length;
    final next = story.next;
    final allDone = total > 0 && story.partsRead >= total;
    final target = next ?? (allDone ? story.parts.first : null);
    final cta = next != null
        ? (story.partsRead == 0 && next.index == 0
            ? context.tr('Start the story', 'ابدأ القصة')
            : fill(context.tr('Read part {n}', 'اقرأ الجزء {n}'), {'n': next.index + 1}))
        : allDone
            ? context.tr('Read again', 'اقرأ مجددًا')
            : null;
    return Container(
      padding: const EdgeInsetsDirectional.all(AimSpacing.space12 + 2),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const StoryCast(),
              const SizedBox(width: AimSpacing.space12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('Course story', 'قصة الدورة'),
                      style: AimTextStyles.caption.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
                    ),
                    Text(
                      title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            [
              fill(context.tr('{done} of {total} parts read', 'قرأت {done} من {total} أجزاء'), {'done': story.partsRead, 'total': total}),
              if (next == null && !allDone) context.tr('Finish a chapter to unlock the next part', 'أنهِ فصلًا لفتح الجزء التالي'),
            ].join(' · '),
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
          ),
          if (target != null && cta != null) ...[
            const SizedBox(height: AimSpacing.space12),
            AIMButton(
              size: AIMButtonSize.small,
              onPressed: () => context.push(storyPartRoute(s.storyId, target.index)),
              child: Text(cta),
            ),
          ],
        ],
      ),
    );
  }
}

/// One chapter's story part, in the chapter's lesson list (after the lessons, before the quiz).
class StoryPartTile extends StatelessWidget {
  const StoryPartTile({required this.story, super.key});

  final ChapterStory story;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final part = story.part;
    final title = (_ar(context) && (story.titleAr ?? '').isNotEmpty) ? story.titleAr! : story.title;
    final label = fill(context.tr('Story part {n}', 'جزء القصة {n}'), {'n': part.index + 1});
    final tone = part.done ? AimColors.success500 : (part.unlocked ? AimColors.primary500 : surfaces.textMuted);
    final icon = part.done ? Icons.check_circle_rounded : (part.unlocked ? Icons.auto_stories_rounded : Icons.lock_outline_rounded);
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Opacity(
      opacity: part.unlocked ? 1 : 0.7,
      child: AIMCard(
        variant: AIMCardVariant.elevated,
        onTap: part.unlocked ? () => context.push(storyPartRoute(story.storyId, part.index)) : null,
        semanticLabel: '$label: $title',
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(color: tone.withValues(alpha: 0.16), shape: BoxShape.circle),
              child: Icon(icon, size: AimSizes.iconMd, color: tone),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AimTextStyles.caption.copyWith(color: tone, fontWeight: FontWeight.w800)),
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                  ),
                  if (!part.unlocked)
                    Text(
                      context.tr("Finish this chapter's lessons to unlock", 'أنهِ دروس هذا الفصل لفتحه'),
                      style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                    ),
                ],
              ),
            ),
            if (part.unlocked) Icon(rtl ? Icons.chevron_left : Icons.chevron_right, color: surfaces.textMuted),
          ],
        ),
      ),
    );
  }
}
