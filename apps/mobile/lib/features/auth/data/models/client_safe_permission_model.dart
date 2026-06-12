class ClientSafePermissionModel {
  const ClientSafePermissionModel({
    required this.id,
    required this.key,
    required this.scope,
    this.description,
  });

  factory ClientSafePermissionModel.fromJson(Map<String, dynamic> json) {
    return ClientSafePermissionModel(
      id: json['id'] as String,
      key: json['key'] as String,
      scope: json['scope'] as String,
      description: json['description'] as String?,
    );
  }

  final String id;
  final String key;
  final String scope;
  final String? description;
}
