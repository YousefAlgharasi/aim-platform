import 'package:flutter/material.dart';

class ProgressPlaceholderPage extends StatelessWidget {
  const ProgressPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Progress')),
      body: const Center(child: Text('Progress placeholder')),
    );
  }
}
