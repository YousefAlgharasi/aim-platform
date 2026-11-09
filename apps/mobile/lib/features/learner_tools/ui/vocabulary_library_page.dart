import 'dart:async';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/widgets/widgets.dart';
import '../data/learner_tools_api.dart';

/// Vocabulary — browse the word library: the word, the Arabic translation of
/// the word, an example sentence, a listen button and a save button that adds
/// the word to My words. Mirrors the student web app's Vocabulary page.
class VocabularyLibraryPage extends ConsumerStatefulWidget {
  const VocabularyLibraryPage({super.key});

  @override
  ConsumerState<VocabularyLibraryPage> createState() => _VocabularyLibraryPageState();
}

class _VocabularyLibraryPageState extends ConsumerState<VocabularyLibraryPage> {
  static const _pageSize = 24;
  static const _levels = <String?>[null, 'beginner', 'intermediate', 'advanced'];

  final AudioPlayer _player = AudioPlayer();
  StreamSubscription<PlayerState>? _playerSub;
  Timer? _debounce;

  String? _level;
  String _search = '';
  List<LibraryWord> _words = const [];
  int _total = 0;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  String? _playingId;
  String? _loadingAudioId;
  final Set<String> _busy = {};

  @override
  void initState() {
    super.initState();
    _playerSub = _player.onPlayerStateChanged.listen((state) {
      if (!mounted) return;
      if (state != PlayerState.playing && _playingId != null) {
        setState(() => _playingId = null);
      }
    });
    _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _playerSub?.cancel();
    _player.stop();
    _player.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await ref.read(learnerToolsApiProvider).listLibrary(
            level: _level,
            query: _search,
            limit: _pageSize,
          );
      if (!mounted) return;
      setState(() {
        _words = page.words;
        _total = page.total;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = errorText(e, context.tr('Could not load the vocabulary', 'تعذّر تحميل المفردات'));
      });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore) return;
    setState(() => _loadingMore = true);
    try {
      final page = await ref.read(learnerToolsApiProvider).listLibrary(
            level: _level,
            query: _search,
            limit: _pageSize,
            offset: _words.length,
          );
      if (!mounted) return;
      final known = _words.map((w) => w.id).toSet();
      setState(() {
        _words = [..._words, ...page.words.where((w) => !known.contains(w.id))];
        _total = page.total;
        _loadingMore = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingMore = false);
      _toast(errorText(e, context.tr('Could not load the vocabulary', 'تعذّر تحميل المفردات')));
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      _search = value.trim();
      _load();
    });
  }

  void _setLevel(String? level) {
    if (level == _level) return;
    _level = level;
    _load();
  }

  Future<void> _toggleSave(LibraryWord w) async {
    if (_busy.contains(w.id)) return;
    final next = !w.saved;
    final api = ref.read(learnerToolsApiProvider);
    setState(() {
      _busy.add(w.id);
      _words = [for (final x in _words) x.id == w.id ? x.copyWith(saved: next) : x];
    });
    try {
      if (next) {
        await api.saveLibraryWord(w.id);
      } else {
        await api.unsaveLibraryWord(w.id);
      }
      if (mounted) ref.invalidate(vocabularyProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _words = [for (final x in _words) x.id == w.id ? x.copyWith(saved: !next) : x];
      });
      _toast(errorText(e, context.tr('Could not update your saved words', 'تعذّر تحديث كلماتك المحفوظة')));
    } finally {
      if (mounted) setState(() => _busy.remove(w.id));
    }
  }

  Future<void> _listen(LibraryWord w) async {
    if (_playingId == w.id) {
      await _player.stop();
      if (mounted) setState(() => _playingId = null);
      return;
    }
    setState(() => _loadingAudioId = w.id);
    try {
      final bytes = await ref.read(learnerToolsApiProvider).libraryWordAudio(w.id);
      if (bytes.isEmpty) throw StateError('empty audio');
      final data = Uint8List.fromList(bytes);
      // WAV starts with "RIFF"; the stored audio is normally MP3.
      final isWav = data.length > 4 && data[0] == 0x52 && data[1] == 0x49 && data[2] == 0x46 && data[3] == 0x46;
      await _player.stop();
      await _player.play(BytesSource(data, mimeType: isWav ? 'audio/wav' : 'audio/mpeg'));
      if (!mounted) return;
      setState(() {
        _loadingAudioId = null;
        _playingId = w.id;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loadingAudioId = null;
        _playingId = null;
      });
      _toast(context.tr('Could not play the audio', 'تعذّر تشغيل الصوت'));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AIMTopAppBar(title: context.tr('Vocabulary', 'المفردات')),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.space8,
                AimSpacing.screenPaddingMobile,
                AimSpacing.space8,
              ),
              child: TextField(
                onChanged: _onSearchChanged,
                textInputAction: TextInputAction.search,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search_rounded),
                  hintText: context.tr('Search words', 'ابحث عن كلمة'),
                ),
              ),
            ),
            _LevelFilter(selected: _level, levels: _levels, onSelected: _setLevel),
            Expanded(child: _content(context)),
          ],
        ),
      ),
    );
  }

  Widget _content(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    if (_loading) {
      return AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    }
    if (_error != null) {
      return AIMFullScreenError(message: _error!, onRetry: _load);
    }
    if (_words.isEmpty) {
      return Center(
        child: AIMEmptyState(
          icon: const Icon(Icons.menu_book_outlined),
          title: context.tr('No words found', 'لم يتم العثور على كلمات'),
          subtitle: context.tr('Try another level or search.', 'جرّب مستوى آخر أو بحثًا مختلفًا.'),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
        children: [
          for (final w in _words) ...[
            _WordCard(
              word: w,
              playing: _playingId == w.id,
              loadingAudio: _loadingAudioId == w.id,
              saving: _busy.contains(w.id),
              onListen: () => _listen(w),
              onToggleSave: () => _toggleSave(w),
            ),
            const SizedBox(height: AimSpacing.componentGap),
          ],
          Center(
            child: Text(
              fill(
                context.tr('Showing {shown} of {total} words', 'عرض {shown} من {total} كلمة'),
                {'shown': _words.length, 'total': _total},
              ),
              style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
            ),
          ),
          if (_words.length < _total) ...[
            const SizedBox(height: AimSpacing.space12),
            Center(
              child: OutlinedButton(
                onPressed: _loadingMore ? null : _loadMore,
                child: Text(_loadingMore
                    ? context.tr('Loading…', 'جارٍ التحميل…')
                    : context.tr('Show more words', 'عرض المزيد من الكلمات')),
              ),
            ),
          ],
          const SizedBox(height: 72),
        ],
      ),
    );
  }
}

