import 'package:flutter/material.dart';

import '../../../home/ui/pages/home_placeholder_page.dart';
import '../../../lessons/ui/pages/learn_placeholder_page.dart';
import '../../../profile/ui/pages/profile_placeholder_page.dart';
import '../../../progress/ui/pages/progress_placeholder_page.dart';
import '../../../reviews/ui/pages/review_placeholder_page.dart';

class MainShellPage extends StatefulWidget {
  const MainShellPage({super.key});

  @override
  State<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends State<MainShellPage> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = [
    HomePlaceholderPage(),
    LearnPlaceholderPage(),
    ReviewPlaceholderPage(),
    ProgressPlaceholderPage(),
    ProfilePlaceholderPage(),
  ];

  void _selectTab(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _selectTab,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Learn',
          ),
          NavigationDestination(
            icon: Icon(Icons.replay_outlined),
            selectedIcon: Icon(Icons.replay),
            label: 'Review',
          ),
          NavigationDestination(
            icon: Icon(Icons.insights_outlined),
            selectedIcon: Icon(Icons.insights),
            label: 'Progress',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
