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

class _Steps extends StatefulWidget {
  const _Steps({required this.detail});

  final LessonDetail detail;

  @override
  State<_Steps> createState() => _StepsState();
}

class _StepsState extends State<_Steps> {
  late final List<GlobalKey> _sectionKeys;

  LessonExplanation? get _ex => widget.detail.lesson.explanation;

  @override
  void initState() {
    super.initState();
    _sectionKeys = List.generate(_ex?.sections.length ?? 0, (_) => GlobalKey());
  }

  void _jumpTo(int i) {
    final ctx = _sectionKeys[i].currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(ctx,
          duration: const Duration(milliseconds: 300), curve: Curves.easeOut, alignment: 0.02);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = widget.detail;
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final ex = _ex;

    if (ex == null && detail.hasNoContent) {
      return AIMEmptyState(
        icon: const Icon(Icons.menu_book_outlined),
        title: context.tr('There is no content for this lesson yet', 'لا يوجد محتوى لهذا الدرس بعد'),
        subtitle: context.tr(
          'You can still practice its questions.',
          'يمكنك مع ذلك التدرب على أسئلته.',
        ),
      );
    }

    final children = <Widget>[
      Text(
        detail.lesson.title,
        style: AimTextStyles.h2.copyWith(
          color: surfaces.textPrimary,
          fontWeight: FontWeight.w800,
        ),
      ),
      const SizedBox(height: 16),
    ];

    if (ex != null) {
      if (ex.overview.isNotEmpty) {
        children.add(Text(
          ex.overview,
          style: AimTextStyles.bodyLg.copyWith(
            color: surfaces.textPrimary,
            fontSize: 17,
            height: 1.55,
          ),
        ));
        children.add(const SizedBox(height: 16));
      }

      if (ex.sections.length > 1) {
        children.add(Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (var i = 0; i < ex.sections.length; i++)
              InkWell(
                borderRadius: BorderRadius.circular(100),
                onTap: () => _jumpTo(i),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: surfaces.surface,
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: surfaces.border),
                  ),
                  child: Text(
                    '${i + 1}. ${ex.sections[i].heading}',
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ));
        children.add(const SizedBox(height: 24));
      }

      for (var i = 0; i < ex.sections.length; i++) {
        final sec = ex.sections[i];
        children.add(Column(
          key: _sectionKeys[i],
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.25 : 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${i + 1}',
                    style: AimTextStyles.bodyMd.copyWith(
                      color: dark ? AimColors.primary300 : AimColors.primary600,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    sec.heading,
                    style: AimTextStyles.h3.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (sec.body.trim().isNotEmpty) _MiniMarkdown(text: sec.body),
            for (final e in sec.examples) ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: BorderRadius.circular(AimRadius.lg),
                  border: Border.all(color: surfaces.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      e.text,
                      style: AimTextStyles.bodyLg.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (e.note != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        e.note!,
                        style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                      ),
                    ],
                  ],
                ),
              ),
            ],
            const SizedBox(height: 28),
          ],
        ));
      }

      if (ex.keyPoints.isNotEmpty) {
        children.add(Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AimColors.primary500.withValues(alpha: dark ? 0.16 : 0.07),
            borderRadius: BorderRadius.circular(AimRadius.lg),
            border: Border.all(color: AimColors.primary500.withValues(alpha: dark ? 0.35 : 0.22)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr('Key points to remember', 'نقاط مهمة للتذكر'),
                style: AimTextStyles.bodyLg.copyWith(
                  color: dark ? AimColors.primary300 : AimColors.primary600,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 10),
              for (final k in ex.keyPoints)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _Bullet(child: Text(
                    k,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textPrimary,
                      height: 1.5,
                    ),
                  )),
                ),
            ],
          ),
        ));
        children.add(const SizedBox(height: 28));
      }

      if (ex.commonMistakes.isNotEmpty) {
        children.add(Text(
          context.tr('Common mistakes', 'أخطاء شائعة'),
          style: AimTextStyles.h3.copyWith(
            color: surfaces.textPrimary,
            fontWeight: FontWeight.w800,
          ),
        ));
        children.add(const SizedBox(height: 12));
        for (final m in ex.commonMistakes) {
          children.add(Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(TextSpan(children: [
                  TextSpan(
                    text: '${context.tr('NOT', 'ليس')}  ',
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.error500,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  TextSpan(
                    text: m.wrong,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                ])),
                const SizedBox(height: 6),
                Text.rich(TextSpan(children: [
                  TextSpan(
                    text: '${context.tr('SAY', 'قل')}  ',
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.success500,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  TextSpan(
                    text: m.right,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ])),
                if (m.why.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    m.why,
                    style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted, height: 1.45),
                  ),
                ],
              ],
            ),
          ));
        }
        children.add(const SizedBox(height: 18));
      }

      if (ex.recap != null) {
        children.add(Container(
          padding: const EdgeInsetsDirectional.only(start: 14),
          decoration: const BoxDecoration(
            border: BorderDirectional(
              start: BorderSide(color: AimColors.primary500, width: 4),
            ),
          ),
          child: Text.rich(TextSpan(children: [
            TextSpan(
              text: '${context.tr('Quick recap', 'ملخص سريع')}: ',
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
            TextSpan(
              text: ex.recap,
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary, height: 1.5),
            ),
          ])),
        ));
        children.add(const SizedBox(height: 28));
      }
    }

    if (!detail.hasNoContent) {
      children.add(Text(
        context.tr('Lesson materials', 'مواد الدرس'),
        style: AimTextStyles.h3.copyWith(
          color: surfaces.textPrimary,
          fontWeight: FontWeight.w800,
        ),
      ));
      children.add(const SizedBox(height: 4));
      children.add(Text(
        fill(context.tr('{n} steps', '{n} خطوات'), {'n': detail.assets.length}),
        style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
      ));
      children.add(const SizedBox(height: 12));
      for (var i = 0; i < detail.assets.length; i++) {
        children.add(Container(
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
              Text(
                fill(context.tr('Step {n}', 'الخطوة {n}'), {'n': i + 1}),
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              LessonContentRenderer(asset: detail.assets[i]),
            ],
          ),
        ));
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }
}

