// The Home sections of the student web dashboard, as phone widgets. Same
// content, same wording (English and Arabic) and — in HomePage — the same
// order the web uses on a phone. Every number comes from the backend.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/assessments/logic/entity/student_deadline.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/provider/dashboard_extras_provider.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_menu_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';

import 'word_of_day_data.dart';

/// "Good morning, Name" and today's date.
class DashboardGreeting extends StatelessWidget {
  const DashboardGreeting({super.key, required this.firstName});

  final String firstName;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hour = DateTime.now().hour;
    final String plain = hour < 12
        ? context.tr('Good morning', 'صباح الخير')
        : hour < 18
            ? context.tr('Good afternoon', 'مساء الخير')
            : context.tr('Good evening', 'مساء الخير');
    final String greeting = firstName.isEmpty
        ? plain
        : context.isArabic
            ? '$plain، $firstName'
            : '$plain, $firstName';
    final date = DateFormat.MMMMEEEEd(context.isArabic ? 'ar' : 'en').format(DateTime.now());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greeting,
          style: AimTextStyles.h1.copyWith(
            color: surfaces.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(date, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted)),
      ],
    );
  }
}

/// A rounded notice with an optional action, in the soft tone of [color].
class _Notice extends StatelessWidget {
  const _Notice({required this.color, required this.text, this.action});

  final Color color;
  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AimRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(text, style: AimTextStyles.bodySm.copyWith(color: surfaces.textPrimary)),
          if (action != null) ...[
            const SizedBox(height: AimSpacing.space8),
            action!,
          ],
        ],
      ),
    );
  }
}

/// The notices above the cards: sections that failed to load, a streak at
/// risk, and "find your level".
class DashboardBanners extends ConsumerStatefulWidget {
  const DashboardBanners({super.key, required this.hasFailedSections, required this.onRetry});

  final bool hasFailedSections;
  final VoidCallback onRetry;

  @override
  ConsumerState<DashboardBanners> createState() => _DashboardBannersState();
}

class _DashboardBannersState extends ConsumerState<DashboardBanners> {
  bool _freezing = false;
  String? _freezeError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken;
      if (token != null && token.isNotEmpty && ref.read(placementMenuProvider) is PlacementMenuIdle) {
        ref.read(placementMenuProvider.notifier).check(token);
      }
    });
  }

  Future<void> _freeze() async {
    setState(() {
      _freezing = true;
      _freezeError = null;
    });
    try {
      await requestStreakFreeze(ref);
      if (mounted) widget.onRetry();
    } catch (_) {
      if (mounted) {
        setState(() => _freezeError =
            context.tr('Could not use a streak freeze.', 'تعذّر استخدام تجميد السلسلة.'));
      }
    } finally {
      if (mounted) setState(() => _freezing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final freeze = ref.watch(dashboardExtrasProvider).valueOrNull?.streakFreeze;
    final placement = ref.watch(placementMenuProvider);
    // "No level yet" is only known once the backend has answered.
    final needsPlacement =
        placement is PlacementMenuReady && placement.result == null;

    final notices = <Widget>[
      if (widget.hasFailedSections)
        _Notice(
          color: AimColors.warning500,
          text: context.tr(
            "Some sections couldn't be loaded.",
            'تعذّر تحميل بعض الأقسام.',
          ),
          action: Align(
            alignment: AlignmentDirectional.centerStart,
            child: AIMButton(
              size: AIMButtonSize.small,
              variant: AIMButtonVariant.secondary,
              onPressed: widget.onRetry,
              child: Text(context.tr('Retry', 'إعادة المحاولة')),
            ),
          ),
        ),
      if (freeze != null && freeze.atRisk)
        _Notice(
          color: AimColors.warning500,
          text: freeze.canUseNow
              ? fill(
                  context.tr(
                    'You missed yesterday. Use a streak freeze to keep your streak. {n} left this month.',
                    'فاتك أمس. استخدم تجميد السلسلة للحفاظ على سلسلتك. المتبقي هذا الشهر: {n}.',
                  ),
                  {'n': freeze.remaining},
                )
              : fill(
                  context.tr(
                    'You missed yesterday and have no streak freezes left this month. A new month brings {n} more.',
                    'فاتك أمس ولم يتبقَّ لك تجميد هذا الشهر. الشهر القادم يمنحك {n} من جديد.',
                  ),
                  {'n': freeze.allowance},
                ),
          action: freeze.canUseNow
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: AIMButton(
                        size: AIMButtonSize.small,
                        loading: _freezing,
                        onPressed: _freezing ? null : _freeze,
                        child: Text(context.tr('Use streak freeze', 'استخدم تجميد السلسلة')),
                      ),
                    ),
                    if (_freezeError != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(_freezeError!,
                            style: AimTextStyles.bodySm.copyWith(fontWeight: FontWeight.w700)),
                      ),
                  ],
                )
              : null,
        ),
      if (needsPlacement)
        _Notice(
          color: AimColors.primary500,
          text: context.tr(
            'Find your level so lessons, courses and practice match you.',
            'اعرف مستواك لتناسبك الدروس والدورات والتدريب.',
          ),
          action: Align(
            alignment: AlignmentDirectional.centerStart,
            child: TextButton(
              onPressed: () => context.push(AppRoutePaths.placementMenu),
              child: Text(context.tr('Take the placement test', 'خذ اختبار تحديد المستوى')),
            ),
          ),
        ),
    ];

    if (notices.isEmpty) return const SizedBox.shrink();
    return Column(
      children: [
        for (final n in notices) ...[n, const SizedBox(height: AimSpacing.componentGap)],
      ],
    );
  }
}

