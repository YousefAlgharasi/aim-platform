// "Teacher voice": the student picks how the AI Teacher sounds, in English and in Arabic, man or woman.
// Each voice has a short sample to listen to first. The choice is saved at once and used from the next reply.

import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/voice_teacher/data/voice_preferences_api.dart';

enum _Gender { all, female, male }

class VoicePreferencesPage extends ConsumerStatefulWidget {
  const VoicePreferencesPage({super.key});

  @override
  ConsumerState<VoicePreferencesPage> createState() => _VoicePreferencesPageState();
}

class _VoicePreferencesPageState extends ConsumerState<VoicePreferencesPage> {
  List<VoiceLanguage>? _languages;
  bool _failed = false;
  String? _message;
  bool _messageIsError = false;
  bool _saving = false;
  String? _playing; // "lang:voice"
  String? _loadingSample;
  final Map<String, _Gender> _filters = {};
  AudioPlayer? _player;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _player?.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _failed = false);
    try {
      final languages = await ref.read(voicePreferencesApiProvider).get();
      if (mounted) setState(() => _languages = languages);
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    }
  }

  Future<void> _play(VoiceLanguage lang, VoiceOption voice) async {
    final key = '${lang.code}:${voice.id}';
    if (_playing == key) {
      await _player?.stop();
      if (mounted) setState(() => _playing = null);
      return;
    }
    setState(() {
      _loadingSample = key;
      _message = null;
    });
    try {
      final bytes = await ref.read(voicePreferencesApiProvider).preview(lang.code, voice.id);
      if (bytes.isEmpty) throw StateError('empty sample');
      await _player?.stop();
      final player = _player ??= AudioPlayer();
      player.onPlayerComplete.listen((_) {
        if (mounted) setState(() => _playing = null);
      });
      await player.play(BytesSource(Uint8List.fromList(bytes)));
      if (mounted) setState(() => _playing = key);
    } catch (e) {
      if (mounted) {
        // A refused sample (the daily speech limit) comes with its own clear message from the server.
        final server = e is ApiClientException && e.statusCode == 429 ? e.message : null;
        setState(() {
          _message = server ??
              context.tr('Could not play this sample. Try again.', 'تعذّر تشغيل هذه العينة. حاول مجددًا.');
          _messageIsError = true;
        });
      }
    } finally {
      if (mounted) setState(() => _loadingSample = null);
    }
  }

  Future<void> _choose(VoiceLanguage lang, String? voiceId) async {
    setState(() {
      _saving = true;
      _message = null;
    });
    try {
      await ref.read(voicePreferencesApiProvider).save(lang.code, voiceId);
      if (!mounted) return;
      setState(() {
        _languages = _languages
            ?.map((l) => l.code == lang.code ? l.withSelected(voiceId) : l)
            .toList();
        _message = context.tr(
          'Voice saved. Your teacher will use it from the next reply.',
          'تم حفظ الصوت. سيستخدمه معلّمك من الرد التالي.',
        );
        _messageIsError = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _message = context.tr('Could not save your voice. Try again.', 'تعذّر حفظ الصوت. حاول مجددًا.');
          _messageIsError = true;
        });
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final theme = Theme.of(context);

    Widget body;
    if (_failed) {
      body = Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(context.tr('Could not load your voice settings.', 'تعذّر تحميل إعدادات الصوت.')),
            const SizedBox(height: 12),
            FilledButton(onPressed: _load, child: Text(context.tr('Try again', 'حاول مجددًا'))),
          ],
        ),
      );
    } else if (_languages == null) {
      body = const Center(child: CircularProgressIndicator());
    } else {
      body = ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            context.tr(
              'Choose how your AI Teacher sounds. Listen to a sample, then pick the voice you like. Choose a man or a woman, in English and in Arabic.',
              'اختر كيف يبدو صوت معلّمك الذكي. استمع إلى عينة ثم اختر الصوت الذي يعجبك، رجلًا أو امرأة، بالإنجليزية وبالعربية.',
            ),
            style: theme.textTheme.bodyMedium,
          ),
          if (_message != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _messageIsError
                    ? theme.colorScheme.errorContainer
                    : theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(_message!),
            ),
          ],
          for (final lang in _languages!) ...[
            const SizedBox(height: 20),
            Text(
              lang.code == 'en'
                  ? context.tr('English voice', 'الصوت الإنجليزي')
                  : context.tr('Arabic voice', 'الصوت العربي'),
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            if (!lang.available)
              Text(context.tr('The Arabic voice is not available yet.', 'الصوت العربي غير متاح بعد.'))
            else ...[
              Wrap(
                spacing: 8,
                children: [
                  for (final g in _Gender.values)
                    ChoiceChip(
                      label: Text(switch (g) {
                        _Gender.all => context.tr('All', 'الكل'),
                        _Gender.female => context.tr('Woman', 'امرأة'),
                        _Gender.male => context.tr('Man', 'رجل'),
                      }),
                      selected: (_filters[lang.code] ?? _Gender.all) == g,
                      onSelected: (_) => setState(() => _filters[lang.code] = g),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              for (final v in lang.voices.where((v) {
                final f = _filters[lang.code] ?? _Gender.all;
                return f == _Gender.all || (f == _Gender.female) == v.isFemale;
              }))
                _VoiceTile(
                  name: context.isArabic ? v.nameAr : v.name,
                  subtitle: v.isFemale ? context.tr('Woman', 'امرأة') : context.tr('Man', 'رجل'),
                  selected: lang.selected == v.id,
                  playing: _playing == '${lang.code}:${v.id}',
                  loadingSample: _loadingSample == '${lang.code}:${v.id}',
                  busy: _saving,
                  borderColor: surfaces.borderStrong,
                  onListen: () => _play(lang, v),
                  onChoose: () => _choose(lang, v.id),
                ),
              if (lang.selected != null)
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: TextButton(
                    onPressed: _saving ? null : () => _choose(lang, null),
                    child: Text(context.tr('Use the default voice', 'استخدم الصوت الافتراضي')),
                  ),
                ),
            ],
          ],
        ],
      );
    }

    return Scaffold(
      backgroundColor: surfaces.background,
      appBar: AIMTopAppBar(
        title: context.tr('Teacher voice', 'صوت المعلّم'),
        onBack: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/main');
          }
        },
      ),
      body: SafeArea(child: body),
    );
  }
}

class _VoiceTile extends StatelessWidget {
  const _VoiceTile({
    required this.name,
    required this.subtitle,
    required this.selected,
    required this.playing,
    required this.loadingSample,
    required this.busy,
    required this.borderColor,
    required this.onListen,
    required this.onChoose,
  });

  final String name;
  final String subtitle;
  final bool selected;
  final bool playing;
  final bool loadingSample;
  final bool busy;
  final Color borderColor;
  final VoidCallback onListen;
  final VoidCallback onChoose;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: selected ? theme.colorScheme.primary : borderColor,
          width: selected ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                Text(subtitle, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          IconButton(
            tooltip: context.tr('Listen', 'استمع'),
            onPressed: loadingSample ? null : onListen,
            icon: loadingSample
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Icon(playing ? Icons.stop_circle_outlined : Icons.play_circle_outline_rounded),
          ),
          selected
              ? Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_rounded, size: 18),
                      const SizedBox(width: 4),
                      Text(context.tr('Selected', 'مختار')),
                    ],
                  ),
                )
              : FilledButton.tonal(
                  onPressed: busy ? null : onChoose,
                  child: Text(context.tr('Choose', 'اختر')),
                ),
        ],
      ),
    );
  }
}
