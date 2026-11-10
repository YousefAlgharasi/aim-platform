import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/widgets/widgets.dart';
import '../../learner_tools/data/learner_tools_api.dart';

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

    return Scaffold(
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(vocabularyProvider);
            ref.invalidate(mistakesProvider(null));
          },
          child: ListView(
            padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
            children: [
              // A main screen: the heading sits under the app frame's AIM bar.
              PageTitleBar(title: context.tr('Practice', 'تدرّب')),
              const SizedBox(height: AimSpacing.sectionGap),
              Container(
                padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
                decoration: BoxDecoration(
                  gradient: AimGradients.gzHero,
                  borderRadius: BorderRadius.circular(AimRadius.lg),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      waiting > 0
                          ? context.tr('Your 5-minute plan is ready', 'خطتك لخمس دقائق جاهزة')
                          : context.tr('You are all caught up', 'أنهيت كل شيء'),
                      style: AimTextStyles.h2.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: AimSpacing.space8),
                    Text(
                      waiting > 0
                          ? summary
                          : context.tr(
                              'Try a conversation or a new topic to keep your streak going.',
                              'جرّب محادثة أو موضوعاً جديداً لتحافظ على سلسلتك.',
                            ),
                      style: AimTextStyles.bodyMd.copyWith(color: Colors.white.withValues(alpha: 0.9)),
                    ),
                    const SizedBox(height: AimSpacing.space16),
                    FilledButton(
                      onPressed: startNow,
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AimColors.primary500,
                        minimumSize: const Size.fromHeight(48),
                        shape: const StadiumBorder(),
                      ),
                      child: Text(waiting > 0
                          ? context.tr('Start now', 'ابدأ الآن')
                          : context.tr('Chat with AI Teacher', 'تحدث مع المعلم الذكي')),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              _GroupTitle(context.tr('Speak and write', 'تكلّم واكتب')),
              _ModeCard(
                icon: Icons.mic_none_rounded,
                title: context.tr('Practice Speaking', 'تدرّب على المحادثة'),
                body: context.tr('Pick a topic, talk about it, earn XP.', 'اختر موضوعاً وتحدّث عنه واكسب نقاط خبرة.'),
                onTap: () => context.push(AppRoutePaths.practiceSpeaking),
                strip: true,
              ),
              _ModeCard(
                icon: Icons.edit_outlined,
                title: context.tr('Write a Paragraph', 'اكتب فقرة'),
                body: context.tr('Write on a topic and see exactly what to fix.', 'اكتب عن موضوع واعرف ما يجب إصلاحه بالضبط.'),
                onTap: () => context.push(AppRoutePaths.practiceWriting),
                strip: true,
              ),
              const SizedBox(height: AimSpacing.space12),
              _GroupTitle(context.tr('Remember and fix', 'تذكّر وأصلح')),
              _ModeCard(
                icon: Icons.menu_book_outlined,
                title: context.tr('Vocabulary', 'المفردات'),
                body: context.tr('Browse words with Arabic meanings, listen and save them.', 'تصفّح الكلمات بمعانيها العربية، واستمع إليها واحفظها.'),
                onTap: () => context.push(AppRoutePaths.vocabularyLibrary),
              ),
              _ModeCard(
                icon: Icons.lightbulb_outline_rounded,
                title: context.tr('My words', 'كلماتي'),
                body: context.tr('Review the words you saved with spaced flashcards.', 'راجع كلماتك المحفوظة ببطاقات متباعدة.'),
                meta: (due ?? 0) > 0 ? fill(context.tr('{n} due', '{n} مستحقة'), {'n': due}) : null,
                onTap: () => context.push(AppRoutePaths.vocabulary),
              ),
              _ModeCard(
                icon: Icons.refresh_rounded,
                title: context.tr('My mistakes', 'أخطائي'),
                body: context.tr('Retry the questions you got wrong until they stick.', 'أعد الأسئلة التي أخطأت فيها حتى تثبت.'),
                meta: (mistakes ?? 0) > 0 ? '$mistakes' : null,
                onTap: () => context.push(AppRoutePaths.mistakes),
              ),
              _ModeCard(
                icon: Icons.track_changes_rounded,
                title: context.tr('Improve', 'تحسين'),
                body: context.tr('See your weak spots and train them directly.', 'اطّلع على نقاط ضعفك ودرّب عليها مباشرة.'),
                onTap: () => context.push(AppRoutePaths.improve),
              ),
              const SizedBox(height: 72),
            ],
          ),
        ),
      ),
    );
  }
}

class _GroupTitle extends StatelessWidget {
  const _GroupTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsetsDirectional.only(bottom: AimSpacing.space8),
        child: Text(text, style: AimTextStyles.h3.copyWith(color: aimSurfacesOf(context).textPrimary)),
      );
}

class _ModeCard extends StatelessWidget {
  const _ModeCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.onTap,
    this.meta,
    this.strip = false,
  });

  /// The Today's-goal look: a brand-blue strip with the icon and title on
  /// top, the description below.
  final bool strip;
  final IconData icon;
  final String title;
  final String body;
  final String? meta;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    if (strip) {
      final dark = Theme.of(context).brightness == Brightness.dark;
      final rtl = Directionality.of(context) == TextDirection.rtl;
      return Padding(
        padding: const EdgeInsetsDirectional.only(bottom: AimSpacing.componentGap),
        child: Semantics(
          button: true,
          label: title,
          child: Material(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(AimRadius.lg),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: onTap,
              child: Ink(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AimRadius.lg),
                  border: Border.all(color: surfaces.border),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.primary500.withValues(alpha: dark ? 0.18 : 0.10),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      padding: const EdgeInsetsDirectional.symmetric(
                          horizontal: AimSpacing.space16, vertical: 10),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: AlignmentDirectional.centerStart,
                          end: AlignmentDirectional.centerEnd,
                          colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(icon, size: 20, color: Colors.white),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              title,
                              style: AimTextStyles.bodyMd.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          Icon(
                            rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                            color: Colors.white,
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                      child: Text(
                        body,
                        style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsetsDirectional.only(bottom: AimSpacing.componentGap),
      child: AIMCard(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(color: soft.primary, shape: BoxShape.circle),
                child: Icon(icon, color: soft.onPrimary),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AimTextStyles.bodyLg.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(body, style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted)),
                  ],
                ),
              ),
              if (meta != null) ...[
                const SizedBox(width: AimSpacing.space8),
                Container(
                  padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: surfaces.border),
                  ),
                  child: Text(meta!, style: AimTextStyles.caption.copyWith(fontWeight: FontWeight.w700)),
                ),
              ],
              Icon(
                Directionality.of(context) == TextDirection.rtl
                    ? Icons.chevron_left_rounded
                    : Icons.chevron_right_rounded,
                color: surfaces.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
