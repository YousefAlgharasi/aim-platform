// P4-052: PlacementGatePage — first-login gate.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   Shown once (per PlacementGateNotifier/backend student_profiles
//   .placement_decision) to a student who has never taken the placement
//   test and has no learning progress yet. Offers exactly two choices:
//     - "Take the placement test" → PlacementIntroPage / PlacementStartPage.
//     - "Start from scratch"      → main shell (level 1 / default curriculum).
//   The choice is persisted server-side so this screen never shows again.
//
// Security rules:
// - The backend is the sole authority for persisting the decision — this
//   page only calls PlacementRepository.setPlacementDecision.
// - No scoring, CEFR level, or curriculum logic computed here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../logic/provider/placement_gate_notifier.dart';
import '../../logic/provider/placement_provider.dart';

final placementGateProvider =
    StateNotifierProvider.autoDispose<PlacementGateNotifier, PlacementGateState>(
  (ref) => PlacementGateNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);

class PlacementGatePage extends ConsumerStatefulWidget {
  const PlacementGatePage({super.key});

  @override
  ConsumerState<PlacementGatePage> createState() => _PlacementGatePageState();
}

class _PlacementGatePageState extends ConsumerState<PlacementGatePage> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementGateProvider);
    final surfaces = aimSurfacesOf(context);

    ref.listen<PlacementGateState>(placementGateProvider, (_, next) {
      if (next is PlacementGateDecided && context.mounted) {
        if (next.decision == 'take_placement') {
          context.go(AppRoutePaths.placementIntro);
        } else {
          context.go(AppRoutePaths.home);
        }
      }
    });

    final isChoosing = state is PlacementGateChecking;

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Welcome!',
                style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.space12),
              Text(
                'Would you like to take a short placement test so we can find '
                'the right level for you, or start from the beginning?',
                style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              AIMGradientButton(
                label: 'Take the placement test',
                gradient: AimGradients.gzHero,
                fullWidth: true,
                loading: isChoosing,
                semanticLabel: 'Take the placement test',
                onPressed: isChoosing ? null : () => _choose('take_placement'),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              OutlinedButton(
                onPressed: isChoosing ? null : () => _choose('start_from_scratch'),
                child: const Text('Start from scratch'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _choose(String decision) {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementGateProvider.notifier).choose(token, decision);
  }
}
