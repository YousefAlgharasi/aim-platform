import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/dashboard_extras_provider.dart';
import '../widgets/dashboard_sections.dart';

/// The full leaderboard: top learners by XP, this week or all time.
class LeaderboardPage extends ConsumerStatefulWidget {
  const LeaderboardPage({super.key});

  @override
  ConsumerState<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends ConsumerState<LeaderboardPage> {
  String _period = 'week';

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final board = ref.watch(leaderboardProvider((period: _period, limit: 50)));

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(leaderboardProvider),
          child: ListView(
            padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
            children: [
              PageTitleBar(title: context.tr('Top learners', 'أفضل المتعلّمين')),
              const SizedBox(height: AimSpacing.sectionGap),
              FilterPills<String>(
                value: _period,
                onChanged: (v) => setState(() => _period = v),
                options: [
                  FilterPillOption('week', context.tr('This week', 'هذا الأسبوع')),
                  FilterPillOption('all', context.tr('All time', 'كل الأوقات')),
                ],
              ),
              const SizedBox(height: AimSpacing.componentGap),
              board.when(
                loading: () => const Padding(
                  padding: EdgeInsets.all(AimSpacing.space24),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (_, __) => AIMEmptyState(
                  icon: const Icon(Icons.error_outline_rounded),
                  title: context.tr('Could not load the leaderboard.', 'تعذّر تحميل الترتيب.'),
                  action: AIMButton(
                    variant: AIMButtonVariant.secondary,
                    onPressed: () => ref.invalidate(leaderboardProvider),
                    child: Text(context.tr('Retry', 'إعادة المحاولة')),
                  ),
                ),
                data: (b) => AIMCard(
                  child: Padding(
                    padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
                    child: LeaderboardRows(board: b, period: _period),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
