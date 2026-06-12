class ClientSafeRoleModel {
  const ClientSafeRoleModel({
    required this.id,
    required this.key,
    required this.name,
    this.description,
    required this.isSystem,
  });

  factory ClientSafeRoleModel.fromJson(Map<String, dynamic> json) {
    return ClientSafeRoleModel(
      id: json['id'] as String,
      key: json['key'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      isSystem: json['isSystem'] as bool? ?? false,
    );
  }

  final String id;
  final String key;
  final String name;
  final String? description;
  final bool isSystem;
}
