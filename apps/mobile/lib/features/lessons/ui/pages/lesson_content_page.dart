// LessonContentPage — the full written content of a lesson (overview, explained
// sections with examples, key points, common mistakes, recap), readable without
// starting the AI Teacher. Content is backend-authored (lessons.explanation) and
// shown verbatim; Flutter never edits or generates it.
//
// Route extra: {'lessonId': String, 'lessonTitle': String,
//               'explanation': LessonExplanation}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_explanation.dart';

class _Strings {
  _Strings(BuildContext context)
      : ar = Localizations.localeOf(context).languageCode == 'ar';

  final bool ar;

  String get appBar => ar ? 'محتوى الدرس' : 'Lesson content';
  String get inThisLesson => ar ? 'في هذا الدرس' : 'In this lesson';
  String get examples => ar ? 'أمثلة' : 'Examples';
  String get keyPoints => ar ? 'نقاط مهمة للتذكر' : 'Key points to remember';
  String get commonMistakes => ar ? 'أخطاء شائعة' : 'Common mistakes';
  String get not => ar ? 'خطأ' : 'Not';
  String get say => ar ? 'صحيح' : 'Say';
  String get recap => ar ? 'ملخص سريع' : 'Quick recap';
}

class LessonContentPage extends StatefulWidget {
  const LessonContentPage({
    required this.lessonTitle,
    required this.explanation,
    super.key,
  });

  final String lessonTitle;
  final LessonExplanation explanation;

  @override
  State<LessonContentPage> createState() => _LessonContentPageState();
}

