import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top App Bar
        DSSection(
          title: 'Top App Bar',
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
                  title: 'Centered Title',
                  centerTitle: true,
                  onBack: () {},
                ),
              ),
            ),
          ],
        ),
        // Segmented Control
        DSSection(
          title: 'Segmented Control',
          children: [
            AIMSegmentedControl<String>(
              fullWidth: true,
              value: _segValue,
              onChanged: (v) => setState(() => _segValue = v),
              items: const [
                AIMSegmentedOption(value: 'all', label: 'All'),
                AIMSegmentedOption(value: 'vocab', label: 'Vocabulary'),
                AIMSegmentedOption(value: 'grammar', label: 'Grammar'),
              ],
            ),
          ],
        ),
        // Tabs
        DSSection(
          title: 'Tabs',
          children: [
            AIMTabs<String>(
              value: _tabValue,
              onChanged: (v) => setState(() => _tabValue = v),
              items: const [
                AIMTabItem(value: 'vocab', label: 'Vocabulary'),
                AIMTabItem(value: 'grammar', label: 'Grammar'),
                AIMTabItem(value: 'speaking', label: 'Speaking'),
              ],
            ),
          ],
        ),
        // Bottom Nav
        DSSection(
          title: 'Bottom Navigation',
          children: [
            ClipRRect(
              borderRadius: AimRadius.borderMd,
              child: AIMBottomNav<int>(
                useSafeArea: false,
                value: _navValue,
                onChanged: (v) => setState(() => _navValue = v),
                items: const [
                  AIMBottomNavDestination(
                    value: 0,
                    label: 'Home',
                    icon: Icon(Icons.home_outlined),
                    activeIcon: Icon(Icons.home),
                  ),
                  AIMBottomNavDestination(
                    value: 1,
                    label: 'Learn',
                    icon: Icon(Icons.school_outlined),
                    activeIcon: Icon(Icons.school),
                    badge: '3',
                  ),
                  AIMBottomNavDestination(
                    value: 2,
                    label: 'Review',
                    icon: Icon(Icons.replay_outlined),
                    activeIcon: Icon(Icons.replay),
                  ),
                  AIMBottomNavDestination(
                    value: 3,
                    label: 'Progress',
                    icon: Icon(Icons.bar_chart_outlined),
                    activeIcon: Icon(Icons.bar_chart),
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
