import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/achievement_model.dart';
import '../../logic/provider/achievements_provider.dart';

enum _Filter { all, unlocked, locked }

/// Achievements — the badges the student has unlocked and the ones still to
/// earn. Same layout as the student web app: title, progress panel, filter
/// pills, then one card per badge. Every value comes from the backend.
class AchievementsPage extends ConsumerStatefulWidget {
  const AchievementsPage({super.key});

  @override
  ConsumerState<AchievementsPage> createState() => _AchievementsPageState();
}

class _AchievementsPageState extends ConsumerState<AchievementsPage> {
  _Filter _filter = _Filter.all;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(achievementsProvider.notifier).load(bearerToken: token);
  }

  static String _category(BuildContext context, String value) {
    if (value.isEmpty) return context.tr('Other', 'أخرى');
    final s = value.replaceAll('_', ' ');
    final label = s[0].toUpperCase() + s.substring(1);
    return switch (value.toLowerCase()) {
      'learning' => context.tr(label, 'التعلّم'),
      'streak' || 'streaks' => context.tr(label, 'المواظبة'),
      'assessment' || 'assessments' => context.tr(label, 'التقييمات'),
      'practice' => context.tr(label, 'التدريب'),
      'voice' => context.tr(label, 'الصوت'),
      'vocabulary' => context.tr(label, 'المفردات'),
      'grammar' => context.tr(label, 'القواعد'),
      _ => label,
    };
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(achievementsProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        // Inside the app chrome the top inset is already handled, so this adds none.
        child: switch (state) {
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => _content(context, data),
          _ => AIMFullScreenLoading(
              semanticLabel: context.tr('Loading', 'جارٍ التحميل'),
            ),
        },
      ),
    );
  }

  Widget _content(BuildContext context, List<AchievementModel> items) {
    final surfaces = aimSurfacesOf(context);
    final unlocked = items.where((a) => a.unlocked).toList();
    final locked = items.where((a) => !a.unlocked).toList();
    final visible = switch (_filter) {
      _Filter.unlocked => unlocked,
      _Filter.locked => locked,
      _Filter.all => items,
    };
    final pct = items.isEmpty ? 0 : (unlocked.length / items.length * 100).round();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          PageTitleBar(title: context.tr('Achievements', 'الإنجازات')),
          const SizedBox(height: AimSpacing.sectionGap),
          if (items.isEmpty)
            AIMEmptyState(
              icon: const Icon(Icons.emoji_events_outlined),
              title: context.tr('No achievements yet', 'لا إنجازات بعد'),
              subtitle: context.tr(
                'Achievements will appear here as they become available.',
                'ستظهر الإنجازات هنا عندما تصبح متاحة.',
              ),
            )
          else ...[
            HeroPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          fill(
                            context.tr('{done} of {total} badges unlocked',
                                '{done} من {total} شارات مفتوحة'),
                            {'done': unlocked.length, 'total': items.length},
                          ),
                          style: AimTextStyles.bodyLg.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Text(
                        '$pct%',
                        style: AimTextStyles.caption.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.space12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(100),
                    child: LinearProgressIndicator(
                      value: pct / 100,
                      minHeight: 8,
                      color: Colors.white,
                      backgroundColor: Colors.white.withValues(alpha: 0.25),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            FilterPills<_Filter>(
              value: _filter,
              onChanged: (v) => setState(() => _filter = v),
              options: [
                FilterPillOption(_Filter.all,
                    fill(context.tr('All ({n})', 'الكل ({n})'), {'n': items.length})),
                FilterPillOption(_Filter.unlocked,
                    fill(context.tr('Unlocked ({n})', 'مفتوحة ({n})'), {'n': unlocked.length})),
                FilterPillOption(_Filter.locked,
                    fill(context.tr('Locked ({n})', 'مقفلة ({n})'), {'n': locked.length})),
              ],
            ),
            const SizedBox(height: AimSpacing.componentGap),
            if (visible.isEmpty)
              AIMEmptyState(
                icon: const Icon(Icons.emoji_events_outlined),
                title: _filter == _Filter.unlocked
                    ? context.tr('Nothing unlocked yet', 'لم يُفتح شيء بعد')
                    : context.tr('All unlocked!', 'فتحتَ كل الشارات!'),
                subtitle: _filter == _Filter.unlocked
                    ? context.tr(
                        'Complete lessons and keep your streak going to unlock badges.',
                        'أكمل الدروس وحافظ على سلسلتك لتفتح الشارات.')
                    : context.tr('You have unlocked every available badge.',
                        'لقد فتحت كل الشارات المتاحة.'),
              )
            else
              for (final a in visible) ...[
                AIMCard(
                  child: Padding(
                    padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _category(context, a.category),
                          style: AimTextStyles.caption.copyWith(
                            color: AimColors.primary500,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          a.title,
                          style: AimTextStyles.bodyLg.copyWith(
                            color: surfaces.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          a.description,
                          style: AimTextStyles.bodySm
                              .copyWith(color: surfaces.textMuted),
                        ),
                        const SizedBox(height: AimSpacing.space8),
                        StatusChip(
                          label: a.unlocked
                              ? (a.unlockedAt != null
                                  ? fill(
                                      context.tr('Unlocked {date}', 'فُتحت {date}'),
                                      {'date': _date(context, a.unlockedAt!)})
                                  : context.tr('Unlocked', 'مفتوحة'))
                              : context.tr('Locked', 'مقفلة'),
                          color: a.unlocked
                              ? AimColors.success500
                              : surfaces.textMuted,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.componentGap),
              ],
          ],
          const SizedBox(height: AimSpacing.space24),
        ],
      ),
    );
  }

  static String _date(BuildContext context, String iso) {
    final d = DateTime.tryParse(iso);
    if (d == null) return iso;
    return DateFormat.yMMMd(context.isArabic ? 'ar' : 'en').format(d.toLocal());
  }
}
