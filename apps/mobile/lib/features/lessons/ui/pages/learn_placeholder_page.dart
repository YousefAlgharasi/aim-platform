import 'package:flutter/material.dart';

class LearnPlaceholderPage extends StatelessWidget {
  const LearnPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Learn')),
      body: const Center(child: Text('Learn placeholder')),
    );
  }
}
