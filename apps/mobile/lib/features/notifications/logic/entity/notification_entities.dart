// P13-053: Notification feature domain entities.
//
// The backend's notification models map 1:1 to the domain shape needed by
// the UI, so the data-layer models double as entities here — no separate
// transformation layer is needed.
export '../../data/models/notification_models.dart';