/// Today's word with its meaning and a one-tap "Add to my words". The word
/// follows the learner's level and the date.
class WordOfDayCard extends ConsumerStatefulWidget {
  const WordOfDayCard({super.key});

  @override
  ConsumerState<WordOfDayCard> createState() => _WordOfDayCardState();
}

enum _WordState { checking, idle, saving, saved }

class _WordOfDayCardState extends ConsumerState<WordOfDayCard> {
  _WordState _state = _WordState.checking;
  String? _error;
  late DailyWord _entry;

  static String? _bandOf(String? level) {
    final raw = (level ?? '').trim();
    final m = RegExp(r'^([ABC][12])', caseSensitive: false).firstMatch(raw);
    if (m != null) return m.group(1)!.toUpperCase();
    return switch (raw.toLowerCase().replaceAll(RegExp(r'\s+'), '_')) {
      'beginner' => 'A1',
      'elementary' => 'A2',
      'intermediate' => 'B1',
      'upper_intermediate' => 'B2',
      'advanced' => 'C1',
      _ => null,
    };
  }

  @override
  void initState() {
    super.initState();
    _entry = wordOfTheDay(null, DateTime.now());
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkSaved());
  }

  Future<void> _checkSaved() async {
    try {
      final list = await ref.read(learnerToolsApiProvider).listWords();
      final has = list.words.any((w) => w.word.trim().toLowerCase() == _entry.word);
      if (mounted) setState(() => _state = has ? _WordState.saved : _WordState.idle);
    } catch (_) {
      if (mounted) setState(() => _state = _WordState.idle);
    }
  }

  Future<void> _add(String meaning) async {
    setState(() {
      _state = _WordState.saving;
      _error = null;
    });
    try {
      await ref.read(learnerToolsApiProvider).saveWord(
            word: _entry.word,
            meaning: meaning,
            context: _entry.example,
          );
      if (mounted) setState(() => _state = _WordState.saved);
    } catch (_) {
      if (mounted) {
        setState(() {
          _state = _WordState.idle;
          _error = context.tr('Could not save this word.', 'تعذّر حفظ هذه الكلمة.');
        });
      }
    }
  }

  String _pos(BuildContext context, String pos) => switch (pos) {
        'verb' => context.tr('verb', 'فعل'),
        'noun' => context.tr('noun', 'اسم'),
        'adjective' => context.tr('adjective', 'صفة'),
        _ => pos,
      };

  @override
  Widget build(BuildContext context) {
    // The learner's band picks the list; the placement result is read only
    // when it is already loaded (it is not requested just for this card).
    final placement = ref.watch(placementMenuProvider);
    final band = placement is PlacementMenuReady ? _bandOf(placement.result?.estimatedLevel) : null;
    _entry = wordOfTheDay(band, DateTime.now());
    final meaning = context.isArabic ? _entry.ar : _entry.en;

    return HeroPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.tr('Word of the day', 'كلمة اليوم'),
            style: AimTextStyles.bodySm.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            crossAxisAlignment: WrapCrossAlignment.end,
            spacing: 12,
            children: [
              Text(
                _entry.word,
                textDirection: TextDirection.ltr,
                style: AimTextStyles.h1.copyWith(color: Colors.white, fontSize: 34),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  _pos(context, _entry.pos),
                  style: AimTextStyles.bodySm.copyWith(color: Colors.white.withValues(alpha: 0.85)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(meaning, style: AimTextStyles.bodyMd.copyWith(color: Colors.white)),
          const SizedBox(height: 8),
          Text(
            '“${_entry.example}”',
            textDirection: TextDirection.ltr,
            style: AimTextStyles.bodySm.copyWith(
              color: Colors.white.withValues(alpha: 0.9),
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: AimSpacing.space16),
          if (_state == _WordState.saved)
            Container(
              padding: const EdgeInsetsDirectional.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: Colors.white.withValues(alpha: 0.6)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    context.tr('Added to my words', 'تمت الإضافة إلى كلماتي'),
                    style: AimTextStyles.bodyMd.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            )
          else
            FilledButton(
              onPressed: (_state == _WordState.saving || _state == _WordState.checking)
                  ? null
                  : () => _add(meaning),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AimColors.primary500,
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.6),
                minimumSize: const Size(0, 48),
                padding: const EdgeInsetsDirectional.symmetric(horizontal: 28),
                shape: const StadiumBorder(),
              ),
              child: Text(_state == _WordState.saving
                  ? context.tr('Saving…', 'جارٍ الحفظ…')
                  : context.tr('Add to my words', 'أضف إلى كلماتي')),
            ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: AimTextStyles.bodySm.copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
          ],
        ],
      ),
    );
  }
}

