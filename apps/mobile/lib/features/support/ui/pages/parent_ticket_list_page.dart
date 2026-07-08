// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Parent tickets" (53)
//   docs/design/ui-for-all-system-mobile/screenshots/light/53-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/53-screen.png
//
// Parent ticket list page.
//
// Same pattern as student TicketListPage but for parent role.
// Reuses shared widget builders from TicketListPage.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-36: restyled to match design screen 53 — same layout as
// TicketListPage (screen 52), header title "Parent tickets". See
// ticket_list_page.dart's header comment for the same note on why the
// empty state is shown directly rather than an infinite loading spinner.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

import '../../logic/provider/support_provider.dart';
import 'ticket_list_page.dart';

class ParentTicketListPage extends ConsumerStatefulWidget {
  const ParentTicketListPage({super.key});

  @override
  ConsumerState<ParentTicketListPage> createState() =>
      _ParentTicketListPageState();

  /// Builds an empty state for parent tickets using shared pattern.
  static Widget buildEmptyState(BuildContext context) {
    return const AIMEmptyState(
      icon: Icon(Icons.confirmation_number_outlined),
      title: 'No Support Tickets',
      subtitle: 'Create a ticket if you need help with your account.',
    );
  }

  /// Delegates to shared TicketListPage.buildTicketTile for consistent UI.
  static Widget buildTicketTile({
    required BuildContext context,
    required String ticketId,
    required String subject,
    required String status,
    required String category,
    required String severity,
    required DateTime createdAt,
    VoidCallback? onTap,
  }) {
    return TicketListPage.buildTicketTile(
      context: context,
      ticketId: ticketId,
      subject: subject,
      status: status,
      category: category,
      severity: severity,
      createdAt: createdAt,
      onTap: onTap,
    );
  }
}

class _ParentTicketListPageState extends ConsumerState<ParentTicketListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => ref.read(ticketListProvider.notifier).load(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final state = ref.watch(ticketListProvider);

    // Parent tickets loaded from backend via GET /support-tickets —
    // scoped server-side to the signed-in account, same as the student view.
    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _ParentTicketListHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading your tickets',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: () => ref.read(ticketListProvider.notifier).load(),
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? ParentTicketListPage.buildEmptyState(context)
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        vertical: AimSpacing.sectionGap,
                      ),
                      itemCount: data.length,
                      itemBuilder: (context, index) {
                        final ticket = data[index];
                        return ParentTicketListPage.buildTicketTile(
                          context: context,
                          ticketId: ticket.id,
                          subject: ticket.subject,
                          status: ticket.status,
                          category: ticket.category,
                          severity: ticket.severity,
                          createdAt: ticket.createdAt,
                          onTap: () => context.push(
                            AppRoutePaths.ticketDetail,
                            extra: {'ticketId': ticket.id},
                          ),
                        );
                      },
                    ),
            },
          ),
        ],
      ),
      floatingActionButton: AIMFab(
        semanticLabel: 'Create a support ticket',
        onPressed: () => context.push(AppRoutePaths.createTicket),
        icon: const Icon(Icons.add),
      ),
    );
  }

}

class _ParentTicketListHeader extends StatelessWidget {
  const _ParentTicketListHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Parent tickets',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
