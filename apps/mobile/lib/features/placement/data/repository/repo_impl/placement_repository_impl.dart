// Phase 4 — P4-061
// Placement repository implementation stub.
//
// Scope: Placement Test phase only.
// Implementation added in P4-064.
// Flutter must not calculate placement score, level, skill mastery,
// weakness map, or initial path. All results come from the backend.

import '../../../logic/repository/placement_repository.dart';
import '../../datasources/placement_remote_datasource.dart';

class PlacementRepositoryImpl implements PlacementRepository {
  final PlacementRemoteDatasource remoteDatasource;

  const PlacementRepositoryImpl({required this.remoteDatasource});

  // Placeholder — methods added in P4-064
}