/// A figure with its label, optional progress line and hint.
class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value, this.hint, this.bar, this.onTap, this.hintColor});

  final String label;
  final String value;
  final String? hint;
  final int? bar;
  final VoidCallback? onTap;
  final Color? hintColor;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted)),
            const SizedBox(height: 6),
            Text(
              value,
              style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary, fontSize: 30, height: 1),
            ),
            if (bar != null) ...[
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: LinearProgressIndicator(
                  value: bar!.clamp(0, 100) / 100,
                  minHeight: 8,
                  color: AimColors.primary500,
                  backgroundColor: surfaces.surfaceSunken,
                ),
              ),
            ],
            if (hint != null) ...[
              const SizedBox(height: 6),
              Text(
                hint!,
                style: AimTextStyles.bodySm.copyWith(
                  color: hintColor ?? surfaces.textMuted,
                  decoration: onTap != null ? TextDecoration.underline : null,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// XP level, total XP, badges and rank.
class StatsGrid extends StatelessWidget {
  const StatsGrid({super.key, required this.stats});

  final HomeEngagementStats? stats;

  @override
  Widget build(BuildContext context) {
    final s = stats;
    if (s == null) {
      return AIMCard(
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          child: Text(
            fill(context.tr('Could not load {what}.', 'تعذّر تحميل {what}.'),
                {'what': context.tr('stats', 'الإحصائيات')}),
            style: AimTextStyles.bodySm,
          ),
        ),
      );
    }
    final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');
    final tiles = <Widget>[
      _StatTile(
        label: context.tr('XP level', 'مستوى الخبرة'),
        value: nf.format(s.level),
        bar: s.levelProgressPercent,
        hint: s.nextLevel != null && s.nextLevelMinXp != null
            ? fill(
                context.tr('{xp} XP to level {level}', '{xp} نقطة خبرة للوصول إلى المستوى {level}'),
                {
                  'xp': nf.format(math.max(0, s.nextLevelMinXp! - s.totalXp)),
                  'level': nf.format(s.nextLevel),
                },
              )
            : context.tr('Highest level reached', 'تم بلوغ أعلى مستوى'),
      ),
      _StatTile(
        label: context.tr('Total XP', 'إجمالي نقاط الخبرة'),
        value: nf.format(s.totalXp),
        hint: s.xpToday > 0
            ? fill(context.tr('+{n} today', '+{n} اليوم'), {'n': nf.format(s.xpToday)})
            : null,
        hintColor: AimColors.success500,
      ),
      _StatTile(
        label: context.tr('Badges', 'الشارات'),
        value: nf.format(s.badgeCount),
        hint: context.tr('View all', 'عرض الكل'),
        onTap: () => context.push(AppRoutePaths.achievements),
      ),
      _StatTile(
        label: context.tr('Rank', 'الترتيب'),
        value: s.totalXp > 0 ? '' : '—',
        hint: s.totalXp > 0 ? null : context.tr('Earn XP to get ranked', 'اكسب نقاط خبرة لتظهر في الترتيب'),
      ),
    ];
    // "Top 12%" needs the number in its own sentence, so the rank tile is
    // built separately.
    if (s.totalXp > 0) {
      tiles[3] = _StatTile(
        label: context.tr('Rank', 'الترتيب'),
        value: fill(context.tr('Top {pct}%', 'أعلى {pct}%'), {'pct': nf.format(s.rankPercentile)}),
      );
    }

    return Column(
      children: [
        // IntrinsicHeight: the tiles in a row share the taller one's height.
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: tiles[0]),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(child: tiles[1]),
            ],
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: tiles[2]),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(child: tiles[3]),
            ],
          ),
        ),
      ],
    );
  }
}

