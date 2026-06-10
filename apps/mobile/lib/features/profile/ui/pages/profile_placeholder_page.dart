import 'package:flutter/material.dart';

class ProfilePlaceholderPage extends StatelessWidget {
  const ProfilePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AIM Profile')),
      body: const Center(child: Text('Profile placeholder')),
    );
  }
}
