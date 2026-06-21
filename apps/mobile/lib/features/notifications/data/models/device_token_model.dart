// P13-053: Device token model.
//
// The backend is the sole authority on token validity and status. Flutter
// only registers/disables tokens; it never marks a token valid itself.
class DeviceTokenModel {
  const DeviceTokenModel({
    required this.id,
    required this.platform,
    required this.deviceName,
    required this.status,
  });

  factory DeviceTokenModel.fromJson(Map<String, dynamic> json) {
    return DeviceTokenModel(
      id: json['id'] as String,
      platform: json['platform'] as String,
      deviceName: json['device_name'] as String?,
      status: json['status'] as String?,
    );
  }

  final String id;
  final String platform;
  final String? deviceName;
  final String? status;
}
