// Phase 4 — P4-064 (datasource + repository providers) + P4-065 (start provider)
// Placement Riverpod providers.
//
// Scope: Placement Test phase only.
//
// Registers:
//   placementRemoteDatasourceProvider — datasource
//   placementRepositoryProvider       — repository (use this in UI layers)
//   placementStartProvider            — notifier for the placement start page
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/placement/logic/provider/placement_question_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_result_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_section_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_submit_notifier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/placement/data/datasources/placement_remote_datasource.dart';
import 'package:aim_mobile/features/placement/data/datasources/placement_remote_datasource_impl.dart';
import 'package:aim_mobile/features/placement/data/repository/repo_impl/placement_repository_impl.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'placement_start_notifier.dart';

/// Provides the concrete [PlacementRemoteDatasource].
/// Consumers should depend on [placementRepositoryProvider] instead.
final placementRemoteDatasourceProvider =
    Provider<PlacementRemoteDatasource>((ref) {
  return PlacementRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [PlacementRepository] used by notifiers and pages.
final placementRepositoryProvider = Provider<PlacementRepository>((ref) {
  return PlacementRepositoryImpl(
    datasource: ref.watch(placementRemoteDatasourceProvider),
  );
});

/// Notifier for the placement start page.
/// Manages loading the active test and starting a new attempt.
final placementStartProvider =
    StateNotifierProvider.autoDispose<PlacementStartNotifier, PlacementStartState>(
  (ref) => PlacementStartNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);


/// Notifier for the placement section page.
/// Manages loading sections and tracking the current section index.
final placementSectionProvider = StateNotifierProvider.autoDispose<
    PlacementSectionNotifier, PlacementSectionState>(
  (ref) => PlacementSectionNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);



/// Notifier for the placement question page.
/// Manages loading questions, tracking current question, and submitting answers.
final placementQuestionProvider = StateNotifierProvider.autoDispose<
    PlacementQuestionNotifier, PlacementQuestionState>(
  (ref) => PlacementQuestionNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);



/// Notifier for the placement submit/complete page.
/// Manages calling POST /placement/attempts/:id/complete and navigating to result.
final placementSubmitProvider = StateNotifierProvider.autoDispose<
    PlacementSubmitNotifier, PlacementSubmitState>(
  (ref) => PlacementSubmitNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);



/// Notifier for the placement result page.
/// Fetches the backend result with polling until attempt is completed.
final placementResultProvider = StateNotifierProvider.autoDispose<
    PlacementResultNotifier, PlacementResultState>(
  (ref) => PlacementResultNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);

// Phase 6 — P6-046: Placement Required State
import 'placement_required_notifier.dart';

/// App-level provider that detects whether the student must complete
/// placement before accessing regular content.
///
/// Call [PlacementRequiredNotifier.check] after sign-in to gate access.
/// The backend is the sole authority for this decision.
final placementRequiredProvider = StateNotifierProvider<
    PlacementRequiredNotifier, PlacementRequiredState>(
  (ref) => PlacementRequiredNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);
