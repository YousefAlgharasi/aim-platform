import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSLearningSection extends StatefulWidget {
  const DSLearningSection({super.key});

  @override
  State<DSLearningSection> createState() => _DSLearningSectionState();
}

class _DSLearningSectionState extends State<DSLearningSection> {
  AIMAnswerOptionState _answerState = AIMAnswerOptionState.defaultState;
  bool _recording = false;
  int _recordSeconds = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Blob Card
        DSSection(
          title: l10n.dsPreviewSectionBlobCard,
          children: [
            AIMBlobCard(
              gradient: AimGradients.gzLime,
              icon: const Icon(Icons.local_fire_department_rounded),
              title: l10n.dsPreviewStreakTitle,
              subtitle: l10n.dsPreviewStreakSubtitle,
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {},
            ),
            AIMBlobCard(
              backgroundColor: AimColors.primary100,
              icon: const Icon(Icons.bolt_rounded, color: AimColors.primary500),
              title: l10n.dsPreviewXpWeekTitle,
              onTap: () {},
            ),
          ],
        ),

        // Stat Tile
        DSSection(
          title: l10n.dsPreviewSectionStatTile,
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  AIMStatTile(
                    icon: const Icon(Icons.local_fire_department_rounded),
                    value: '5',
                    label: l10n.dsPreviewStatDayStreak,
                  ),
                  const SizedBox(width: 12),
                  AIMStatTile(
                    icon: const Icon(Icons.bolt_rounded),
                    value: '320',
                    label: l10n.dsPreviewStatXp,
                    accentColor: AimColors.warning500,
                  ),
                  const SizedBox(width: 12),
                  AIMStatTile(
                    icon: const Icon(Icons.school_outlined),
                    value: '12',
                    label: l10n.dsPreviewStatLessons,
                    accentColor: AimColors.success500,
                  ),
                ],
              ),
            ),
          ],
        ),

        // Skill Blob
        DSSection(
          title: l10n.dsPreviewSectionSkillBlob,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Wrap(
              spacing: 24,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                AIMSkillBlob(
                  skillName: l10n.placementSkillListening,
                  masteryLevel: 0.72,
                  size: AIMSkillBlobSize.sm,
                ),
                AIMSkillBlob(
                  skillName: l10n.dsPreviewSkillSpeaking,
                  masteryLevel: 0.45,
                  color: AimColors.accent500,
                ),
                AIMSkillBlob(
                  skillName: l10n.placementSkillGrammar,
                  masteryLevel: 0.9,
                  color: AimColors.success500,
                  size: AIMSkillBlobSize.lg,
                ),
              ],
            ),
          ],
        ),

        // AIM Card
        DSSection(
          title: l10n.dsPreviewSectionAimCard,
          children: [
            AIMCard(child: Text(l10n.dsPreviewCardStandard)),
            AIMCard(
              variant: AIMCardVariant.elevated,
              child: Text(l10n.dsPreviewCardElevated),
            ),
            AIMCard(
              variant: AIMCardVariant.ai,
              child: Text(l10n.dsPreviewCardAiGradientBorder),
            ),
            AIMCard(
              variant: AIMCardVariant.gradient,
              child: Text(
                l10n.dsPreviewCardGradientAiContent,
                style: const TextStyle(color: Colors.white),
              ),
            ),
            AIMCard(
              interactive: true,
              onTap: () {},
              child: Row(
                children: [
                  Expanded(child: Text(l10n.dsPreviewCardInteractiveTapMe)),
                  const Icon(Icons.chevron_right),
                ],
              ),
            ),
          ],
        ),

        // Progress Bar
        DSSection(
          title: l10n.dsPreviewSectionProgressBar,
          children: [
            AIMProgressBar(
              value: 70,
              label: l10n.dsPreviewProgressLesson,
              showValue: true,
            ),
            AIMProgressBar(
              value: 320,
              max: 500,
              tone: AIMProgressBarTone.gradient,
              label: l10n.dsPreviewProgressXpNextLevel,
              showValue: true,
              size: AIMProgressBarSize.lg,
            ),
            AIMProgressBar(
              value: 85,
              tone: AIMProgressBarTone.success,
              label: l10n.dsPreviewProgressGrammarMastery,
              showValue: true,
            ),
            AIMProgressBar(
              value: 40,
              tone: AIMProgressBarTone.warning,
              label: l10n.dsPreviewProgressVocabRetention,
              showValue: true,
              size: AIMProgressBarSize.sm,
            ),
            AIMProgressBar(
              value: 320,
              max: 500,
              tone: AIMProgressBarTone.gradient,
              showValue: true,
              valueFormat: (v, m) => l10n.dsPreviewXpProgressFormat(
                v.toInt(),
                m.toInt(),
              ),
            ),
          ],
        ),

        // Circular Progress
        DSSection(
          title: l10n.dsPreviewSectionCircularProgress,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Wrap(
              spacing: 24,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                Column(
                  children: [
                    AIMCircularProgress(
                      value: 68,
                      caption: l10n.dsPreviewCircularDailyGoal,
                    ),
                    const SizedBox(height: 4),
                    Text(l10n.dsPreviewWordPrimary, style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    AIMCircularProgress(
                      value: 68,
                      tone: AIMCircularProgressTone.gradient,
                      caption: l10n.dsPreviewCircularDailyGoal,
                    ),
                    const SizedBox(height: 4),
                    Text(l10n.dsPreviewWordGradient, style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    AIMCircularProgress(
                      value: 9,
                      max: 10,
                      tone: AIMCircularProgressTone.success,
                      label: Text(
                        '9/10',
                        style: AimTextStyles.h2.copyWith(
                          color: AimColors.success700,
                        ),
                      ),
                      caption: l10n.dsPreviewCircularScore,
                    ),
                    const SizedBox(height: 4),
                    Text(l10n.dsPreviewWordSuccess, style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    const AIMCircularProgress(value: 25, size: 64, thickness: 6),
                    const SizedBox(height: 4),
                    Text(l10n.dsPreviewWordSmall, style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    const AIMCircularProgress(value: 80, size: 128, thickness: 12),
                    const SizedBox(height: 4),
                    Text(l10n.dsPreviewWordLarge, style: AimTextStyles.caption),
                  ],
                ),
              ],
            ),
          ],
        ),

        // Answer Options
        DSSection(
          title: l10n.dsPreviewSectionAnswerOptions,
          children: [
            AIMAnswerOption(
              optionKey: 'A',
              state: _answerState == AIMAnswerOptionState.defaultState
                  ? AIMAnswerOptionState.defaultState
                  : AIMAnswerOptionState.defaultState,
              onTap: () => setState(
                () => _answerState = AIMAnswerOptionState.selected,
              ),
              child: const Text('She has lived here for three years.'),
            ),
            const AIMAnswerOption(
              optionKey: 'B',
              state: AIMAnswerOptionState.selected,
              child: Text('She have lived here for three years.'),
            ),
            const AIMAnswerOption(
              optionKey: 'C',
              state: AIMAnswerOptionState.correct,
              child: Text('She had lived here for three years.'),
            ),
            const AIMAnswerOption(
              optionKey: 'D',
              state: AIMAnswerOptionState.incorrect,
              child: Text('She is lived here for three years.'),
            ),
            const AIMAnswerOption(
              optionKey: 'E',
              state: AIMAnswerOptionState.reveal,
              child: Text(
                'Reveal — this was the correct answer.',
              ),
            ),
          ],
        ),

        // AI Feedback Bubble
        DSSection(
          title: l10n.dsPreviewSectionAiFeedbackBubble,
          children: const [
            AIMAIFeedbackBubble(
              child: Text('Welcome! Let\'s practice English together.'),
            ),
            AIMAIFeedbackBubble(
              tone: AIMAIFeedbackTone.praise,
              child: Text(
                'Great sentence! Your use of present perfect is spot on.',
              ),
            ),
            AIMAIFeedbackBubble(
              tone: AIMAIFeedbackTone.correction,
              child: Text(
                'Try "have been" instead of "has been" with I.',
              ),
            ),
            AIMAIFeedbackBubble(typing: true),
          ],
        ),

        // Record Button
        DSSection(
          title: l10n.dsPreviewSectionRecordButton,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Wrap(
              spacing: 32,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                AIMRecordButton(
                  recording: _recording,
                  caption: _recording
                      ? '0:${_recordSeconds.toString().padLeft(2, '0')}'
                      : null,
                  onToggle: () {
                    setState(() {
                      _recording = !_recording;
                      if (!_recording) _recordSeconds = 0;
                    });
                  },
                ),
                const AIMRecordButton(
                  recording: false,
                  disabled: true,
                ),
                const AIMRecordButton(
                  recording: true,
                  caption: '0:42',
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
