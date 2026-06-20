// Phase 6 — P6-112 / Phase 13 — P13-053
// Notifications feature barrel.
//
// Backend authority: notification delivery, read/unread state, and push
// token management are never computed in Flutter.
//
// P13-055 adds the real inbox UI (NotificationInboxPage). The placeholder
// page is kept exported for now until app-level routing is wired to the
// real page, and until preferences/reminder/badge screens (P13-056..P13-059)
// land.
//
// P13-054: device token registration/disable flow lives in
// DeviceTokenNotifier. It only relays a platform push token to the
// backend — obtaining the token from a push messaging SDK is out of
// scope here.

export 'ui/pages/notifications_placeholder_page.dart';
export 'ui/pages/notification_inbox_page.dart';
export 'ui/pages/notification_detail_page.dart';
export 'data/models/notification_models.dart';
export 'data/datasources/notification_datasources.dart';
export 'data/repository/repo_impl/notification_repository_impl.dart';
export 'logic/entity/notification_entities.dart';
export 'logic/repository/notification_repository.dart';
export 'logic/provider/notification_providers.dart';
export 'logic/provider/notification_inbox_notifier.dart';
export 'logic/provider/device_token_notifier.dart';
