import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/widgets/widgets.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import '../../shell/logic/main_shell_tab_provider.dart';
import 'widgets/practice_widgets.dart';

/// Practice — one place to see every way to practice, with what is waiting
/// today. Mirrors the web app's "Practice" hub.
class PracticeHubPage extends ConsumerWidget {
  const PracticeHubPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final due = ref.watch(vocabularyProvider).valueOrNull?.dueCount;
    final mistakes = ref.watch(mistakesProvider(null)).valueOrNull?.total;
    final waiting = (mistakes ?? 0) + (due ?? 0);

    final summary = [
      if ((mistakes ?? 0) > 0)
        fill(context.tr('{n} mistakes to retry', '{n} أخطاء لإعادتها'), {'n': mistakes}),
      if ((due ?? 0) > 0)
        fill(context.tr('{n} words due', '{n} كلمات تنتظر المراجعة'), {'n': due}),
    ].join(', ');

    void startNow() {
      if ((mistakes ?? 0) > 0) {
        context.push('${AppRoutePaths.mistakes}?quick=1');
      } else if ((due ?? 0) > 0) {
        context.push(AppRoutePaths.vocabulary);
      } else {
        context.push(AppRoutePaths.aiTeacherChat, extra: {'contextRef': 'general'});
      }
    }

    final surfaces = aimSurfacesOf(context);

    void openCourses() {
      ref.read(mainShellTabIndexProvider.notifier).state = 1;
      context.go(AppRoutePaths.mainShell);
    }

    final skills = [
      PracticeSkillTile(
        icon: Icons.mic_rounded,
        tone: const Color(0xFF3B82F6),
        title: context.tr('Speak', 'تحدّث'),
        subtitle: context.tr('Have a conversation', 'ابدأ محادثة'),
        onTap: () => context.push(AppRoutePaths.practiceSpeaking),
      ),
      PracticeSkillTile(
        icon: Icons.edit_rounded,
        tone: const Color(0xFF8B5CF6),
        title: context.tr('Write', 'اكتب'),
        subtitle: context.tr('Express your ideas', 'عبّر عن أفكارك'),
        onTap: () => context.push(AppRoutePaths.practiceWriting),
      ),
      PracticeSkillTile(
        icon: Icons.headphones_rounded,
        tone: const Color(0xFF10B981),
        title: context.tr('Listen', 'استمع'),
        subtitle: context.tr('Hear words and sentences', 'استمع إلى الكلمات والجمل'),
        onTap: () => context.push(AppRoutePaths.vocabularyLibrary),
      ),
      PracticeSkillTile(
        icon: Icons.menu_book_rounded,
        tone: const Color(0xFFF59E0B),
        title: context.tr('Read', 'اقرأ'),
        subtitle: context.tr('Read and learn', 'اقرأ وتعلّم'),
        onTap: openCourses,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(vocabularyProvider);
            ref.invalidate(mistakesProvider(null));
          },
          child: ListView(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.space16,
              AimSpacing.screenPaddingMobile,
              72,
            ),
            children: [
              // A main screen: the heading sits under the app frame's AIM bar.
              PageTitleBar(
                title: context.tr('Practice', 'تدرّب'),
                subtitle: context.tr(
                  'Sharpen your skills and reach your goals',
                  'نمِّ مهاراتك وحقّق أهدافك',
                ),
              ),
              const SizedBox(height: AimSpacing.space16),
              PracticePlanBanner(
                title: waiting > 0
                    ? context.tr('Your 5-minute plan', 'خطتك لخمس دقائق')
                    : context.tr('You are all caught up', 'أنهيت كل شيء'),
                subtitle: waiting > 0
                    ? summary
                    : context.tr(
                        'Quick practice for steady progress',
                        'تدريب سريع لتقدّم ثابت',
                      ),
                onStart: startNow,
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              Row(
                children: [
                  const Icon(Icons.graphic_eq_rounded, size: 22, color: AimColors.primary500),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      context.tr('Practice Skills', 'مهارات التدريب'),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.h3.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AimSpacing.componentGap),
              IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(child: skills[0]),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(child: skills[1]),
                  ],
                ),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(child: skills[2]),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(child: skills[3]),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
