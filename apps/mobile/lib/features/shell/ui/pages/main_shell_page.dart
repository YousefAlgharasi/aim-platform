import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../home/ui/pages/home_page.dart';
import '../../../lessons/ui/pages/course_list_page.dart';
import '../../../profile/ui/pages/profile_page.dart';
import '../../../progress/ui/pages/progress_page.dart';
import '../../../reviews/ui/pages/review_page.dart';
import '../../logic/main_shell_tab_provider.dart';

/// Main shell page — holds the bottom-navigation [IndexedStack].
///
/// Uses [AIMBottomNav] from the AIM Mobile Design System. Raw [NavigationBar]
/// has been replaced as part of P6-028 component adoption.
///
/// The selected tab is held in [mainShellTabIndexProvider] (rather than
/// local State) so descendant pages — e.g. Home's "Browse Courses" action —
/// can switch tabs directly without reaching into shell-private state.
class MainShellPage extends ConsumerWidget {
  const MainShellPage({super.key});

  static const List<Widget> _screens = [
    HomePage(),
    CourseListPage(),
    ReviewPage(),
    ProgressPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(mainShellTabIndexProvider);

    return Scaffold(
      body: IndexedStack(
        index: selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: AIMBottomNav<int>(
        value: selectedIndex,
        onChanged: (index) =>
            ref.read(mainShellTabIndexProvider.notifier).state = index,
        items: const [
          AIMBottomNavDestination(
            value: 0,
            label: 'Home',
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            semanticLabel: 'Home tab',
          ),
          AIMBottomNavDestination(
            value: 1,
            label: 'Learn',
            icon: Icon(Icons.menu_book_outlined),
            activeIcon: Icon(Icons.menu_book),
            semanticLabel: 'Learn tab',
          ),
          AIMBottomNavDestination(
            value: 2,
            label: 'Review',
            icon: Icon(Icons.replay_outlined),
            activeIcon: Icon(Icons.replay),
            semanticLabel: 'Review tab',
          ),
          AIMBottomNavDestination(
            value: 3,
            label: 'Progress',
            icon: Icon(Icons.insights_outlined),
            activeIcon: Icon(Icons.insights),
            semanticLabel: 'Progress tab',
          ),
          AIMBottomNavDestination(
            value: 4,
            label: 'Profile',
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            semanticLabel: 'Profile tab',
          ),
        ],
      ),
    );
  }
}
