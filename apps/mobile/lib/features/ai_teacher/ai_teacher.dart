// Phase 6 — P6-106
// AI Teacher feature barrel.
//
// SHELL RULES (P6-105):
// - No AI provider imports.
// - No AIM Engine calls from Flutter.
// - P8-085 adds the real text chat screen (AiTeacherChatPage).

export 'ui/pages/ai_teacher_placeholder_page.dart';
export 'ui/pages/ai_teacher_chat_page.dart';
export 'ui/pages/ai_teacher_session_history_page.dart';
export 'ui/pages/ai_teacher_settings_page.dart';
export 'ui/widgets/ai_teacher_widgets.dart';
export 'logic/entity/ai_teacher_entities.dart';
export 'logic/entity/ai_teacher_preferences.dart';
export 'logic/provider/ai_teacher_providers.dart';
export 'logic/provider/ai_teacher_preferences_provider.dart';
export 'data/preferences/ai_teacher_preferences_store.dart';
export 'logic/repository/ai_teacher_repositories.dart';
export 'data/models/ai_teacher_chat_models.dart';
export 'data/datasources/ai_teacher_datasources.dart';
export 'data/repository/ai_teacher_repositories.dart';
