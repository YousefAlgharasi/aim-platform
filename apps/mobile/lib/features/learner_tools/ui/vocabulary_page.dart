import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../core/localization/inline_tr.dart';
import '../../../core/widgets/widgets.dart';
import '../data/learner_tools_api.dart';
import 'flashcard_review.dart';

/// My words — the words the student saved, with spaced-repetition review.
/// Mirrors the web app's "My words" page.
class VocabularyPage extends ConsumerStatefulWidget {
  const VocabularyPage({super.key});

  @override
  ConsumerState<VocabularyPage> createState() => _VocabularyPageState();
}

class _VocabularyPageState extends ConsumerState<VocabularyPage> {
  String _query = '';

  Future<void> _reload() async {
    ref.invalidate(vocabularyProvider);
    await ref.read(vocabularyProvider.future).catchError(
          (_) => const VocabularyList(words: [], dueCount: 0),
        );
  }

  Future<void> _startReview() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const FlashcardReviewPage()),
    );
    if (mounted) ref.invalidate(vocabularyProvider);
  }

  Future<void> _addWord() async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => const _AddWordSheet(),
    );
    if (saved == true && mounted) ref.invalidate(vocabularyProvider);
  }

  Future<void> _remove(SavedWord w) async {
    try {
      await ref.read(learnerToolsApiProvider).removeWord(w.id);
    } catch (_) {
      // The list reload below shows the real state either way.
    }
    if (mounted) ref.invalidate(vocabularyProvider);
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(vocabularyProvider);
    return Scaffold(
      appBar: AIMTopAppBar(
        title: context.tr('My words', 'كلماتي'),
        actions: [
          IconButton(
            tooltip: context.tr('Add a word', 'أضف كلمة'),
            icon: const Icon(Icons.add_rounded),
            onPressed: _addWord,
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: async.when(
          loading: () => AIMFullScreenLoading(
            semanticLabel: context.tr('Loading', 'جارٍ التحميل'),
          ),
          error: (e, _) => AIMFullScreenError(
            message: errorText(e, context.tr('Could not load your words', 'تعذّر تحميل كلماتك')),
            onRetry: () => ref.invalidate(vocabularyProvider),
          ),
          data: (data) => _body(context, data),
        ),
      ),
    );
  }

  Widget _body(BuildContext context, VocabularyList data) {
    final surfaces = aimSurfacesOf(context);
    final words = data.words;
    final mastered = words.where((w) => w.box >= 5).length;
    final q = _query.trim().toLowerCase();
    final shown = q.isEmpty
        ? words
        : words
            .where((w) =>
                w.word.toLowerCase().contains(q) ||
                (w.meaning ?? '').toLowerCase().contains(q))
            .toList();

    return RefreshIndicator(
      onRefresh: _reload,
      child: ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          _ReviewHero(
            dueCount: data.dueCount,
            saved: words.length,
            mastered: mastered,
            onStart: data.dueCount == 0 ? null : _startReview,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          if (words.isEmpty)
            AIMEmptyState(
              icon: const Icon(Icons.lightbulb_outline_rounded),
              title: context.tr('No saved words yet', 'لا توجد كلمات محفوظة بعد'),
              subtitle: context.tr(
                'Select a word in a lesson or an AI Teacher reply to save it here.',
                'حدّد كلمة في درس أو في رد المعلم الذكي لتحفظها هنا.',
              ),
              action: AIMButton(
                onPressed: _addWord,
                leadingIcon: const Icon(Icons.add_rounded),
                child: Text(context.tr('Add a word', 'أضف كلمة')),
              ),
            )
          else ...[
            TextField(
              onChanged: (v) => setState(() => _query = v),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search_rounded),
                hintText: context.tr('Search your words', 'ابحث في كلماتك'),
              ),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            if (shown.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AimSpacing.space24),
                child: Text(
                  context.tr('No words match your search.', 'لا توجد كلمات مطابقة لبحثك.'),
                  textAlign: TextAlign.center,
                  style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                ),
              )
            else
              for (final w in shown) ...[
                _WordCard(word: w, onDelete: () => _remove(w)),
                const SizedBox(height: AimSpacing.componentGap),
              ],
          ],
          const SizedBox(height: 72),
        ],
      ),
    );
  }
}

class _ReviewHero extends StatelessWidget {
  const _ReviewHero({
    required this.dueCount,
    required this.saved,
    required this.mastered,
    required this.onStart,
  });

  final int dueCount;
  final int saved;
  final int mastered;
  final VoidCallback? onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
      decoration: BoxDecoration(
        gradient: AimGradients.gzHero,
        borderRadius: BorderRadius.circular(AimRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.tr('Today’s review', 'مراجعة اليوم'),
            style: AimTextStyles.bodySm.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            dueCount == 0
                ? context.tr('All caught up', 'أنهيت كل المراجعات')
                : fill(context.tr('{n} words due', '{n} كلمات تنتظر المراجعة'), {'n': dueCount}),
            style: AimTextStyles.h2.copyWith(color: Colors.white),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            fill(
              context.tr('{total} saved · {mastered} well known', '{total} محفوظة · {mastered} معروفة جيداً'),
              {'total': saved, 'mastered': mastered},
            ),
            style: AimTextStyles.bodySm.copyWith(color: Colors.white.withValues(alpha: 0.85)),
          ),
          const SizedBox(height: AimSpacing.space16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onStart,
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF4762EE),
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.35),
                minimumSize: const Size.fromHeight(48),
                shape: const StadiumBorder(),
              ),
              child: Text(context.tr('Start review', 'ابدأ المراجعة')),
            ),
          ),
        ],
      ),
    );
  }
}

