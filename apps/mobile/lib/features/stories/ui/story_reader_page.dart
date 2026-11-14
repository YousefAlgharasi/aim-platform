// Reads one story scene by scene. After each scene come its questions, shown with the existing QuestionPage
// (the scene stays visible above the question), so every answer is a real attempt (POST /sessions/:id/attempt)
// and the AIM engine, never Flutter, updates mastery. Nothing is scored here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/networking/api_client_exception.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/widgets/widgets.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import '../../question_answer/data/models/answer_option_model.dart';
import '../../question_answer/data/models/question_model.dart';
import '../../question_answer/ui/pages/question_page.dart';
import 'widgets/story_scene_view.dart';

enum _Phase { intro, scene, questions, done }

class StoryReaderPage extends ConsumerStatefulWidget {
  const StoryReaderPage({required this.storyId, super.key});

  final String storyId;

  @override
  ConsumerState<StoryReaderPage> createState() => _StoryReaderPageState();
}

class _StoryReaderPageState extends ConsumerState<StoryReaderPage> {
  StoryDetail? _story;
  String? _error;
  bool _locked = false;
  bool _starting = false;
  _Phase _phase = _Phase.intro;
  String _sessionId = '';
  int _scene = 0;
  int _q = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _locked = false;
      _story = null;
    });
    try {
      final s = await ref.read(learnerToolsApiProvider).story(widget.storyId);
      if (mounted) setState(() => _story = s);
    } catch (e) {
      if (!mounted) return;
      if (e is ApiClientException && e.statusCode == 403) {
        setState(() => _locked = true);
      } else {
        setState(() => _error = errorText(e, context.tr('Could not load this story', 'تعذّر تحميل هذه القصة')));
      }
    }
  }

  Future<void> _begin({required bool fromStart}) async {
    final story = _story;
    if (story == null || _starting) return;
    setState(() {
      _starting = true;
      _error = null;
    });
    try {
      final sid = await ref.read(learnerToolsApiProvider).startStory(widget.storyId);
      if (!mounted) return;
      if (sid.isEmpty) throw StateError('no session');
      setState(() {
        _sessionId = sid;
        _scene = fromStart ? 0 : story.resumeScene;
        _q = 0;
        _phase = _Phase.scene;
      });
    } catch (e) {
      if (mounted) setState(() => _error = errorText(e, context.tr('Could not start this story', 'تعذّر بدء هذه القصة')));
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  void _goNextScene() {
    final total = _story!.sceneList.length;
    setState(() {
      if (_scene + 1 >= total) {
        _phase = _Phase.done;
      } else {
        _scene++;
        _phase = _Phase.scene;
      }
    });
  }

  void _afterScene() {
    final qs = _story!.sceneList[_scene].questions;
    if (qs.isEmpty) {
      _goNextScene();
    } else {
      setState(() {
        _q = 0;
        _phase = _Phase.questions;
      });
    }
  }

  void _nextQuestion() {
    final qs = _story!.sceneList[_scene].questions;
    if (_q + 1 < qs.length) {
      setState(() => _q++);
    } else {
      _goNextScene();
    }
  }

  QuestionModel _toQuestion(RecoveryQuestion q) => QuestionModel(
        id: q.itemId,
        type: q.type,
        stem: q.prompt,
        difficulty: '',
        options: [
          for (var i = 0; i < q.options.length; i++)
            AnswerOptionModel(id: q.options[i].id, text: q.options[i].text, order: i),
        ],
      );

  bool get _ar => Localizations.localeOf(context).languageCode == 'ar';

  @override
  Widget build(BuildContext context) {
    final story = _story;

    // Mid-questions the QuestionPage draws its own app bar; the scene text stays above the question.
    if (story != null && _phase == _Phase.questions) {
      final scene = story.sceneList[_scene];
      final q = scene.questions[_q];
      return QuestionPage(
        key: ValueKey(q.itemId),
        sessionId: _sessionId,
        questionId: q.itemId,
        initialQuestion: _toQuestion(q),
        passage: sceneAsText(scene.lines),
        onNext: _nextQuestion,
      );
    }

    Widget body;
    if (_locked) {
      body = AIMEmptyState(
        icon: const Icon(Icons.lock_rounded),
        title: context.tr('This story is locked', 'هذه القصة مقفلة'),
        subtitle: context.tr(
          'Finish the earlier courses to unlock it. Meanwhile, read the stories that are open.',
          'أنهِ الدورات السابقة لفتحها. في هذه الأثناء، اقرأ القصص المفتوحة.',
        ),
        action: AIMButton(
          onPressed: () => context.pop(),
          child: Text(context.tr('Back to stories', 'العودة إلى القصص')),
        ),
      );
    } else if (_error != null && story == null) {
      body = AIMFullScreenError(message: _error!, onRetry: _load);
    } else if (story == null) {
      body = AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    } else {
      body = switch (_phase) {
        _Phase.intro => _intro(context, story),
        _Phase.scene => _sceneView(context, story),
        _ => _doneView(context, story),
      };
    }

    final s = story?.summary;
    final title = s == null ? context.tr('Stories', 'القصص') : ((_ar && (s.titleAr ?? '').isNotEmpty) ? s.titleAr! : s.title);
    return Scaffold(
      appBar: AIMTopAppBar(
        title: title,
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: SafeArea(top: false, child: body),
    );
  }

  Widget _intro(BuildContext context, StoryDetail story) {
    final surfaces = aimSurfacesOf(context);
    final s = story.summary;
    final summary = (_ar && (s.summaryAr ?? '').isNotEmpty) ? s.summaryAr! : s.summary;
    final label = s.completed
        ? context.tr('Read again', 'اقرأ مجددًا')
        : s.answered > 0
            ? context.tr('Continue', 'تابع')
            : context.tr('Start reading', 'ابدأ القراءة');
    return ListView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      children: [
        const SizedBox(height: AimSpacing.space16),
        const Center(child: StoryCast(size: 52)),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(
          s.cefrCode ?? s.courseTitle,
          textAlign: TextAlign.center,
          style: AimTextStyles.caption.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(summary, textAlign: TextAlign.center, style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary, height: 1.5)),
        const SizedBox(height: AimSpacing.space8),
        Text(
          [
            fill(context.tr('{n} scenes', '{n} مشاهد'), {'n': s.scenes}),
            fill(context.tr('{n} min', '{n} د'), {'n': s.minutes}),
            fill(context.tr('{n} questions', '{n} أسئلة'), {'n': s.questions}),
          ].join(' · '),
          textAlign: TextAlign.center,
          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted, fontWeight: FontWeight.w600),
        ),
        if (_error != null) ...[
          const SizedBox(height: AimSpacing.componentGap),
          AIMAlertBanner(tone: AIMAlertTone.error, child: Text(_error!)),
        ],
        const SizedBox(height: AimSpacing.sectionGap),
        AIMButton(
          fullWidth: true,
          onPressed: _starting ? null : () => _begin(fromStart: s.completed),
          child: Text(_starting ? context.tr('Preparing…', 'جارٍ التجهيز…') : label),
        ),
      ],
    );
  }

  Widget _sceneView(BuildContext context, StoryDetail story) {
    final surfaces = aimSurfacesOf(context);
    final total = story.sceneList.length;
    final scene = story.sceneList[_scene];
    final setting = (_ar && (scene.settingAr ?? '').isNotEmpty) ? scene.settingAr! : scene.setting;
    final last = _scene + 1 >= total;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile, AimSpacing.space8, AimSpacing.screenPaddingMobile, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                fill(context.tr('Scene {n} of {total}', 'المشهد {n} من {total}'), {'n': _scene + 1, 'total': total}),
                style: AimTextStyles.caption.copyWith(color: surfaces.textMuted, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(value: _scene / total, minHeight: 8),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
            children: [StorySceneView(setting: setting, lines: scene.lines)],
          ),
        ),
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile, 0, AimSpacing.screenPaddingMobile, AimSpacing.space12),
          child: AIMButton(
            fullWidth: true,
            onPressed: _afterScene,
            child: Text(scene.questions.isNotEmpty
                ? context.tr('Answer the questions', 'أجب عن الأسئلة')
                : last
                    ? context.tr('Finish story', 'إنهاء القصة')
                    : context.tr('Next scene', 'المشهد التالي')),
          ),
        ),
      ],
    );
  }

  Widget _doneView(BuildContext context, StoryDetail story) {
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: context.tr('Story complete', 'اكتملت القصة'),
      subtitle: context.tr('Your answers count toward your skills.', 'إجاباتك تُحتسب ضمن مهاراتك.'),
      action: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AIMButton(onPressed: () => _begin(fromStart: true), child: Text(context.tr('Read again', 'اقرأ مجددًا'))),
          const SizedBox(height: AimSpacing.space8),
          AIMButton(
            variant: AIMButtonVariant.secondary,
            onPressed: () {
              ref.invalidate(storiesProvider);
              context.pop();
            },
            child: Text(context.tr('Back to stories', 'العودة إلى القصص')),
          ),
          const SizedBox(height: AimSpacing.space8),
          AIMButton(
            variant: AIMButtonVariant.secondary,
            onPressed: () => context.go(AppRoutePaths.improve),
            child: Text(context.tr('See my skills', 'عرض مهاراتي')),
          ),
        ],
      ),
    );
  }
}
