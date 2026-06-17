import 'package:aim_mobile/features/design_system_preview/ui/pages/ds_preview_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


void main() {
  runApp(
    const ProviderScope(
      child: DSPreviewPage(),
      // child: AimMobileApp(),
    ),
  );
}
