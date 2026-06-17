import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
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
            AIMCard(
              variant: AIMCardVariant.gradient,
              child: const Text(
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
                Column(
                  children: [
                    const AIMCircularProgress(value: 68, caption: 'daily goal'),
                    const SizedBox(height: 4),
                    const Text('Primary', style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    const AIMCircularProgress(
                      value: 68,
                      tone: AIMCircularProgressTone.gradient,
                      caption: 'daily goal',
                    ),
                    const SizedBox(height: 4),
                    const Text('Gradient', style: AimTextStyles.caption),
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
                Column(
                  children: [
                    const AIMCircularProgress(value: 25, size: 64, thickness: 6),
                    const SizedBox(height: 4),
                    const Text('Small', style: AimTextStyles.caption),
                  ],
                ),
                Column(
                  children: [
                    const AIMCircularProgress(value: 80, size: 128, thickness: 12),
                    const SizedBox(height: 4),
                    const Text('Large', style: AimTextStyles.caption),
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
