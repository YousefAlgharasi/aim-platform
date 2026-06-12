class CurrentUserModel {
  const CurrentUserModel({
    required this.id,
    required this.email,
    this.phone,
    required this.userType,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CurrentUserModel.fromJson(Map<String, dynamic> json) {
    return CurrentUserModel(
      id: json['id'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      userType: json['userType'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  final String id;
  final String? email;
  final String? phone;
  final String userType;
  final String status;
  final String createdAt;
  final String updatedAt;

  bool get isActive => status == 'active';
}
