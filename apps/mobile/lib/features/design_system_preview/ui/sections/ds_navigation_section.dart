import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSNavigationSection extends StatefulWidget {
  const DSNavigationSection({super.key});

  @override
  State<DSNavigationSection> createState() => _DSNavigationSectionState();
}

class _DSNavigationSectionState extends State<DSNavigationSection> {
  String _segValue = 'all';
  String _tabValue = 'vocab';
  int _navValue = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Gradient Hero Header
        DSSection(
          title: l10n.dsPreviewSectionGradientHeroHeader,
          children: [
            ClipRRect(
              borderRadius: AimRadius.borderMd,
              child: AIMGradientHeroHeader(
                title: 'Good evening, Sara',
                subtitle: 'Keep your 5-day streak going',
                trailing: IconButton(
                  icon: const Icon(
                    Icons.notifications_outlined,
                    color: AimColors.neutral0,
                  ),
                  onPressed: () {},
                ),
              ),
            ),
          ],
        ),
        // App Drawer — needs its own nested Scaffold to open from, since
        // this preview screen's own Scaffold has no drawer attached.
        DSSection(
          title: l10n.dsPreviewSectionAppDrawer,
          children: [
            SizedBox(
              height: 120,
              child: Scaffold(
                backgroundColor: Colors.transparent,
                drawer: AIMAppDrawer(
                  header: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space16),
                    child: Text(
                      'Sara Ahmed',
                      style: AimTextStyles.title,
                    ),
                  ),
                  items: [
                    AIMDrawerItemData(
                      icon: const Icon(Icons.home_outlined),
                      label: l10n.shellNavHome,
                      selected: true,
                      onTap: () {},
                    ),
                    AIMDrawerItemData(
                      icon: const Icon(Icons.school_outlined),
                      label: l10n.shellNavLearn,
                      onTap: () {},
                    ),
                    AIMDrawerItemData(
                      icon: const Icon(Icons.settings_outlined),
                      label: l10n.dsPreviewNavSettings,
                      onTap: () {},
                    ),
                  ],
                ),
                body: Builder(
                  builder: (context) => AIMButton(
                    variant: AIMButtonVariant.outline,
                    onPressed: () => Scaffold.of(context).openDrawer(),
                    child: Text(l10n.dsPreviewOpenDrawerButton),
                  ),
                ),
              ),
            ),
          ],
        ),
        // Notifications Sheet
        DSSection(
          title: l10n.dsPreviewSectionNotificationsSheet,
          children: [
            Builder(
              builder: (context) => AIMButton(
                variant: AIMButtonVariant.outline,
                onPressed: () => showModalBottomSheet<void>(
                  context: context,
                  isScrollControlled: true,
                  builder: (_) => AIMNotificationsSheet(
                    notifications: [
                      const AIMNotificationItemData(
                        id: '1',
                        title: 'Review due: Past Simple',
                        body: '3 cards ready for review today.',
                        timeLabel: '2h ago',
                      ),
                      AIMNotificationItemData(
                        id: '2',
                        title: 'Achievement unlocked',
                        body: 'You completed a 5-day streak!',
                        timeLabel: l10n.commonYesterday,
                        read: true,
                      ),
                    ],
                  ),
                ),
                child: Text(l10n.dsPreviewShowNotificationsButton),
              ),
            ),
          ],
        ),
        // Top App Bar
        DSSection(
          title: l10n.dsPreviewSectionTopAppBar,
          children: [
            ClipRRect(
              borderRadius: AimRadius.borderMd,
              child: SizedBox(
                height: AimSizes.topBarHeight,
                child: AIMTopAppBar(
                  title: 'Lesson 3',
                  onBack: () {},
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.more_vert),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
            ClipRRect(
              borderRadius: AimRadius.borderMd,
              child: SizedBox(
                height: AimSizes.topBarHeight,
                child: AIMTopAppBar(
                  title: l10n.dsPreviewCenteredTitleDemo,
                  centerTitle: true,
                  onBack: () {},
                ),
              ),
            ),
          ],
        ),
        // Segmented Control
        DSSection(
          title: l10n.dsPreviewSectionSegmentedControl,
          children: [
            AIMSegmentedControl<String>(
              fullWidth: true,
              value: _segValue,
              onChanged: (v) => setState(() => _segValue = v),
              items: [
                AIMSegmentedOption(value: 'all', label: l10n.dsPreviewSegAll),
                AIMSegmentedOption(
                  value: 'vocab',
                  label: l10n.placementSkillVocabulary,
                ),
                AIMSegmentedOption(
                  value: 'grammar',
                  label: l10n.placementSkillGrammar,
                ),
              ],
            ),
          ],
        ),
        // Tabs
        DSSection(
          title: l10n.dsPreviewSectionTabs,
          children: [
            AIMTabs<String>(
              value: _tabValue,
              onChanged: (v) => setState(() => _tabValue = v),
              items: [
                AIMTabItem(
                  value: 'vocab',
                  label: l10n.placementSkillVocabulary,
                ),
                AIMTabItem(value: 'grammar', label: l10n.placementSkillGrammar),
                AIMTabItem(value: 'speaking', label: l10n.dsPreviewSkillSpeaking),
              ],
            ),
          ],
        ),
        // Bottom Nav
        DSSection(
          title: l10n.dsPreviewSectionBottomNavigation,
          children: [
            ClipRRect(
              borderRadius: AimRadius.borderMd,
              child: AIMBottomNav<int>(
                useSafeArea: false,
                value: _navValue,
                onChanged: (v) => setState(() => _navValue = v),
                items: [
                  AIMBottomNavDestination(
                    value: 0,
                    label: l10n.shellNavHome,
                    icon: const Icon(Icons.home_outlined),
                    activeIcon: const Icon(Icons.home),
                  ),
                  AIMBottomNavDestination(
                    value: 1,
                    label: l10n.shellNavLearn,
                    icon: const Icon(Icons.school_outlined),
                    activeIcon: const Icon(Icons.school),
                    badge: '3',
                  ),
                  AIMBottomNavDestination(
                    value: 2,
                    label: l10n.shellNavReview,
                    icon: const Icon(Icons.replay_outlined),
                    activeIcon: const Icon(Icons.replay),
                  ),
                  AIMBottomNavDestination(
                    value: 3,
                    label: l10n.shellNavProgress,
                    icon: const Icon(Icons.bar_chart_outlined),
                    activeIcon: const Icon(Icons.bar_chart),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
