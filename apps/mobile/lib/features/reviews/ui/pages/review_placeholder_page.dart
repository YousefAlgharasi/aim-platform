import 'package:flutter/material.dart';

class ReviewPlaceholderPage extends StatelessWidget {
  const ReviewPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Review')),
      body: const Center(child: Text('Review placeholder')),
    );
  }
}
