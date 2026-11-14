// Stories — one reading story per course, told by Sarah, Adam, Yasmin and Tariq, with questions after every
// scene. They get longer and harder as you move up. A story is locked exactly when its course is.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/widgets/widgets.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import 'widgets/story_scene_view.dart';

class StoriesPage extends ConsumerWidget {
  const StoriesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final state = ref.watch(storiesProvider);
    return Scaffold(
      appBar: AIMTopAppBar(
        title: context.tr('Stories', 'القصص'),
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: SafeArea(
        top: false,
        child: state.when(
          loading: () => AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل')),
          error: (e, _) => AIMFullScreenError(
            message: errorText(e, context.tr('Could not load the stories', 'تعذّر تحميل القصص')),
            onRetry: () => ref.invalidate(storiesProvider),
          ),
          data: (stories) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(storiesProvider),
            child: stories.isEmpty
                ? ListView(children: [
                    AIMEmptyState(
                      icon: const Icon(Icons.auto_stories_rounded),
                      title: context.tr('No stories yet', 'لا توجد قصص بعد'),
                      subtitle: context.tr('New stories are on the way. Check back soon.', 'قصص جديدة في الطريق. عُد قريبًا.'),
                    ),
                  ])
                : ListView(
                    padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
                    children: [
                      Text(
                        context.tr(
                          'Read a story with Sarah, Adam, Yasmin and Tariq, and answer questions as you go. Each course has its own story, and they get longer and harder as you move up.',
                          'اقرأ قصة مع سارة وآدم وياسمين وطارق، وأجب عن الأسئلة أثناء القراءة. لكل دورة قصتها الخاصة، وتصبح أطول وأصعب كلما ارتقيت.',
                        ),
                        style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
                      ),
                      const SizedBox(height: AimSpacing.sectionGap),
                      for (final s in stories) ...[
                        _StoryCard(story: s),
                        const SizedBox(height: AimSpacing.componentGap),
                      ],
                      const SizedBox(height: 40),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

String storyActionLabel(BuildContext context, StorySummary s) {
  if (s.locked) {
    return '🔒 ${fill(context.tr('Unlocks when you reach {course}', 'تُفتح عندما تصل إلى {course}'), {'course': s.courseTitle})}';
  }
  if (s.completed) return context.tr('Read again', 'اقرأ مجددًا');
  if (s.answered > 0) return context.tr('Continue', 'تابع');
  return context.tr('Start reading', 'ابدأ القراءة');
}

class _StoryCard extends StatelessWidget {
  const _StoryCard({required this.story});

  final StorySummary story;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final ar = Localizations.localeOf(context).languageCode == 'ar';
    final title = (ar && (story.titleAr ?? '').isNotEmpty) ? story.titleAr! : story.title;
    final summary = (ar && (story.summaryAr ?? '').isNotEmpty) ? story.summaryAr! : story.summary;
    return Semantics(
      button: !story.locked,
      label: title,
      child: Opacity(
        opacity: story.locked ? 0.65 : 1,
        child: Material(
          color: surfaces.surface,
          borderRadius: BorderRadius.circular(AimRadius.lg),
          child: InkWell(
            borderRadius: BorderRadius.circular(AimRadius.lg),
            onTap: story.locked
                ? null
                : () => context.push('${AppRoutePaths.storyReader}?id=${Uri.encodeQueryComponent(story.storyId)}'),
            child: Container(
              padding: const EdgeInsetsDirectional.all(AimSpacing.space12 + 2),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AimRadius.lg),
                border: Border.all(color: surfaces.border),
                boxShadow: [
                  BoxShadow(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.12 : 0.06),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const StoryCast(),
                      const Spacer(),
                      Flexible(
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          alignment: WrapAlignment.end,
                          children: [
                            _Chip(text: story.cefrCode ?? story.courseTitle, tone: AimColors.primary500),
                            if (story.completed)
                              _Chip(text: '✓ ${context.tr('Finished', 'أنهيتها')}', tone: AimColors.success500),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.space12),
                  Text(title, style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(summary, style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted)),
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    [
                      fill(context.tr('{n} scenes', '{n} مشاهد'), {'n': story.scenes}),
                      fill(context.tr('{n} min', '{n} د'), {'n': story.minutes}),
                      fill(context.tr('{n} questions', '{n} أسئلة'), {'n': story.questions}),
                    ].join(' · '),
                    style: AimTextStyles.caption.copyWith(color: surfaces.textMuted, fontWeight: FontWeight.w600),
                  ),
                  if (!story.locked && story.answered > 0) ...[
                    const SizedBox(height: AimSpacing.space8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: (story.percent < 3 ? 3 : story.percent) / 100,
                        minHeight: 8,
                        color: AimColors.primary500,
                        backgroundColor: surfaces.surfaceSunken,
                      ),
                    ),
                  ],
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    storyActionLabel(context, story),
                    style: AimTextStyles.bodySm.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.text, required this.tone});

  final String text;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(color: tone.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(100)),
      child: Text(text, style: AimTextStyles.caption.copyWith(color: tone, fontWeight: FontWeight.w700)),
    );
  }
}
