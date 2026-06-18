// Phase 6 — P6-079
// LessonDetailPage — lesson detail screen MVP.
//
// Displays lesson metadata (title, description) and a list of its published
// assets via [lessonDetailProvider]. Actual media rendering (image/audio/
// video) is deferred to P6-080 (LessonContentRenderer).
//
// Security rules:
// - lessonId is always the backend-supplied value from LessonModel; never
//   from user input or local computation.
// - Flutter never computes type, status, order, or asset values.
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Column/ListView throughout.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - LessonAssetTile uses CrossAxisAlignment.start in a Row (RTL-safe).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

/// Lesson detail screen MVP.
///
/// Expects route arguments: `{'lessonId': String, 'lessonTitle': String}`.
/// [lessonId] must be backend-supplied; never constructed from user input.
class LessonDetailPage extends ConsumerStatefulWidget {
  const LessonDetailPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  /// Backend-supplied lesson UUID from the prior LessonModel response.
  final String lessonId;

  /// Display title for the AppBar (from the prior LessonModel).
  final String lessonTitle;

  @override
  ConsumerState<LessonDetailPage> createState() => _LessonDetailPageState();
}

class _LessonDetailPageState extends ConsumerState<LessonDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonDetailProvider.notifier).load(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(lessonDetailProvider.notifier).refresh(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonDetailProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.lessonTitle),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: 'Loading lesson',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _LessonDetailContent(
            detail: data,
            onRefresh: _refresh,
          ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: 'Loading lesson',
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _LessonDetailContent extends StatelessWidget {
  const _LessonDetailContent({
    required this.detail,
    required this.onRefresh,
  });

  final LessonDetail detail;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          // Lesson description
          if (detail.lesson.description.isNotEmpty) ...[
            Text(
              detail.lesson.description,
              style: AimTextStyles.body.copyWith(color: surfaces.textSecondary),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],

          // Assets section
          if (detail.hasNoContent)
            AIMEmptyState(
              icon: const Icon(Icons.play_lesson_outlined),
              title: 'No content yet',
              subtitle: 'Published lesson content will appear here.',
            )
          else ...[
            Text(
              'Content',
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            ...detail.assets.map(
              (asset) => Padding(
                padding:
                    const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: LessonAssetTile(asset: asset),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