class _WordCard extends StatelessWidget {
  const _WordCard({required this.word, required this.onDelete});

  final SavedWord word;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final locale = context.isArabic ? 'ar' : 'en';

    return AIMCard(
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        word.word,
                        style: AimTextStyles.bodyLg.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (word.meaning != null && word.meaning!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          word.meaning!,
                          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
                        ),
                      ],
                      if (word.context != null && word.context!.isNotEmpty) ...[
                        const SizedBox(height: AimSpacing.space4),
                        Text(
                          word.context!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  tooltip: fill(context.tr('Delete {word}', 'حذف {word}'), {'word': word.word}),
                  icon: Icon(Icons.close_rounded, color: surfaces.textMuted, size: 20),
                  onPressed: onDelete,
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Semantics(
                  label: fill(
                    context.tr('Memory strength {n} of 6', 'قوة الحفظ {n} من 6'),
                    {'n': word.box},
                  ),
                  child: Row(
                    children: [
                      for (var i = 0; i < 6; i++)
                        Container(
                          width: 16,
                          height: 6,
                          margin: const EdgeInsetsDirectional.only(end: 4),
                          decoration: BoxDecoration(
                            color: i < word.box ? AimColors.primary500 : surfaces.surfaceSunken,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                    ],
                  ),
                ),
                if (word.isDue)
                  Container(
                    padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 2),
                    decoration: BoxDecoration(
                      color: soft.primary,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      context.tr('Due', 'مستحقة'),
                      style: AimTextStyles.caption.copyWith(
                        color: soft.onPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                else
                  Flexible(
                    child: Text(
                      fill(
                        context.tr('Next review: {date}', 'المراجعة التالية: {date}'),
                        {'date': DateFormat.MMMd(locale).format(word.nextReviewAt)},
                      ),
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AddWordSheet extends ConsumerStatefulWidget {
  const _AddWordSheet();

  @override
  ConsumerState<_AddWordSheet> createState() => _AddWordSheetState();
}

class _AddWordSheetState extends ConsumerState<_AddWordSheet> {
  final _word = TextEditingController();
  final _meaning = TextEditingController();
  final _example = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _word.dispose();
    _meaning.dispose();
    _example.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_word.text.trim().isEmpty || _saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(learnerToolsApiProvider).saveWord(
            word: _word.text.trim(),
            meaning: _meaning.text.trim(),
            context: _example.text.trim(),
          );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = errorText(e, context.tr('Could not save the word', 'تعذّر حفظ الكلمة'));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: AimSpacing.screenPaddingMobile,
        end: AimSpacing.screenPaddingMobile,
        bottom: MediaQuery.of(context).viewInsets.bottom + AimSpacing.space16,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(context.tr('Add a word', 'أضف كلمة'), style: AimTextStyles.h3),
            const SizedBox(height: AimSpacing.space16),
            if (_error != null) ...[
              Text(_error!, style: AimTextStyles.bodySm.copyWith(color: AimColors.error500)),
              const SizedBox(height: AimSpacing.space8),
            ],
            TextField(
              controller: _word,
              maxLength: 60,
              autofocus: true,
              textDirection: TextDirection.ltr,
              decoration: InputDecoration(
                labelText: context.tr('English word or phrase', 'كلمة أو عبارة إنجليزية'),
                hintText: context.tr('For example: borrow', 'مثلًا: borrow'),
              ),
              onChanged: (_) => setState(() {}),
            ),
            TextField(
              controller: _meaning,
              maxLength: 200,
              decoration: InputDecoration(
                labelText: context.tr('Meaning (optional)', 'المعنى (اختياري)'),
                hintText: context.tr('What does it mean?', 'ما معناها؟'),
              ),
            ),
            TextField(
              controller: _example,
              maxLength: 300,
              decoration: InputDecoration(
                labelText: context.tr('Example sentence (optional)', 'جملة مثال (اختياري)'),
                hintText: context.tr('Use it in a sentence', 'استخدمها في جملة'),
              ),
            ),
            const SizedBox(height: AimSpacing.space8),
            AIMButton(
              fullWidth: true,
              loading: _saving,
              onPressed: _word.text.trim().isEmpty ? null : _save,
              child: Text(_saving ? context.tr('Saving…', 'جارٍ الحفظ…') : context.tr('Save word', 'احفظ الكلمة')),
            ),
            const SizedBox(height: AimSpacing.space8),
            AIMButton(
              fullWidth: true,
              variant: AIMButtonVariant.secondary,
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(context.tr('Cancel', 'إلغاء')),
            ),
          ],
        ),
      ),
    );
  }
}
