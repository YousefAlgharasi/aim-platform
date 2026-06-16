// Phase 4 — P4-064
// Placement Riverpod providers — datasource + repository.
//
// Scope: Placement Test phase only.
//
// Registers:
//   placementRemoteDatasourceProvider — injects BackendApiClient → PlacementRemoteDatasourceImpl
//   placementRepositoryProvider       — injects datasource → PlacementRepositoryImpl
//
// UI pages and notifiers watch placementRepositoryProvider only.
// Datasource is an implementation detail — not imported directly by the UI layer.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:aim_mobile/features/placement/data/datasources/placement_remote_datasource.dart';
import 'package:aim_mobile/features/placement/data/datasources/placement_remote_datasource_impl.dart';
import 'package:aim_mobile/features/placement/data/repository/repo_impl/placement_repository_impl.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

/// Provides the concrete [PlacementRemoteDatasource].
/// Consumers should depend on [placementRepositoryProvider] instead.
final placementRemoteDatasourceProvider =
    Provider<PlacementRemoteDatasource>((ref) {
  return PlacementRemoteDatasourceImpl(
    apiClient: ref.watch(backendApiClientProvider),
  );
});

/// Provides the [PlacementRepository] used by notifiers and pages.
final placementRepositoryProvider = Provider<PlacementRepository>((ref) {
  return PlacementRepositoryImpl(
    datasource: ref.watch(placementRemoteDatasourceProvider),
  );
});
