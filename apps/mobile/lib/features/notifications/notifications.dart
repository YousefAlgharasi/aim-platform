// Phase 6 — P6-112 / Phase 13 — P13-053
// Notifications feature barrel.
//
// Backend authority: notification delivery, read/unread state, and push
// token management are never computed in Flutter.
//
// The placeholder page remains the current UI entry point until later
// Phase 13 tasks (P13-055..P13-059) replace it with the real inbox,
// preferences, reminder, and badge screens.

export 'ui/pages/notifications_placeholder_page.dart';
export 'data/models/notification_models.dart';
export 'data/datasources/notification_datasources.dart';
export 'data/repository/repo_impl/notification_repository_impl.dart';
export 'logic/entity/notification_entities.dart';
export 'logic/repository/notification_repository.dart';
export 'logic/provider/notification_providers.dart';
