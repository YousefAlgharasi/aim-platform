// A short "how this page works" guide, opened from a help (?) button in the page header.
//
// The web app highlights parts of the page one by one; on a phone the same tips read better as one
// bottom sheet with a numbered list. Text is English + Arabic, picked with `context.tr`.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';

class PageGuideStep {
  const PageGuideStep({
    required this.icon,
    required this.titleEn,
    required this.titleAr,
    required this.bodyEn,
    required this.bodyAr,
  });

  final IconData icon;
  final String titleEn;
  final String titleAr;
  final String bodyEn;
  final String bodyAr;
}

/// Opens the guide for a page as a bottom sheet.
Future<void> showPageGuide(
  BuildContext context, {
  required String titleEn,
  required String titleAr,
  required List<PageGuideStep> steps,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (sheetContext) {
      final theme = Theme.of(sheetContext);
      return SafeArea(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(sheetContext).size.height * 0.85,
          ),
          child: ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            children: [
              Text(
                sheetContext.tr(titleEn, titleAr),
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 16),
              for (var i = 0; i < steps.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: theme.colorScheme.primaryContainer,
                        child: Icon(
                          steps[i].icon,
                          size: 20,
                          color: theme.colorScheme.onPrimaryContainer,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${i + 1}. ${sheetContext.tr(steps[i].titleEn, steps[i].titleAr)}',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              sheetContext.tr(steps[i].bodyEn, steps[i].bodyAr),
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              FilledButton(
                onPressed: () => Navigator.of(sheetContext).pop(),
                child: Text(sheetContext.tr('Got it', 'فهمت')),
              ),
            ],
          ),
        ),
      );
    },
  );
}

/// The (?) button for a page header.
class PageGuideButton extends StatelessWidget {
  const PageGuideButton({
    super.key,
    required this.titleEn,
    required this.titleAr,
    required this.steps,
    this.color,
  });

  final String titleEn;
  final String titleAr;
  final List<PageGuideStep> steps;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final label = context.tr('Take a tour of this page', 'جولة تعريفية بهذه الصفحة');
    return IconButton(
      tooltip: label,
      icon: Icon(Icons.help_outline_rounded, color: color),
      onPressed: () => showPageGuide(
        context,
        titleEn: titleEn,
        titleAr: titleAr,
        steps: steps,
      ),
    );
  }
}

/// Guide steps for the live AI teacher voice room (same tips as the web app).
const List<PageGuideStep> voiceTeacherGuideSteps = [
  PageGuideStep(
    icon: Icons.smart_toy_outlined,
    titleEn: 'Your live teacher',
    titleAr: 'معلّمك المباشر',
    bodyEn: 'The robot shows what your teacher is doing: listening, thinking or speaking. Talk to it like a real teacher.',
    bodyAr: 'يوضح الروبوت ما يفعله معلّمك: يستمع أو يفكر أو يتحدث. تحدّث معه كما تتحدث مع معلّم حقيقي.',
  ),
  PageGuideStep(
    icon: Icons.mic_none_rounded,
    titleEn: 'Talk with your voice',
    titleAr: 'تحدّث بصوتك',
    bodyEn: 'Tap the microphone and start speaking. Tap it again to pause. Speak slowly and clearly.',
    bodyAr: 'اضغط على الميكروفون وابدأ الحديث. اضغط عليه مرة أخرى للإيقاف المؤقت. تحدّث ببطء ووضوح.',
  ),
  PageGuideStep(
    icon: Icons.keyboard_alt_outlined,
    titleEn: 'Or type',
    titleAr: 'أو اكتب',
    bodyEn: 'Cannot speak right now? Type your message in the box and press send.',
    bodyAr: 'لا تستطيع التحدث الآن؟ اكتب رسالتك في الحقل ثم اضغط إرسال.',
  ),
  PageGuideStep(
    icon: Icons.volume_up_outlined,
    titleEn: 'The teacher’s voice',
    titleAr: 'صوت المعلّم',
    bodyEn: 'Turn the teacher’s voice off if you only want to read, and on again to listen.',
    bodyAr: 'أوقف صوت المعلّم إذا أردت القراءة فقط، وأعد تشغيله عندما تريد الاستماع.',
  ),
  PageGuideStep(
    icon: Icons.forum_outlined,
    titleEn: 'Your conversation',
    titleAr: 'محادثتك',
    bodyEn: 'Everything you and the teacher say is written in the messages, so you can read it again.',
    bodyAr: 'كل ما تقوله أنت والمعلّم مكتوب في الرسائل لتقرأه مرة أخرى.',
  ),
];

/// Guide steps for the assessments list.
const List<PageGuideStep> assessmentsGuideSteps = [
  PageGuideStep(
    icon: Icons.assignment_outlined,
    titleEn: 'Quizzes and exams',
    titleAr: 'الاختبارات والامتحانات',
    bodyEn: 'Quizzes come at the end of chapters. The final exam comes at the end of the course.',
    bodyAr: 'تأتي الاختبارات القصيرة في نهاية الفصول، ويأتي الامتحان النهائي في نهاية الدورة.',
  ),
  PageGuideStep(
    icon: Icons.calendar_today_outlined,
    titleEn: 'Deadlines',
    titleAr: 'المواعيد',
    bodyEn: 'Tap the calendar to see what is due soon.',
    bodyAr: 'اضغط على التقويم لترى ما يحين موعده قريبًا.',
  ),
];
