// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "My tickets" (52)
//   docs/design/ui-for-all-system-mobile/screenshots/light/52-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/52-screen.png
//
// Displays the user's support tickets fetched from backend.
//
// Shows loading, empty, and populated states.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-36: restyled to match design screen 52 — gradient header ("My
// tickets"), ticket cards with a status pill, gradient FAB (replacing the
// old header icon button) to create a new ticket, wired to
// AppRoutePaths.createTicket.
//
// Wired to the real GET /support-tickets endpoint via ticketListProvider
// (SupportRemoteDatasourceImpl).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

import '../../logic/provider/support_provider.dart';

class TicketListPage extends ConsumerStatefulWidget {
  const TicketListPage({super.key});

  @override
  ConsumerState<TicketListPage> createState() => _TicketListPageState();

  /// Builds a single ticket list item card.
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
    final surfaces = aimSurfacesOf(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
        child: AIMCard(
          interactive: onTap != null,
          onTap: onTap,
          semanticLabel: '$subject, $status',
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subject,
                      style: AimTextStyles.title
                          .copyWith(color: surfaces.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AimSpacing.space2),
                    Text(
                      '${_formatDate(createdAt)} · $category · $severity',
                      style: AimTextStyles.bodySm
                          .copyWith(color: surfaces.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              _buildStatusChip(status),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds an empty state when no tickets exist.
  static Widget buildEmptyState(BuildContext context) {
    return const AIMEmptyState(
      icon: Icon(Icons.confirmation_number_outlined),
      title: 'No Tickets Yet',
      subtitle: 'Create a ticket to get help from our support team.',
    );
  }

  static Widget _buildStatusChip(String status) {
    final AIMBadgeTone tone = switch (status) {
      'open' => AIMBadgeTone.info,
      'in_progress' => AIMBadgeTone.warning,
      'resolved' || 'closed' => AIMBadgeTone.success,
      _ => AIMBadgeTone.neutral,
    };
    return AIMBadge(
      tone: tone,
      pill: true,
      child: Text(_statusLabel(status)),
    );
  }

  static String _statusLabel(String status) {
    final words = status.split('_');
    return words
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  static String _formatDate(DateTime date) =>
      '${_months[date.month - 1]} ${date.day}, ${date.year}';
}

class _TicketListPageState extends ConsumerState<TicketListPage> {
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

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _TicketListHeader(title: 'My tickets'),
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
                  ? TicketListPage.buildEmptyState(context)
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        vertical: AimSpacing.sectionGap,
                      ),
                      itemCount: data.length,
                      itemBuilder: (context, index) {
                        final ticket = data[index];
                        return TicketListPage.buildTicketTile(
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

class _TicketListHeader extends StatelessWidget {
  const _TicketListHeader({required this.title});

  final String title;

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
              title,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
