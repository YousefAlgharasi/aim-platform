class SupportTicket {
  final String id;
  final String userId;
  final String category;
  final String severity;
  final String subject;
  final String description;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SupportTicket({
    required this.id,
    required this.userId,
    required this.category,
    required this.severity,
    required this.subject,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'] as String,
      // Backend field is `requesterId` (services/backend-api/.../operations.entities.ts).
      userId: json['requesterId'] as String,
      category: json['category'] as String,
      severity: json['severity'] as String,
      subject: json['subject'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  bool get isOpen => status == 'open' || status == 'in_progress';
}

class TicketComment {
  final String id;
  final String ticketId;
  final String authorId;
  final String body;
  final String visibility;
  final DateTime createdAt;

  const TicketComment({
    required this.id,
    required this.ticketId,
    required this.authorId,
    required this.body,
    required this.visibility,
    required this.createdAt,
  });

  // Backend (services/backend-api/.../support-ticket.controller.ts) has no
  // author display name or staff flag — only `authorId`. Whether a comment
  // is "staff" is derived by the caller comparing `authorId` to the current
  // user's id (see TicketDetailPage), not fabricated here.
  factory TicketComment.fromJson(Map<String, dynamic> json) {
    return TicketComment(
      id: json['id'] as String,
      ticketId: json['ticketId'] as String,
      authorId: json['authorId'] as String,
      body: json['body'] as String,
      visibility: json['visibility'] as String? ?? 'public',
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class UserFeedback {
  final String id;
  final String userId;
  final String category;
  final int? rating;
  final String title;
  final String body;
  final DateTime createdAt;

  const UserFeedback({
    required this.id,
    required this.userId,
    required this.category,
    this.rating,
    required this.title,
    required this.body,
    required this.createdAt,
  });

  factory UserFeedback.fromJson(Map<String, dynamic> json) {
    return UserFeedback(
      id: json['id'] as String,
      userId: json['userId'] as String,
      category: json['category'] as String,
      rating: json['rating'] as int?,
      title: json['title'] as String,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class FeatureRequest {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String status;
  final int voteCount;
  final DateTime createdAt;

  const FeatureRequest({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.status,
    required this.voteCount,
    required this.createdAt,
  });

  factory FeatureRequest.fromJson(Map<String, dynamic> json) {
    return FeatureRequest(
      id: json['id'] as String,
      userId: json['userId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      voteCount: json['voteCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class ReleaseNote {
  final String id;
  final String version;
  final String title;
  final String? body;
  final DateTime? publishedAt;

  const ReleaseNote({
    required this.id,
    required this.version,
    required this.title,
    this.body,
    this.publishedAt,
  });

  factory ReleaseNote.fromJson(Map<String, dynamic> json) {
    return ReleaseNote(
      id: json['id'] as String,
      version: json['version'] as String,
      title: json['title'] as String,
      body: json['body'] as String?,
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'] as String)
          : null,
    );
  }
}

class OperationalStatus {
  final String id;
  final String component;
  final String status;
  final String? message;
  final DateTime updatedAt;

  const OperationalStatus({
    required this.id,
    required this.component,
    required this.status,
    this.message,
    required this.updatedAt,
  });

  // Backend (operational-status.controller.ts) has no maintenance-windows
  // list on this endpoint's response — that lives behind a separate
  // maintenance-windows endpoint this datasource does not call, so it's
  // never fabricated here.
  factory OperationalStatus.fromJson(Map<String, dynamic> json) {
    return OperationalStatus(
      id: json['id'] as String,
      component: json['component'] as String,
      status: json['status'] as String,
      message: json['description'] as String?,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  bool get isOperational => status == 'operational';
}

class MaintenanceWindow {
  final String id;
  final String title;
  final String? description;
  final DateTime scheduledStart;
  final DateTime scheduledEnd;
  final String status;

  const MaintenanceWindow({
    required this.id,
    required this.title,
    this.description,
    required this.scheduledStart,
    required this.scheduledEnd,
    required this.status,
  });

  factory MaintenanceWindow.fromJson(Map<String, dynamic> json) {
    return MaintenanceWindow(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      scheduledStart: DateTime.parse(json['scheduledStart'] as String),
      scheduledEnd: DateTime.parse(json['scheduledEnd'] as String),
      status: json['status'] as String,
    );
  }

  bool get isActive => status == 'in_progress';
  bool get isUpcoming => status == 'scheduled';
}
