import 'package:flutter/material.dart';

class HomePlaceholderPage extends StatelessWidget {
  const HomePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _FeaturePlaceholderScaffold(title: 'Home placeholder');
  }
}

class _FeaturePlaceholderScaffold extends StatelessWidget {
  const _FeaturePlaceholderScaffold({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Home')),
      body: Center(child: Text(title)),
    );
  }
}
