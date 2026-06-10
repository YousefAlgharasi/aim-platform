import 'package:flutter/material.dart';

import 'app_route_paths.dart';

class MainShellPlaceholderPage extends StatelessWidget {
  const MainShellPlaceholderPage({super.key});

  static const List<_MainShellDestination> _destinations = [
    _MainShellDestination('Home', AppRoutePaths.home),
    _MainShellDestination('Learn', AppRoutePaths.learn),
    _MainShellDestination('Review', AppRoutePaths.review),
    _MainShellDestination('Progress', AppRoutePaths.progress),
    _MainShellDestination('Profile', AppRoutePaths.profile),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Main Shell')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _destinations.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final destination = _destinations[index];

          return OutlinedButton(
            onPressed: () => Navigator.of(context).pushNamed(destination.path),
            child: Text(destination.label),
          );
        },
      ),
    );
  }
}

class _MainShellDestination {
  const _MainShellDestination(this.label, this.path);

  final String label;
  final String path;
}
