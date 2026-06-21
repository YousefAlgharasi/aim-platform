import 'package:flutter/material.dart';
import '../../logic/provider/microphone_permission_provider.dart';

class MicrophonePermissionGate extends StatefulWidget {
  final Widget child;
  final MicrophonePermissionProvider permissionProvider;

  const MicrophonePermissionGate({
    super.key,
    required this.child,
    required this.permissionProvider,
  });

  @override
  State<MicrophonePermissionGate> createState() => _MicrophonePermissionGateState();
}

class _MicrophonePermissionGateState extends State<MicrophonePermissionGate> {
  @override
  void initState() {
    super.initState();
    widget.permissionProvider.checkPermission();
    widget.permissionProvider.addListener(_onPermissionChange);
  }

  @override
  void dispose() {
    widget.permissionProvider.removeListener(_onPermissionChange);
    super.dispose();
  }

  void _onPermissionChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.permissionProvider.state;

    if (state == MicrophonePermissionState.granted) {
      return widget.child;
    }

    final isArabic = Directionality.of(context) == TextDirection.rtl;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.mic_off, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              isArabic
                  ? 'يحتاج المعلم الصوتي إلى إذن الميكروفون'
                  : 'Voice Teacher needs microphone access',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              isArabic
                  ? 'يرجى السماح بالوصول إلى الميكروفون للتحدث مع المعلم'
                  : 'Please allow microphone access to talk with the teacher',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            if (state == MicrophonePermissionState.permanentlyDenied)
              ElevatedButton(
                onPressed: () => widget.permissionProvider.openSettings(),
                child: Text(isArabic ? 'فتح الإعدادات' : 'Open Settings'),
              )
            else
              ElevatedButton(
                onPressed: () => widget.permissionProvider.requestPermission(),
                child: Text(isArabic ? 'السماح بالميكروفون' : 'Allow Microphone'),
              ),
          ],
        ),
      ),
    );
  }
}
