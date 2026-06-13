class ClientSafeRoleModel {
  const ClientSafeRoleModel({
    required this.key,
    required this.name,
  });

  factory ClientSafeRoleModel.fromJson(Map<String, dynamic> json) {
    return ClientSafeRoleModel(
      key: json['key'] as String,
      name: json['name'] as String,
    );
  }

  final String key;
  final String name;

  factory ClientSafeRoleModel.fromKey(String key) {
    return ClientSafeRoleModel(
      key: key,
      name: _labelFromKey(key),
    );
  }
}

String _labelFromKey(String key) {
  return key
      .split('_')
      .where((part) => part.isNotEmpty)
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}