/// The top learners by XP: this week, or all time.
class LeaderboardCard extends ConsumerStatefulWidget {
  const LeaderboardCard({super.key});

  @override
  ConsumerState<LeaderboardCard> createState() => _LeaderboardCardState();
}

class _LeaderboardCardState extends ConsumerState<LeaderboardCard> {
  String _period = 'week';

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final board = ref.watch(leaderboardProvider((period: _period, limit: 5)));

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              context.tr('Top learners', 'أفضل المتعلّمين'),
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.space8),
            FilterPills<String>(
              value: _period,
              onChanged: (v) => setState(() => _period = v),
              options: [
                FilterPillOption('week', context.tr('This week', 'هذا الأسبوع')),
                FilterPillOption('all', context.tr('All time', 'كل الأوقات')),
              ],
            ),
            const SizedBox(height: AimSpacing.space12),
            board.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(AimSpacing.space16),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => Text(
                fill(context.tr('Could not load {what}.', 'تعذّر تحميل {what}.'),
                    {'what': context.tr('the leaderboard', 'الترتيب')}),
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
              ),
              data: (b) => LeaderboardRows(board: b, period: _period),
            ),
            const SizedBox(height: AimSpacing.space8),
            Divider(height: 1, color: surfaces.divider),
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton(
                onPressed: () => context.push(AppRoutePaths.leaderboard),
                child: Text(context.tr('View all', 'عرض الكل')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The ranked students; the caller's own place follows under a divider when
/// they are below the list.
class LeaderboardRows extends StatelessWidget {
  const LeaderboardRows({super.key, required this.board, required this.period});

  final LeaderboardBoard board;
  final String period;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    if (board.entries.isEmpty) {
      return Text(
        period == 'week'
            ? context.tr(
                'No one has earned XP this week yet. Finish a lesson to take the first spot.',
                'لم يكسب أحد نقاطًا هذا الأسبوع بعد. أنهِ درسًا لتحتل المركز الأول.')
            : context.tr(
                'No one has earned XP yet. Finish a lesson to take the first spot.',
                'لم يكسب أحد نقاطًا بعد. أنهِ درسًا لتحتل المركز الأول.'),
        style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
      );
    }
    final outside = board.you != null && !board.entries.any((e) => e.isYou) ? board.you : null;
    return Column(
      children: [
        for (final e in board.entries) _LeaderRow(entry: e),
        if (outside != null) ...[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Text('···', style: TextStyle(color: surfaces.textMuted)),
          ),
          _LeaderRow(entry: outside),
        ],
      ],
    );
  }
}

class _LeaderRow extends StatelessWidget {
  const _LeaderRow({required this.entry});

  final LeaderboardEntry entry;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');
    final initial = entry.name.trim().isEmpty ? '?' : String.fromCharCode(entry.name.trim().runes.first);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: entry.isYou ? AimColors.primary500.withValues(alpha: 0.10) : null,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(
              nf.format(entry.rank),
              textAlign: TextAlign.center,
              style: AimTextStyles.bodyMd.copyWith(
                color: entry.rank <= 3 ? surfaces.textPrimary : surfaces.textMuted,
                fontWeight: entry.rank <= 3 ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 34,
            height: 34,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: entry.isYou ? AimColors.primary500 : surfaces.surfaceSunken,
            ),
            child: Text(
              initial,
              style: AimTextStyles.bodySm.copyWith(
                color: entry.isYou ? Colors.white : surfaces.textSecondary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    entry.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (entry.isYou) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsetsDirectional.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AimColors.primary500,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      context.tr('You', 'أنت'),
                      style: AimTextStyles.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Text(
            fill(context.tr('{xp} XP', '{xp} نقطة'), {'xp': nf.format(entry.xp)}),
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.fraction, required this.track, required this.fill});

  final double fraction;
  final Color track;
  final Color fill;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = size.width / 2 - 6;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, paint..color = track);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * fraction,
      false,
      paint..color = fill,
    );
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.fraction != fraction || old.track != track || old.fill != fill;
}

