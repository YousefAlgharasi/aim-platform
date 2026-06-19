import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

enum MicrophonePermissionState {
  unknown,
  granted,
  denied,
  permanentlyDenied,
  restricted,
}

class MicrophonePermissionProvider extends ChangeNotifier {
  MicrophonePermissionState _state = MicrophonePermissionState.unknown;

  MicrophonePermissionState get state => _state;

  bool get isGranted => _state == MicrophonePermissionState.granted;

  Future<void> checkPermission() async {
    final status = await Permission.microphone.status;
    _updateState(status);
  }

  Future<bool> requestPermission() async {
    final status = await Permission.microphone.request();
    _updateState(status);
    return isGranted;
  }

  Future<void> openSettings() async {
    await openAppSettings();
  }

  void _updateState(PermissionStatus status) {
    switch (status) {
      case PermissionStatus.granted:
      case PermissionStatus.limited:
        _state = MicrophonePermissionState.granted;
        break;
      case PermissionStatus.denied:
        _state = MicrophonePermissionState.denied;
        break;
      case PermissionStatus.permanentlyDenied:
        _state = MicrophonePermissionState.permanentlyDenied;
        break;
      case PermissionStatus.restricted:
        _state = MicrophonePermissionState.restricted;
        break;
      default:
        _state = MicrophonePermissionState.unknown;
    }
    notifyListeners();
  }
}