class _LessonContentPageState extends State<LessonContentPage> {
  final _scroll = ScrollController();
  late final List<GlobalKey> _sectionKeys = List.generate(
    widget.explanation.sections.length,
    (_) => GlobalKey(),
  );

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _jumpTo(int i) {
    final ctx = _sectionKeys[i].currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(
      ctx,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
      alignment: 0.02,
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = _Strings(context);
    final surfaces = aimSurfacesOf(context);
    final e = widget.explanation;

    return Scaffold(
      appBar: AIMTopAppBar(
        title: s.appBar,
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      // Lesson content is English; keep it left-to-right even in the Arabic UI.
      body: SafeArea(
        child: Directionality(
          textDirection: TextDirection.ltr,
          child: ListView(
          controller: _scroll,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            Text(
              widget.lessonTitle,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                height: 1.25,
                color: surfaces.textPrimary,
              ),
            ),
            if (e.overview.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                e.overview,
                style: TextStyle(
                  fontSize: 16,
                  height: 1.6,
                  color: surfaces.textPrimary,
                ),
              ),
            ],
            if (e.sections.length > 1) ...[
              const SizedBox(height: 16),
              Text(
                s.inThisLesson,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: surfaces.textMuted,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (var i = 0; i < e.sections.length; i++)
                    ActionChip(
                      label: Text('${i + 1}. ${e.sections[i].heading}'),
                      onPressed: () => _jumpTo(i),
                    ),
                ],
              ),
            ],
            for (var i = 0; i < e.sections.length; i++)
              _SectionView(
                key: _sectionKeys[i],
                index: i + 1,
                section: e.sections[i],
                strings: s,
              ),
            if (e.keyPoints.isNotEmpty) ...[
              const SizedBox(height: 28),
              _KeyPointsCard(points: e.keyPoints, strings: s),
            ],
            if (e.commonMistakes.isNotEmpty) ...[
              const SizedBox(height: 28),
              Text(
                s.commonMistakes,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: surfaces.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              for (final m in e.commonMistakes)
                _MistakeCard(mistake: m, strings: s),
            ],
            if (e.recap != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsetsDirectional.only(start: 14),
                decoration: const BoxDecoration(
                  border: BorderDirectional(
                    start: BorderSide(color: AimColors.primary500, width: 4),
                  ),
                ),
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(
                      text: '${s.recap}: ',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    TextSpan(text: e.recap),
                  ]),
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.6,
                    color: surfaces.textSecondary,
                  ),
                ),
              ),
            ],
          ],
        ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _SectionView extends StatelessWidget {
  const _SectionView({
    required this.index,
    required this.section,
    required this.strings,
    super.key,
  });

  final int index;
  final LessonExplanationSection section;
  final _Strings strings;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    return Padding(
      padding: const EdgeInsets.only(top: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 30,
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: soft.primary,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$index',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: soft.onPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  section.heading,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    height: 1.25,
                    color: surfaces.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          if (section.body.isNotEmpty) ...[
            const SizedBox(height: 12),
            _LightMarkdown(
              text: section.body,
              style: TextStyle(
                fontSize: 15,
                height: 1.6,
                color: surfaces.textSecondary,
              ),
            ),
          ],
          if (section.examples.isNotEmpty) ...[
            const SizedBox(height: 14),
            Semantics(
              label: strings.examples,
              child: Column(
                children: [
                  for (final ex in section.examples)
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: surfaces.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: surfaces.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SelectableText(
                            ex.text,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              height: 1.4,
                              color: surfaces.textPrimary,
                            ),
                          ),
                          if (ex.note != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              ex.note!,
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.4,
                                color: surfaces.textMuted,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _KeyPointsCard extends StatelessWidget {
  const _KeyPointsCard({required this.points, required this.strings});

  final List<String> points;
  final _Strings strings;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: soft.primary,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            strings.keyPoints,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: soft.onPrimary,
            ),
          ),
          const SizedBox(height: 10),
          for (final p in points)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AimColors.primary500,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      p,
                      style: TextStyle(
                        fontSize: 15,
                        height: 1.5,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _MistakeCard extends StatelessWidget {
  const _MistakeCard({required this.mistake, required this.strings});

  final LessonExplanationMistake mistake;
  final _Strings strings;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(
            TextSpan(children: [
              TextSpan(
                text: '${strings.not}  ',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: soft.onError,
                ),
              ),
              TextSpan(
                text: mistake.wrong,
                style: TextStyle(
                  decoration: TextDecoration.lineThrough,
                  color: surfaces.textMuted,
                ),
              ),
            ]),
            style: const TextStyle(fontSize: 15, height: 1.4),
          ),
          const SizedBox(height: 6),
          Text.rich(
            TextSpan(children: [
              TextSpan(
                text: '${strings.say}  ',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: soft.onSuccess,
                ),
              ),
              TextSpan(
                text: mistake.right,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: surfaces.textPrimary,
                ),
              ),
            ]),
            style: const TextStyle(fontSize: 15, height: 1.4),
          ),
          if (mistake.why.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              mistake.why,
              style: TextStyle(
                fontSize: 13,
                height: 1.45,
                color: surfaces.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Minimal markdown: paragraphs, "- " bullets, "1. " numbered items, **bold**.
// ---------------------------------------------------------------------------

class _LightMarkdown extends StatelessWidget {
  const _LightMarkdown({required this.text, required this.style});

  final String text;
  final TextStyle style;

  static final _bullet = RegExp(r'^\s*[-*•]\s+(.*)$');
  static final _numbered = RegExp(r'^\s*(\d+)[.)]\s+(.*)$');

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (final raw in text.split('\n')) {
      final line = raw.trimRight();
      if (line.trim().isEmpty) continue;
      final b = _bullet.firstMatch(line);
      final n = _numbered.firstMatch(line);
      if (b != null || n != null) {
        final marker = n != null ? '${n.group(1)}.' : '•';
        final content = (b?.group(1) ?? n!.group(2))!;
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 22,
                child: Text(marker, style: style),
              ),
              Expanded(child: Text.rich(_inline(content, style))),
            ],
          ),
        ));
      } else {
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text.rich(_inline(line, style)),
        ));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: rows);
  }

  static TextSpan _inline(String s, TextStyle base) {
    final spans = <InlineSpan>[];
    final parts = s.split('**');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].isEmpty) continue;
      spans.add(TextSpan(
        text: parts[i],
        style: i.isOdd
            ? base.copyWith(
                fontWeight: FontWeight.w800,
                color: base.color,
              )
            : null,
      ));
    }
    return TextSpan(style: base, children: spans);
  }
}