String _count(BuildContext context, int n, String enOne, String enMany, String arOne,
    String arTwo, String arFew, String arMany) {
  final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');
  if (!context.isArabic) return '${nf.format(n)} ${n == 1 ? enOne : enMany}';
  if (n == 1) return arOne;
  if (n == 2) return arTwo;
  if (n >= 3 && n <= 10) return '${nf.format(n)} $arFew';
  return '${nf.format(n)} $arMany';
}

/// Today's lesson goal as a ring, with the day streak and streak freezes.
class DailyGoalCard extends ConsumerWidget {
  const DailyGoalCard({super.key, required this.goal});

  final HomeEngagementGoal? goal;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final g = goal;
    if (g == null) {
      return AIMCard(
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          child: Text(
            fill(context.tr('Could not load {what}.', 'تعذّر تحميل {what}.'),
                {'what': context.tr('daily goal', 'الهدف اليومي')}),
            style: AimTextStyles.bodySm,
          ),
        ),
      );
    }
    final freeze = ref.watch(dashboardExtrasProvider).valueOrNull?.streakFreeze;
    final target = math.max(g.targetLessons, 1);
    final met = g.completedToday >= target;
    final fraction = (g.completedToday / target).clamp(0.0, 1.0);
    final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
        child: Column(
          children: [
            Semantics(
              label: context.tr('Daily goal progress', 'تقدّم الهدف اليومي'),
              value: '${(fraction * 100).round()}%',
              child: SizedBox(
                width: 136,
                height: 136,
                child: CustomPaint(
                  painter: _RingPainter(
                    fraction: fraction,
                    track: surfaces.surfaceSunken,
                    fill: met ? AimColors.success500 : AimColors.primary500,
                  ),
                  child: Center(
                    child: Text.rich(
                      TextSpan(
                        text: nf.format(g.completedToday),
                        style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary, fontSize: 34),
                        children: [
                          TextSpan(
                            text: '/${nf.format(target)}',
                            style: AimTextStyles.bodyLg.copyWith(color: surfaces.textMuted),
                          ),
                        ],
                      ),
                      textDirection: TextDirection.ltr,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: AimSpacing.space12),
            Text(
              met
                  ? context.tr('Goal met today', 'تم تحقيق الهدف اليوم')
                  : fill(context.tr('{done}/{total} today', '{done}/{total} اليوم'),
                      {'done': nf.format(g.completedToday), 'total': nf.format(target)}),
              style: AimTextStyles.bodyLg.copyWith(
                color: surfaces.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              fill(context.tr('Daily goal: {lessons}', 'الهدف اليومي: {lessons}'), {
                'lessons': _count(context, target, 'lesson', 'lessons', 'درس واحد', 'درسان', 'دروس', 'درسًا'),
              }),
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
            const SizedBox(height: AimSpacing.space12),
            Divider(height: 1, color: surfaces.divider),
            const SizedBox(height: AimSpacing.space12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.local_fire_department_outlined, size: 20, color: surfaces.textPrimary),
                    const SizedBox(width: 6),
                    Text(
                      _count(context, g.streakDays, 'Day', 'Days', 'يوم', 'يومان', 'أيام', 'يومًا'),
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                if (freeze != null)
                  Text(
                    '❄ ${fill(context.tr('{n} freezes left', 'تبقّى {n} تجميد'), {'n': nf.format(freeze.remaining)})}',
                    style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Today's challenges: each with its status and the place to do it.
class ChallengesCard extends ConsumerWidget {
  const ChallengesCard({super.key, required this.fallback});

  /// The single challenge from the Home load, used when the extras call
  /// has not answered (or the backend only sends one).
  final HomeDailyChallenge? fallback;

  String _title(BuildContext context, String title) => switch (title) {
        'Reach your daily goal' => context.tr(title, 'حقّق هدفك اليومي'),
        'Speaking practice' => context.tr(title, 'تدريب المحادثة'),
        'Write a paragraph' => context.tr(title, 'اكتب فقرة'),
        _ => title,
      };

  String _text(BuildContext context, String d) {
    final m = RegExp(r'^Complete (\d+) lessons today\.$').firstMatch(d);
    if (m != null) {
      final n = int.parse(m.group(1)!);
      if (n >= 3) {
        final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');
        return fill(context.tr(d, 'أكمل {n} دروس اليوم.'), {'n': nf.format(n)});
      }
    }
    return switch (d) {
      'Complete 1 lesson today.' => context.tr(d, 'أكمل درسًا واحدًا اليوم.'),
      'Complete 2 lessons today.' => context.tr(d, 'أكمل درسين اليوم.'),
      'Finish 1 speaking practice today.' => context.tr(d, 'أنهِ جلسة محادثة واحدة اليوم.'),
      'Write and submit 1 paragraph in Practice today.' =>
        context.tr(d, 'اكتب فقرة واحدة وأرسلها في التدريب اليوم.'),
      _ => d,
    };
  }

  void _go(BuildContext context, WidgetRef ref, String key) {
    if (key == 'practice_speaking') {
      context.push(AppRoutePaths.practiceSpeaking);
    } else if (key == 'practice_writing') {
      context.push(AppRoutePaths.practiceWriting);
    } else {
      ref.read(mainShellTabIndexProvider.notifier).state = 1;
      context.go(AppRoutePaths.mainShell);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    var challenges = ref.watch(dashboardExtrasProvider).valueOrNull?.challenges ?? const [];
    if (challenges.isEmpty && fallback != null) {
      final f = fallback!;
      challenges = [
        DashboardChallenge(
          key: f.key,
          title: f.title,
          description: f.description,
          targetCount: f.targetCount,
          progressCount: f.progressCount,
          completed: f.completed,
        ),
      ];
    }
    if (challenges.isEmpty) return const SizedBox.shrink();

    final nf = NumberFormat.decimalPattern(context.isArabic ? 'ar' : 'en');
    final done = challenges.where((c) => c.completed).length;
    final many = challenges.length > 1;

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    many
                        ? context.tr('Daily challenges', 'تحديات اليوم')
                        : context.tr('Daily challenge', 'تحدي اليوم'),
                    style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                  ),
                ),
                Text(
                  '${nf.format(done)}/${nf.format(challenges.length)}',
                  style: AimTextStyles.bodySm.copyWith(
                    color: done == challenges.length ? AimColors.success500 : surfaces.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space8),
            for (final (i, c) in challenges.indexed) ...[
              if (i > 0) Divider(height: AimSpacing.space24, color: surfaces.divider),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    margin: const EdgeInsetsDirectional.only(top: 2, end: 12),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: c.completed ? AimColors.success500 : null,
                      border: c.completed ? null : Border.all(color: surfaces.border, width: 2),
                    ),
                    child: c.completed
                        ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                        : null,
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // A Wrap, like the web's flex-wrap: on a narrow phone the
                        // action drops under the title instead of overflowing.
                        Wrap(
                          alignment: WrapAlignment.spaceBetween,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 12,
                          runSpacing: 4,
                          children: [
                            Text(
                              _title(context, c.title),
                              style: AimTextStyles.bodyMd.copyWith(
                                color: surfaces.textPrimary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (c.completed)
                              Text(
                                context.tr('Completed', 'مكتمل'),
                                style: AimTextStyles.bodySm.copyWith(
                                  color: AimColors.success500,
                                  fontWeight: FontWeight.w600,
                                ),
                              )
                            else
                              GestureDetector(
                                onTap: () => _go(context, ref, c.key),
                                child: Text(
                                  switch (c.key) {
                                    'practice_speaking' => context.tr('Start speaking', 'ابدأ المحادثة'),
                                    'practice_writing' => context.tr('Start writing', 'ابدأ الكتابة'),
                                    _ => context.tr('Go to lessons', 'اذهب إلى الدروس'),
                                  },
                                  style: AimTextStyles.bodySm.copyWith(
                                    color: AimColors.primary500,
                                    fontWeight: FontWeight.w700,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text.rich(
                          TextSpan(
                            text: _text(context, c.description),
                            children: [
                              if (c.targetCount > 1 && !c.completed)
                                TextSpan(
                                  text:
                                      '  ${nf.format(c.progressCount)}/${nf.format(c.targetCount)}',
                                  style: TextStyle(
                                    color: surfaces.textPrimary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                            ],
                          ),
                          style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// XP earned on each day of this week (Monday to Sunday, UTC).
class WeeklyActivityCard extends StatelessWidget {
  const WeeklyActivityCard({super.key, required this.stats});

  final HomeEngagementStats? stats;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final s = stats;
    if (s == null) {
      return AIMCard(
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          child: Text(
            fill(context.tr('Could not load {what}.', 'تعذّر تحميل {what}.'),
                {'what': context.tr('this week', 'هذا الأسبوع')}),
            style: AimTextStyles.bodySm,
          ),
        ),
      );
    }
    final days = s.weeklyActivity;
    final total = days.fold<int>(0, (sum, d) => sum + d.xp);
    if (days.isEmpty || total == 0) {
      return AIMEmptyState(
        icon: const Icon(Icons.bar_chart_rounded),
        title: context.tr('No activity this week', 'لا نشاط هذا الأسبوع'),
        subtitle: context.tr('Complete a lesson to earn XP and fill your week.',
            'أكمل درسًا لتكسب نقاط خبرة وتملأ أسبوعك.'),
      );
    }

    final locale = context.isArabic ? 'ar' : 'en';
    final nf = NumberFormat.decimalPattern(locale);
    final maxXp = days.map((d) => d.xp).fold<int>(1, math.max);
    final today = DateTime.now().toUtc().toIso8601String().substring(0, 10);
    final delta = s.weeklyDeltaPercent;

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  context.tr('This week', 'هذا الأسبوع'),
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                ),
                Flexible(
                  child: Text.rich(
                    TextSpan(
                      text: fill(context.tr('{n} XP', '{n} نقطة خبرة'), {'n': nf.format(total)}),
                      style: TextStyle(color: surfaces.textPrimary, fontWeight: FontWeight.w700),
                      children: [
                        if (delta != null)
                          TextSpan(
                            text:
                                '  ${fill(context.tr('{pct}% vs last week', '{pct}% مقارنة بالأسبوع الماضي'), {'pct': '${delta >= 0 ? '+' : ''}$delta'})}',
                            style: TextStyle(
                              color: delta >= 0 ? AimColors.success500 : AimColors.error500,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                      ],
                    ),
                    textAlign: TextAlign.end,
                    style: AimTextStyles.bodySm,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space12),
            SizedBox(
              height: 150,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (final d in days)
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          SizedBox(
                            height: 16,
                            child: Text(
                              d.xp > 0 ? nf.format(d.xp) : '',
                              style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Expanded(
                            child: Align(
                              alignment: Alignment.bottomCenter,
                              child: Container(
                                width: 22,
                                decoration: BoxDecoration(
                                  color: surfaces.surfaceSunken,
                                  borderRadius: BorderRadius.circular(100),
                                ),
                                alignment: Alignment.bottomCenter,
                                child: FractionallySizedBox(
                                  heightFactor: d.xp > 0
                                      ? math.max(0.08, d.xp / maxXp)
                                      : 0,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: d.date == today
                                          ? AimColors.primary500
                                          : AimColors.primary500.withValues(alpha: 0.5),
                                      borderRadius: BorderRadius.circular(100),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _dayLabel(d.date, locale),
                            style: AimTextStyles.caption.copyWith(
                              color: d.date == today ? surfaces.textPrimary : surfaces.textMuted,
                              fontWeight: d.date == today ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _dayLabel(String date, String locale) {
    final d = DateTime.tryParse('${date}T00:00:00Z');
    return d == null ? date : DateFormat.E(locale).format(d);
  }
}

/// Open and late assessments first (soonest due first), then upcoming ones.
List<StudentDeadlineItem> homeDeadlines(StudentDeadlines d) {
  DateTime due(StudentDeadlineItem x) =>
      DateTime.tryParse(x.extendedClosesAt ?? x.closesAt) ?? DateTime.fromMillisecondsSinceEpoch(0);
  final open = [...d.late, ...d.active]..sort((a, b) => due(a).compareTo(due(b)));
  final upcoming = [...d.upcoming]..sort((a, b) =>
      (DateTime.tryParse(a.opensAt) ?? DateTime.fromMillisecondsSinceEpoch(0))
          .compareTo(DateTime.tryParse(b.opensAt) ?? DateTime.fromMillisecondsSinceEpoch(0)));
  return [...open, ...upcoming].take(4).toList();
}

/// Upcoming assessment deadlines.
class DeadlinesCard extends ConsumerStatefulWidget {
  const DeadlinesCard({super.key});

  @override
  ConsumerState<DeadlinesCard> createState() => _DeadlinesCardState();
}

class _DeadlinesCardState extends ConsumerState<DeadlinesCard> {
  static const _live = {'open', 'active', 'extended', 'late'};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken;
      if (token != null && token.isNotEmpty) {
        ref.read(deadlinesProvider.notifier).load(bearerToken: token);
      }
    });
  }

  String _status(BuildContext context, String s) => switch (s) {
        'upcoming' => context.tr('Upcoming', 'قادم'),
        'open' || 'active' => context.tr('Open', 'مفتوح'),
        'extended' => context.tr('Extended', 'ممدّد'),
        'late' => context.tr('Late', 'متأخر'),
        'missed' => context.tr('Missed', 'فائت'),
        'closed' || 'expired' => context.tr('Closed', 'مغلق'),
        _ => s,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final state = ref.watch(deadlinesProvider);
    final locale = context.isArabic ? 'ar' : 'en';
    final nf = NumberFormat.decimalPattern(locale);

    Widget body;
    if (state is AppAsyncFailure) {
      body = Text(
        fill(context.tr('Could not load {what}.', 'تعذّر تحميل {what}.'),
            {'what': context.tr('deadlines', 'المواعيد النهائية')}),
        style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
      );
    } else if (state is AppAsyncSuccess<StudentDeadlines>) {
      final items = homeDeadlines(state.data);
      body = items.isEmpty
          ? Text(
              context.tr('You have no upcoming deadlines.', 'لا توجد لديك مواعيد نهائية قادمة.'),
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            )
          : Column(
              children: [
                for (final d in items) _deadlineTile(context, d, locale, nf),
              ],
            );
    } else {
      body = const Padding(
        padding: EdgeInsets.all(AimSpacing.space12),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  context.tr('Upcoming deadlines', 'المواعيد النهائية القادمة'),
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                ),
                TextButton(
                  onPressed: () => context.push(AppRoutePaths.assessments),
                  child: Text(context.tr('All assessments', 'كل التقييمات')),
                ),
              ],
            ),
            body,
          ],
        ),
      ),
    );
  }

  Widget _deadlineTile(BuildContext context, StudentDeadlineItem d, String locale, NumberFormat nf) {
    final surfaces = aimSurfacesOf(context);
    final live = _live.contains(d.status);
    final closes = DateTime.tryParse(d.extendedClosesAt ?? d.closesAt)?.toLocal();
    String? dueText;
    var urgent = false;
    if (live && closes != null) {
      final ms = closes.difference(DateTime.now()).inMilliseconds;
      final days = ms ~/ 86400000;
      if (ms < 0) {
        dueText = context.tr('Overdue', 'متأخرة');
        urgent = true;
      } else if (days == 0) {
        dueText = context.tr('Due today', 'الموعد اليوم');
        urgent = true;
      } else if (days == 1) {
        dueText = context.tr('Due tomorrow', 'الموعد غدًا');
        urgent = true;
      } else {
        dueText = fill(context.tr('Due in {n} days', 'الموعد بعد {n} يومًا'), {'n': nf.format(days)});
        urgent = days <= 2;
      }
    }
    String when(String iso) {
      final t = DateTime.tryParse(iso)?.toLocal();
      return t == null ? iso : DateFormat.MMMd(locale).add_jm().format(t);
    }

    return InkWell(
      onTap: () => context.push(
        AppRoutePaths.assessmentDetail,
        extra: {'assessmentId': d.assessmentId, 'assessmentTitle': d.assessmentTitle},
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(border: Border(top: BorderSide(color: surfaces.divider))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _status(context, d.status),
                  style: AimTextStyles.bodySm.copyWith(
                    color: d.status == 'late' ? AimColors.warning500 : surfaces.textMuted,
                    fontWeight: d.status == 'late' ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
                if (dueText != null)
                  Text(
                    dueText,
                    style: AimTextStyles.bodySm.copyWith(
                      color: urgent ? AimColors.error500 : surfaces.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              d.assessmentTitle,
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 2),
            Text(
              d.status == 'upcoming'
                  ? fill(context.tr('Opens {date}', 'يُفتح {date}'), {'date': when(d.opensAt)})
                  : fill(context.tr('Due {date}', 'الموعد النهائي {date}'),
                      {'date': when(d.extendedClosesAt ?? d.closesAt)}),
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
