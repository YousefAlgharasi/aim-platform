import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/routing/app_route_paths.dart';
import '../../../core/widgets/widgets.dart';
import '../../shell/logic/main_shell_tab_provider.dart';
import '../data/learner_tools_api.dart';

/// My mistakes — retry the questions you got wrong, one at a time.
/// A drill only: the backend checks each answer and it does not change level
/// or progress. Mirrors the web app's "My mistakes" page.
class MistakesPage extends ConsumerStatefulWidget {
  const MistakesPage({super.key, this.quick = false, this.skill});

  /// Limit the round to 5 questions ("5-minute fix session").
  final bool quick;

  /// Only the mistakes that train this skill (opened from a weak spot).
  final String? skill;

  @override
  ConsumerState<MistakesPage> createState() => _MistakesPageState();
}

class _MistakesPageState extends ConsumerState<MistakesPage> {
  List<MistakeItem>? _items;
  int _total = 0;
  String? _error;
  int _index = 0;
  String? _picked;
  MistakeCheck? _result;
  int _fixed = 0;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _items = null;
      _index = 0;
      _picked = null;
      _result = null;
      _fixed = 0;
    });
    try {
      final r = await ref.read(learnerToolsApiProvider).listMistakes(skill: widget.skill);
      if (!mounted) return;
      setState(() {
        _items = widget.quick ? r.items.take(5).toList() : r.items;
        _total = widget.quick ? (r.total < 5 ? r.total : 5) : r.total;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e, context.tr('Could not load your mistakes', 'تعذّر تحميل أخطائك')));
    }
  }

  Future<void> _check(MistakeItem item, String optionId) async {
    if (_result != null || _busy) return;
    setState(() {
      _picked = optionId;
      _busy = true;
    });
    try {
      final r = await ref.read(learnerToolsApiProvider).checkMistake(item.itemId, optionId);
      if (!mounted) return;
      setState(() {
        _result = r;
        if (r.correct) _fixed++;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _picked = null;
        _error = errorText(e, context.tr('Could not check your answer', 'تعذّر التحقق من إجابتك'));
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _next() => setState(() {
        _picked = null;
        _result = null;
        _index++;
      });

  String get _skillLabel => widget.skill == null
      ? ''
      : skillName(ref.watch(skillTitlesProvider).valueOrNull ?? const {}, widget.skill!);

  @override
  Widget build(BuildContext context) {
    final title = widget.quick
        ? context.tr('5-minute fix session', 'جلسة إصلاح لخمس دقائق')
        : context.tr('My mistakes', 'أخطائي');
    final items = _items;

    Widget body;
    if (_error != null) {
      body = AIMFullScreenError(message: _error!, onRetry: _load);
    } else if (items == null) {
      body = AIMFullScreenLoading(semanticLabel: context.tr('Loading', 'جارٍ التحميل'));
    } else if (items.isEmpty) {
      body = AIMEmptyState(
        icon: const Icon(Icons.check_circle_outline_rounded),
        title: context.tr('Nothing to fix', 'لا شيء لتصحيحه'),
        subtitle: context.tr(
          'Questions you get wrong in practice will show up here so you can try them again.',
          'الأسئلة التي تخطئ فيها أثناء التدريب ستظهر هنا لتجرّبها مرة أخرى.',
        ),
        action: AIMButton(
          onPressed: _goCourses,
          child: Text(context.tr('Keep practicing', 'واصل التدرب')),
        ),
      );
    } else if (_index >= items.length) {
      body = _roundComplete(context, items.length);
    } else {
      body = _question(context, items);
    }

    return Scaffold(
      appBar: AIMTopAppBar(title: title),
      body: SafeArea(top: false, child: body),
    );
  }

  void _goCourses() {
    ref.read(mainShellTabIndexProvider.notifier).state = 1;
    context.go(AppRoutePaths.mainShell);
  }

  Widget _roundComplete(BuildContext context, int count) {
    final allFixed = _fixed == count;
    return AIMEmptyState(
      icon: const Icon(Icons.emoji_events_outlined),
      title: context.tr('Round complete', 'اكتملت الجولة'),
      subtitle: allFixed
          ? context.tr('You fixed every one. Nice work.', 'صحّحتها كلها. أحسنت!')
          : fill(context.tr('You fixed {fixed} of {total}.', 'صحّحت {fixed} من {total}.'), {'fixed': _fixed, 'total': count}),
      action: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!allFixed) ...[
            AIMButton(onPressed: _load, child: Text(context.tr('Try the rest', 'جرّب البقية'))),
            const SizedBox(height: AimSpacing.space8),
          ],
          AIMButton(
            variant: allFixed ? AIMButtonVariant.primary : AIMButtonVariant.secondary,
            onPressed: () => context.pushReplacement(AppRoutePaths.improve),
            child: Text(context.tr('See weak spots', 'اعرض نقاط الضعف')),
          ),
          const SizedBox(height: AimSpacing.space8),
          AIMButton(
            variant: AIMButtonVariant.secondary,
            onPressed: _goCourses,
            child: Text(context.tr('Back to courses', 'العودة إلى الدورات')),
          ),
        ],
      ),
    );
  }

  Widget _question(BuildContext context, List<MistakeItem> items) {
    final surfaces = aimSurfacesOf(context);
    final item = items[_index];
    final result = _result;
    final subtitle = widget.skill != null
        ? fill(context.tr('{skill}: {n} to fix', '{skill}: {n} للتصحيح'), {'skill': _skillLabel, 'n': _total})
        : fill(context.tr('{n} to fix', '{n} للتصحيح'), {'n': _total});

    return ListView(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      children: [
        Text(subtitle, style: AimTextStyles.caption.copyWith(color: surfaces.textMuted)),
        const SizedBox(height: AimSpacing.space8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(value: _index / items.length, minHeight: 8),
        ),
        const SizedBox(height: AimSpacing.space4),
        Text(
          fill(context.tr('Question {n} of {total}', 'السؤال {n} من {total}'), {'n': _index + 1, 'total': items.length}),
          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(item.prompt, style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary)),
        if (item.yourAnswer != null && result == null) ...[
          const SizedBox(height: AimSpacing.space8),
          Text(
            fill(context.tr('Last time you answered: {answer}', 'إجابتك السابقة: {answer}'), {'answer': '\u2068${item.yourAnswer}\u2069'}),
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
          ),
        ],
        const SizedBox(height: AimSpacing.sectionGap),
        for (var i = 0; i < item.options.length; i++) ...[
          _OptionTile(
            letter: String.fromCharCode(65 + i),
            text: item.options[i].text,
            state: _stateOf(item.options[i].id),
            onTap: (result != null || _busy) ? null : () => _check(item, item.options[i].id),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        if (result != null) ...[
          const SizedBox(height: AimSpacing.space4),
          _Feedback(result: result),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMButton(
            fullWidth: true,
            onPressed: _next,
            child: Text(_index + 1 >= items.length
                ? context.tr('Finish', 'إنهاء')
                : context.tr('Next question', 'السؤال التالي')),
          ),
        ],
      ],
    );
  }

  _OptionState _stateOf(String id) {
    final result = _result;
    if (result == null) return _picked == id ? _OptionState.picked : _OptionState.idle;
    if (result.correctChoiceId == id) return _OptionState.right;
    return _picked == id ? _OptionState.wrong : _OptionState.dim;
  }
}

enum _OptionState { idle, picked, right, wrong, dim }

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.letter,
    required this.text,
    required this.state,
    required this.onTap,
  });

  final String letter;
  final String text;
  final _OptionState state;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final (Color border, Color fill) = switch (state) {
      _OptionState.right => (AimColors.success500, AimColors.success500.withValues(alpha: 0.12)),
      _OptionState.wrong => (AimColors.error500, AimColors.error500.withValues(alpha: 0.12)),
      _OptionState.picked => (AimColors.primary500, AimColors.primary500.withValues(alpha: 0.10)),
      _ => (surfaces.border, surfaces.surfaceRaised),
    };
    return Opacity(
      opacity: state == _OptionState.dim ? 0.55 : 1,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AimRadius.md),
        child: Container(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          decoration: BoxDecoration(
            color: fill,
            borderRadius: BorderRadius.circular(AimRadius.md),
            border: Border.all(color: border, width: 1.5),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: surfaces.surfaceSunken,
                ),
                child: Text(letter, style: AimTextStyles.bodySm.copyWith(fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Text(text, style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary)),
              ),
              if (state == _OptionState.right)
                const Icon(Icons.check_circle_rounded, color: AimColors.success500)
              else if (state == _OptionState.wrong)
                const Icon(Icons.cancel_rounded, color: AimColors.error500),
            ],
          ),
        ),
      ),
    );
  }
}

class _Feedback extends StatelessWidget {
  const _Feedback({required this.result});
  final MistakeCheck result;

  @override
  Widget build(BuildContext context) {
    final color = result.correct ? AimColors.success500 : AimColors.error500;
    return Container(
      padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AimRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            result.correct
                ? context.tr('Correct — fixed!', 'صحيح — تم التصحيح!')
                : context.tr('Not quite', 'ليست دقيقة تمامًا'),
            style: AimTextStyles.bodyLg.copyWith(color: color, fontWeight: FontWeight.w700),
          ),
          if (!result.correct && result.correctText != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(fill(context.tr('Correct answer: {answer}', 'الإجابة الصحيحة: {answer}'), {'answer': '\u2068${result.correctText}\u2069'}),
                style: AimTextStyles.bodyMd),
          ],
          if (result.explanation != null && result.explanation!.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(result.explanation!, style: AimTextStyles.bodyMd),
          ],
        ],
      ),
    );
  }
}