/// A dot followed by content, aligned to the first line.
class _Bullet extends StatelessWidget {
  const _Bullet({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 9),
          child: Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AimColors.primary500,
              shape: BoxShape.circle,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(child: child),
      ],
    );
  }
}

/// Renders the small markdown subset lesson bodies use: paragraphs,
/// "- " bullet lines, and **bold** / *italic* inside the text.
class _MiniMarkdown extends StatelessWidget {
  const _MiniMarkdown({required this.text});

  final String text;

  static final _inline = RegExp(r'\*\*(.+?)\*\*|\*(.+?)\*');

  List<InlineSpan> _spans(String line, TextStyle base) {
    final out = <InlineSpan>[];
    var last = 0;
    for (final m in _inline.allMatches(line)) {
      if (m.start > last) out.add(TextSpan(text: line.substring(last, m.start)));
      if (m.group(1) != null) {
        out.add(TextSpan(text: m.group(1), style: const TextStyle(fontWeight: FontWeight.w800)));
      } else {
        out.add(TextSpan(text: m.group(2), style: const TextStyle(fontStyle: FontStyle.italic)));
      }
      last = m.end;
    }
    if (last < line.length) out.add(TextSpan(text: line.substring(last)));
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final style = AimTextStyles.bodyLg.copyWith(
      color: surfaces.textSecondary,
      height: 1.55,
    );
    final rows = <Widget>[];
    for (final raw in text.split('\n')) {
      final line = raw.trim();
      if (line.isEmpty) continue;
      final bullet = RegExp(r'^[-*•]\s+(.*)$').firstMatch(line);
      if (bullet != null) {
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: _Bullet(
            child: Text.rich(TextSpan(style: style, children: _spans(bullet.group(1)!, style))),
          ),
        ));
      } else {
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text.rich(TextSpan(style: style, children: _spans(line, style))),
        ));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: rows);
  }
}
