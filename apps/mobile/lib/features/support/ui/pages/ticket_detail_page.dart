// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Ticket" (54)
//   docs/design/ui-for-all-system-mobile/screenshots/light/54-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/54-screen.png
//
// Displays ticket detail and lets the user add a follow-up comment.
//
// Wired to the real GET /support-tickets/:id and
// POST /support-tickets/:id/comments endpoints via ticketDetailProvider
// (SupportRemoteDatasourceImpl).
//
// Deviation from the mockup: the design shows a short ticket number
// ("#4821") in the meta line. SupportTicket has no such field — only a
// full `id` — so it's not shown; fabricating a short number would
// misrepresent the real ticket id.
//
// Note: the backend has no endpoint to list a ticket's existing comments —
// only to add one (see support_remote_datasource_impl.dart). So this screen
// shows the ticket info and lets the user post a new comment, but cannot
// display comment history.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';

import '../../logic/provider/support_provider.dart';

class TicketDetailPage extends ConsumerStatefulWidget {
  final String ticketId;

  const TicketDetailPage({super.key, required this.ticketId});

  @override
  ConsumerState<TicketDetailPage> createState() => _TicketDetailPageState();

  /// Builds the ticket info header card.
  static Widget buildTicketInfoCard({
    required BuildContext context,
    required String subject,
    required String description,
    required String category,
    required String severity,
    required String status,
    required DateTime createdAt,
  }) {
    final surfaces = aimSurfacesOf(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AIMBadge(
                tone: _statusTone(status),
                pill: true,
                child: Text(_statusLabel(status)),
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  '${_titleCase(category)} · ${_titleCase(severity)}',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            subject,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            description,
            style:
                AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }

  /// Builds a single comment bubble.
  static Widget buildCommentBubble({
    required BuildContext context,
    required String authorName,
    required String body,
    required bool isStaff,
    required DateTime createdAt,
  }) {
    final surfaces = aimSurfacesOf(context);
    final bubbleColor = isStaff ? surfaces.surfaceSunken : AimColors.primary500;
    final textColor = isStaff ? surfaces.textPrimary : AimColors.neutral0;

    return Align(
      alignment: isStaff ? AlignmentDirectional.centerStart : AlignmentDirectional.centerEnd,
      child: Container(
        margin: EdgeInsetsDirectional.only(
          start: isStaff ? 0 : 48,
          end: isStaff ? 48 : 0,
          bottom: AimSpacing.componentGap,
        ),
        padding: const EdgeInsets.all(AimSpacing.componentGap),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: AimRadius.borderLg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              body,
              style: AimTextStyles.bodyMd.copyWith(color: textColor),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              '$authorName · ${_formatTimestamp(createdAt)}',
              style: AimTextStyles.caption.copyWith(
                color: isStaff
                    ? surfaces.textMuted
                    : AimColors.neutral0.withValues(alpha: 0.75),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static AIMBadgeTone _statusTone(String status) => switch (status) {
        'open' => AIMBadgeTone.info,
        'in_progress' => AIMBadgeTone.warning,
        'resolved' || 'closed' => AIMBadgeTone.success,
        _ => AIMBadgeTone.neutral,
      };

  static String _statusLabel(String status) => _titleCase(status);

  static String _titleCase(String value) {
    final words = value.split('_');
    return words
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  static String _formatTimestamp(DateTime dt) {
    final local = dt.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '${_months[local.month - 1]} ${local.day} · $hour:$minute';
  }
}

class _TicketDetailPageState extends ConsumerState<TicketDetailPage> {
  final _commentController = TextEditingController();
  bool _isPosting = false;
  String? _postError;

  // Comments posted by this device during this screen visit — the backend
  // has no endpoint to list existing comments (see file header), so this is
  // the only comment history this screen can honestly show.
  final List<({String body, DateTime createdAt})> _postedComments = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => ref.read(ticketDetailProvider.notifier).load(widget.ticketId),
    );
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _postComment() async {
    final body = _commentController.text.trim();
    if (body.isEmpty) return;

    setState(() {
      _isPosting = true;
      _postError = null;
    });

    final comment = await ref
        .read(ticketDetailProvider.notifier)
        .addComment(widget.ticketId, body);

    if (!mounted) return;
    setState(() {
      _isPosting = false;
      if (comment != null) {
        _postedComments.add((body: comment.body, createdAt: comment.createdAt));
        _commentController.clear();
      } else {
        _postError = 'Could not send your comment. Please try again.';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final state = ref.watch(ticketDetailProvider);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _TicketDetailHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading ticket',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: () =>
                      ref.read(ticketDetailProvider.notifier).load(widget.ticketId),
                ),
              AppAsyncSuccess(:final data) => ListView(
                  padding: const EdgeInsets.symmetric(
                    vertical: AimSpacing.sectionGap,
                  ),
                  children: [
                    TicketDetailPage.buildTicketInfoCard(
                      context: context,
                      subject: data.subject,
                      description: data.description,
                      category: data.category,
                      severity: data.severity,
                      status: data.status,
                      createdAt: data.createdAt,
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),
                    if (_postedComments.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AimSpacing.screenPaddingMobile,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            for (final comment in _postedComments)
                              TicketDetailPage.buildCommentBubble(
                                context: context,
                                authorName: 'You',
                                body: comment.body,
                                isStaff: false,
                                createdAt: comment.createdAt,
                              ),
                          ],
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AimSpacing.screenPaddingMobile,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AIMTextarea(
                            label: 'Add a comment',
                            controller: _commentController,
                            placeholder: 'Write a follow-up message...',
                            rows: 3,
                            error: _postError,
                          ),
                          const SizedBox(height: AimSpacing.componentGap),
                          AIMGradientButton(
                            label: 'Send',
                            onPressed: _isPosting ? null : _postComment,
                            loading: _isPosting,
                            fullWidth: true,
                            semanticLabel: 'Send comment',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
            },
          ),
        ],
      ),
    );
  }
}

class _TicketDetailHeader extends StatelessWidget {
  const _TicketDetailHeader();

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
              'Ticket',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