class _LevelFilter extends StatelessWidget {
  const _LevelFilter({required this.selected, required this.levels, required this.onSelected});

  final String? selected;
  final List<String?> levels;
  final ValueChanged<String?> onSelected;

  String _label(BuildContext context, String? level) => switch (level) {
        'beginner' => context.tr('Beginner', 'مبتدئ'),
        'intermediate' => context.tr('Intermediate', 'متوسط'),
        'advanced' => context.tr('Advanced', 'متقدم'),
        _ => context.tr('All levels', 'كل المستويات'),
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsetsDirectional.symmetric(horizontal: AimSpacing.screenPaddingMobile),
        itemCount: levels.length,
        separatorBuilder: (_, __) => const SizedBox(width: AimSpacing.space8),
        itemBuilder: (context, i) {
          final level = levels[i];
          final isSelected = level == selected;
          return Semantics(
            button: true,
            selected: isSelected,
            child: GestureDetector(
              onTap: () => onSelected(level),
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsetsDirectional.symmetric(horizontal: AimSpacing.space16),
                decoration: BoxDecoration(
                  color: isSelected ? AimColors.primary500 : surfaces.surface,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: isSelected ? AimColors.primary500 : surfaces.border),
                ),
                child: Text(
                  _label(context, level),
                  style: AimTextStyles.bodySm.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.white : surfaces.textSecondary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WordCard extends StatelessWidget {
  const _WordCard({
    required this.word,
    required this.playing,
    required this.loadingAudio,
    required this.saving,
    required this.onListen,
    required this.onToggleSave,
  });

  final LibraryWord word;
  final bool playing;
  final bool loadingAudio;
  final bool saving;
  final VoidCallback onListen;
  final VoidCallback onToggleSave;

  /// Difficulty pill: easy = success, medium = warning, hard = error (the app's soft status fills).
  (Color, Color, String) _levelStyle(BuildContext context) {
    final soft = aimSoftFillsOf(context);
    return switch (word.level) {
      'advanced' => (soft.error, soft.onError, context.tr('Advanced', 'متقدم')),
      'intermediate' => (soft.warning, soft.onWarning, context.tr('Intermediate', 'متوسط')),
      _ => (soft.success, soft.onSuccess, context.tr('Beginner', 'مبتدئ')),
    };
  }

  String? _pos(BuildContext context) => switch (word.partOfSpeech) {
        'noun' => context.tr('noun', 'اسم'),
        'verb' => context.tr('verb', 'فعل'),
        'adjective' => context.tr('adjective', 'صفة'),
        'adverb' => context.tr('adverb', 'ظرف'),
        'preposition' => context.tr('preposition', 'حرف جر'),
        'conjunction' => context.tr('conjunction', 'أداة ربط'),
        'pronoun' => context.tr('pronoun', 'ضمير'),
        'phrase' => context.tr('phrase', 'عبارة'),
        _ => null,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final (pillBg, pillFg, pillLabel) = _levelStyle(context);
    final pos = _pos(context);

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
                      Wrap(
                        spacing: AimSpacing.space8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 2),
                            decoration: BoxDecoration(color: pillBg, borderRadius: BorderRadius.circular(100)),
                            child: Text(
                              pillLabel,
                              style: AimTextStyles.caption.copyWith(color: pillFg, fontWeight: FontWeight.w700),
                            ),
                          ),
                          if (pos != null)
                            Text(pos, style: AimTextStyles.caption.copyWith(color: surfaces.textMuted)),
                        ],
                      ),
                      const SizedBox(height: AimSpacing.space8),
                      Directionality(
                        textDirection: TextDirection.ltr,
                        child: Text(
                          word.word,
                          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Directionality(
                        textDirection: TextDirection.rtl,
                        child: Text(
                          word.translationAr,
                          style: AimTextStyles.bodyLg.copyWith(
                            color: AimColors.primary500,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AimSpacing.space8),
                _RoundIconButton(
                  tooltip: fill(context.tr('Listen to {word}', 'استمع إلى {word}'), {'word': word.word}),
                  active: playing,
                  loading: loadingAudio,
                  icon: playing ? Icons.stop_rounded : Icons.volume_up_rounded,
                  onPressed: onListen,
                ),
                const SizedBox(width: AimSpacing.space8),
                _RoundIconButton(
                  tooltip: fill(
                    word.saved
                        ? context.tr('Remove {word} from My words', 'أزل {word} من كلماتي')
                        : context.tr('Save {word} to My words', 'احفظ {word} في كلماتي'),
                    {'word': word.word},
                  ),
                  active: word.saved,
                  loading: false,
                  icon: word.saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                  onPressed: saving ? null : onToggleSave,
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space12),
            Directionality(
              textDirection: TextDirection.ltr,
              child: Text(
                '“${word.exampleSentence}”',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  const _RoundIconButton({
    required this.tooltip,
    required this.active,
    required this.loading,
    required this.icon,
    required this.onPressed,
  });

  final String tooltip;
  final bool active;
  final bool loading;
  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Tooltip(
      message: tooltip,
      child: Material(
        color: active ? AimColors.primary500 : surfaces.surfaceSunken,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: loading ? null : onPressed,
          child: SizedBox(
            width: 44,
            height: 44,
            child: Center(
              child: loading
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: surfaces.textSecondary),
                    )
                  : Icon(icon, size: 22, color: active ? Colors.white : surfaces.textPrimary),
            ),
          ),
        ),
      ),
    );
  }
}
