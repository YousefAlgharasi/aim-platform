// LessonContentPage — all of a lesson's published content steps in order.
//
// Opened from the "Content in reading" card on the lesson screen. Shows the
// same steps the web lesson page lists under "What's inside", each rendered by
// LessonContentRenderer. Everything shown is backend-supplied verbatim; this
// page computes nothing.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lessons_entities.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

class LessonContentPage extends ConsumerStatefulWidget {
  const LessonContentPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  final String lessonId;
  final String lessonTitle;

  @override
  ConsumerState<LessonContentPage> createState() => _LessonContentPageState();
}

class _LessonContentPageState extends ConsumerState<LessonContentPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // The lesson screen already loaded this lesson; only fetch when the
      // shared state holds something else (e.g. opened directly).
      final current = ref.read(lessonDetailProvider);
      if (current is AppAsyncSuccess<LessonDetail> &&
          current.data.lesson.id == widget.lessonId) {
        return;
      }
      _load();
    });
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonDetailProvider.notifier).load(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonDetailProvider);
    final title = context.tr('Content in reading', 'المحتوى للقراءة');
    final loading = context.tr('Loading', 'جارٍ التحميل');

    return Scaffold(
      appBar: AIMTopAppBar(
        title: title,
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: switch (state) {
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) when data.lesson.id == widget.lessonId =>
          _Steps(detail: data),
        _ => AIMFullScreenLoading(semanticLabel: loading),
      },
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps({required this.detail});

  final LessonDetail detail;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;

    if (detail.hasNoContent) {
      return AIMEmptyState(
        icon: const Icon(Icons.menu_book_outlined),
        title: context.tr('No content yet', 'لا يوجد محتوى بعد'),
        subtitle: context.tr(
          "This lesson doesn't have any published content steps yet. You can still practice its questions.",
          'لا يحتوي هذا الدرس على خطوات محتوى منشورة بعد. يمكنك مع ذلك التدرب على أسئلتها.',
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
      children: [
        Text(
          detail.lesson.title,
          style: AimTextStyles.h2.copyWith(
            color: surfaces.textPrimary,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          fill(context.tr('{n} steps', '{n} خطوات'), {'n': detail.assets.length}),
          style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
        ),
        const SizedBox(height: 16),
        for (var i = 0; i < detail.assets.length; i++)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
              boxShadow: [
                BoxShadow(
                  color: AimColors.primary500.withValues(alpha: dark ? 0.10 : 0.05),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AimColors.primary500.withValues(alpha: dark ? 0.25 : 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${i + 1}',
                        style: AimTextStyles.caption.copyWith(
                          color: AimColors.primary500,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      fill(context.tr('Step {n}', 'الخطوة {n}'), {'n': i + 1}),
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LessonContentRenderer(asset: detail.assets[i]),
              ],
            ),
          ),
      ],
    );
  }
}
