import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/widgets/widgets.dart';
import '../data/learner_tools_api.dart';

/// One card at a time: see the word, try to recall, flip, then say whether you
/// knew it. The backend reschedules each word from the answer.
class FlashcardReviewPage extends ConsumerStatefulWidget {
  const FlashcardReviewPage({super.key});

  @override
  ConsumerState<FlashcardReviewPage> createState() => _FlashcardReviewPageState();
}

class _FlashcardReviewPageState extends ConsumerState<FlashcardReviewPage> {
  List<SavedWord>? _cards;
  String? _error;
  int _index = 0;
  int _known = 0;
  bool _flipped = false;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final cards = await ref.read(learnerToolsApiProvider).dueCards();
      if (mounted) setState(() => _cards = cards);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e, context.tr('Could not load your words', 'تعذّر تحميل كلماتك')));
    }
  }

  Future<void> _answer(SavedWord card, bool correct) async {
    setState(() => _busy = true);
    try {
      await ref.read(learnerToolsApiProvider).reviewWord(card.id, correct: correct);
    } catch (_) {
      // The next sync reschedules it.
    }
    if (!mounted) return;
    setState(() {
      if (correct) _known++;
      _flipped = false;
      _index++;
      _busy = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final cards = _cards;

    Widget body;
    if (_error != null) {
      body = AIMFullScreenError(message: _error!, onRetry: _load);
    } else if (cards == null) {
      body = AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    } else if (cards.isEmpty || _index >= cards.length) {
      body = _Complete(known: _known, total: cards.length, onDone: () => Navigator.of(context).pop());
    } else {
      final card = cards[_index];
      body = ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(value: _index / cards.length, minHeight: 8),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            _flipped
                ? context.tr('Did you know it?', 'هل كنت تعرفها؟')
                : context.tr('What does this mean?', 'ما معنى هذه الكلمة؟'),
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          InkWell(
            borderRadius: BorderRadius.circular(AimRadius.lg),
            onTap: () => setState(() => _flipped = !_flipped),
            child: Container(
              constraints: const BoxConstraints(minHeight: 280),
              padding: const EdgeInsetsDirectional.all(AimSpacing.space24),
              decoration: BoxDecoration(
                color: _flipped ? aimSoftFillsOf(context).primary : surfaces.surfaceRaised,
                borderRadius: BorderRadius.circular(AimRadius.lg),
                border: Border.all(color: _flipped ? AimColors.primary500 : surfaces.border),
              ),
              child: Center(
                child: _flipped ? _back(context, card) : _front(context, card),
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          if (_flipped)
            Row(
              children: [
                Expanded(
                  child: AIMButton(
                    variant: AIMButtonVariant.secondary,
                    leadingIcon: const Icon(Icons.close_rounded),
                    onPressed: _busy ? null : () => _answer(card, false),
                    child: Text(context.tr('Not yet', 'ليس بعد')),
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(
                  child: AIMButton(
                    leadingIcon: const Icon(Icons.check_rounded),
                    onPressed: _busy ? null : () => _answer(card, true),
                    child: Text(context.tr('I knew it', 'كنت أعرفها')),
                  ),
                ),
              ],
            )
          else
            AIMButton(
              fullWidth: true,
              onPressed: () => setState(() => _flipped = true),
              child: Text(context.tr('Show the meaning', 'أظهر المعنى')),
            ),
        ],
      );
    }

    return Scaffold(
      appBar: AIMTopAppBar(
        title: cards == null || cards.isEmpty || _index >= cards.length
            ? context.tr('My words', 'كلماتي')
            : '${_index + 1} / ${cards.length}',
        // This page is pushed on the frame's own navigator, not by the router.
        onBack: () => Navigator.of(context).pop(),
      ),
      body: SafeArea(top: false, child: body),
    );
  }

  Widget _front(BuildContext context, SavedWord card) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          card.word,
          textAlign: TextAlign.center,
          textDirection: TextDirection.ltr,
          style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space16),
        Text(
          context.tr('Tap to flip', 'اضغط لقلب البطاقة'),
          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
        ),
      ],
    );
  }

  Widget _back(BuildContext context, SavedWord card) {
    final surfaces = aimSurfacesOf(context);
    final hasMeaning = card.meaning != null && card.meaning!.isNotEmpty;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          card.word,
          textDirection: TextDirection.ltr,
          style: AimTextStyles.bodyMd.copyWith(
            color: AimColors.primary500,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AimSpacing.space12),
        Text(
          hasMeaning ? card.meaning! : context.tr('No meaning saved.', 'لا يوجد معنى محفوظ.'),
          textAlign: TextAlign.center,
          style: hasMeaning
              ? AimTextStyles.h2.copyWith(color: surfaces.textPrimary)
              : AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
        ),
        if (card.context != null && card.context!.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.space12),
          Text(
            '“${card.context}”',
            textAlign: TextAlign.center,
            style: AimTextStyles.bodyMd.copyWith(
              color: surfaces.textSecondary,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ],
    );
  }
}

class _Complete extends StatelessWidget {
  const _Complete({required this.known, required this.total, required this.onDone});

  final int known;
  final int total;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final summary = total == 0
        ? context.tr('No words are due right now.', 'لا توجد كلمات للمراجعة الآن.')
        : known == total
            ? context.tr('You knew every word. Great memory.', 'عرفتَ كل الكلمات. ذاكرة ممتازة!')
            : fill(context.tr('You knew {known} of {total}.', 'عرفت {known} من {total}.'), {'known': known, 'total': total});
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: context.tr('Review complete', 'اكتملت المراجعة'),
      subtitle: summary,
      action: AIMButton(
        onPressed: onDone,
        child: Text(context.tr('Back to My words', 'العودة إلى كلماتي')),
      ),
    );
  }
}
