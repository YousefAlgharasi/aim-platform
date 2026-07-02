import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Blob Card
        DSSection(
          title: 'Blob Card',
          children: [
            AIMBlobCard(
              gradient: AimGradients.gzLime,
              icon: const Icon(Icons.local_fire_department_rounded),
              title: '5-day streak',
              subtitle: 'Keep it going today',
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {},
            ),
            AIMBlobCard(
              backgroundColor: AimColors.primary100,
              icon: const Icon(Icons.bolt_rounded, color: AimColors.primary500),
              title: '320 XP this week',
              onTap: () {},
            ),
          ],
        ),

        // Stat Tile
        DSSection(
          title: 'Stat Tile',
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: const [
                  AIMStatTile(
                    icon: Icon(Icons.local_fire_department_rounded),
                    value: '5',
                    label: 'Day streak',
                  ),
                  SizedBox(width: 12),
                  AIMStatTile(
                    icon: Icon(Icons.bolt_rounded),
                    value: '320',
                    label: 'XP',
                    accentColor: AimColors.warning500,
                  ),
                  SizedBox(width: 12),
                  AIMStatTile(
                    icon: Icon(Icons.school_outlined),
                    value: '12',
                    label: 'Lessons',
                    accentColor: AimColors.success500,
                  ),
                ],
              ),
            ),
          ],
        ),

        // Skill Blob
        const DSSection(
          title: 'Skill Blob',
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Wrap(
              spacing: 24,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                AIMSkillBlob(
                  skillName: 'Listening',
                  masteryLevel: 0.72,
                  size: AIMSkillBlobSize.sm,
                ),
                AIMSkillBlob(
                  skillName: 'Speaking',
                  masteryLevel: 0.45,
                  color: AimColors.accent500,
                ),
                AIMSkillBlob(
                  skillName: 'Grammar',
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
          title: 'AIM Card',
          children: [
            const AIMCard(child: Text('Standard card')),
            const AIMCard(
              variant: AIMCardVariant.elevated,
              child: Text('Elevated card'),
            ),
            const AIMCard(
              variant: AIMCardVariant.ai,
              child: Text('AI card (gradient border)'),
            ),
            const AIMCard(
              variant: AIMCardVariant.gradient,
              child: Text(
                'Gradient card — AI adaptive content',
                style: TextStyle(color: Colors.white),
              ),
            ),
            AIMCard(
              interactive: true,
              onTap: () {},
              child: const Row(
                children: [
                  Expanded(child: Text('Interactive card — tap me')),
                  Icon(Icons.chevron_right),
                ],
              ),
            ),
          ],
        ),

        // Progress Bar
        DSSection(
          title: 'Progress Bar',
          children: [
            const AIMProgressBar(
              value: 70,
              label: 'Lesson progress',
              showValue: true,
            ),
            const AIMProgressBar(
              value: 320,
              max: 500,
              tone: AIMProgressBarTone.gradient,
              label: 'XP to next level',
              showValue: true,
              size: AIMProgressBarSize.lg,
            ),
            const AIMProgressBar(
              value: 85,
              tone: AIMProgressBarTone.success,
              label: 'Grammar mastery',
              showValue: true,
            ),
            const AIMProgressBar(
              value: 40,
              tone: AIMProgressBarTone.warning,
              label: 'Vocabulary retention',
              showValue: true,
              size: AIMProgressBarSize.sm,
            ),
            AIMProgressBar(
              value: 320,
              max: 500,
              tone: AIMProgressBarTone.gradient,
              showValue: true,
              valueFormat: (v, m) => '${v.toInt()}/${m.toInt()} XP',
            ),
          ],
        ),

        // Circular Progress
        DSSection(
          title: 'Circular Progress',
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Wrap(
              spacing: 24,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                const Column(
                  children: [
                    AIMCircularProgress(value: 68, caption: 'daily goal'),
                    SizedBox(height: 4),
                    Text('Primary', style: AimTextStyles.caption),
                  ],
                ),
                const Column(
                  children: [
                    AIMCircularProgress(
                      value: 68,
                      tone: AIMCircularProgressTone.gradient,
                      caption: 'daily goal',
                    ),
                    SizedBox(height: 4),
                    Text('Gradient', style: AimTextStyles.caption),
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
                      caption: 'score',
                    ),
                    const SizedBox(height: 4),
                    const Text('Success', style: AimTextStyles.caption),
                  ],
                ),
                const Column(
                  children: [
                    AIMCircularProgress(value: 25, size: 64, thickness: 6),
                    SizedBox(height: 4),
                    Text('Small', style: AimTextStyles.caption),
                  ],
                ),
                const Column(
                  children: [
                    AIMCircularProgress(value: 80, size: 128, thickness: 12),
                    SizedBox(height: 4),
                    Text('Large', style: AimTextStyles.caption),
                  ],
                ),
              ],
            ),
          ],
        ),

        // Answer Options
        DSSection(
          title: 'Answer Options',
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
        const DSSection(
          title: 'AI Feedback Bubble',
          children: [
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
          title: 'Record Button',
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
