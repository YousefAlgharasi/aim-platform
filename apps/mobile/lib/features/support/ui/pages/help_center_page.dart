// Help & Support — same layout as the student web app: a title, two action
// cards (Submit a Ticket, Send Feedback), the student's own tickets, then the
// common questions. Tickets come from the backend (GET /support-tickets); the
// questions are static app copy.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import '../../logic/provider/support_provider.dart';
import '../widgets/help_faq_accordion.dart';

class HelpCenterPage extends ConsumerStatefulWidget {
  const HelpCenterPage({super.key});

  @override
  ConsumerState<HelpCenterPage> createState() => _HelpCenterPageState();
}

class _HelpCenterPageState extends ConsumerState<HelpCenterPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => ref.read(ticketListProvider.notifier).load(),
    );
  }

  List<HelpCategory> _categories(BuildContext context) => [
        HelpCategory(
          title: context.tr('Lessons & Content', 'الدروس والمحتوى'),
          faqs: [
            HelpFaqItem(
              question: context.tr('How do I start a lesson?', 'كيف أبدأ درساً؟'),
              answer: context.tr(
                'Open Courses, choose a course and chapter, then tap any lesson to begin.',
                'افتح الدورات، واختر دورة وفصلاً، ثم اضغط على أي درس للبدء.',
              ),
            ),
            HelpFaqItem(
              question: context.tr('Can I learn offline?', 'هل يمكنني التعلّم دون اتصال؟'),
              answer: context.tr(
                'AIM Plus lets you download lessons for offline study from each lesson page.',
                'تتيح لك AIM Plus تنزيل الدروس للدراسة دون اتصال من صفحة كل درس.',
              ),
            ),
          ],
        ),
        HelpCategory(
          title: context.tr('Assessments & Grades', 'التقييمات والدرجات'),
          faqs: [
            HelpFaqItem(
              question: context.tr('When is my assessment graded?', 'متى يُصحَّح تقييمي؟'),
              answer: context.tr(
                'Most assessments are graded automatically right after you submit. Results appear on the assessment result screen.',
                'تُصحَّح معظم التقييمات تلقائياً فور التسليم، وتظهر النتيجة في شاشة نتيجة التقييم.',
              ),
            ),
            HelpFaqItem(
              question: context.tr('Can I retake a failed assessment?', 'هل يمكنني إعادة تقييم لم أنجح فيه؟'),
              answer: context.tr(
                'If retakes are allowed for that assessment, a new attempt button appears on its detail page.',
                'إذا كانت الإعادة مسموحة لذلك التقييم، يظهر زر محاولة جديدة في صفحة تفاصيله.',
              ),
            ),
          ],
        ),
        HelpCategory(
          title: context.tr('Account & Profile', 'الحساب والملف الشخصي'),
          faqs: [
            HelpFaqItem(
              question: context.tr('How do I change my profile details?', 'كيف أغيّر بيانات ملفي الشخصي؟'),
              answer: context.tr(
                'Go to Profile, then Edit Profile, to update your name and other account details.',
                'اذهب إلى الملف الشخصي ثم تعديل الملف لتحديث اسمك وبيانات حسابك.',
              ),
            ),
            HelpFaqItem(
              question: context.tr('How do I change my password?', 'كيف أغيّر كلمة المرور؟'),
              answer: context.tr(
                'Password changes are managed from your account settings on the sign-in screen.',
                'تُدار تغييرات كلمة المرور من إعدادات الحساب في شاشة تسجيل الدخول.',
              ),
            ),
          ],
        ),
        HelpCategory(
          title: context.tr('Billing & Subscription', 'الفواتير والاشتراك'),
          faqs: [
            HelpFaqItem(
              question: context.tr('How do I see my invoices?', 'كيف أرى فواتيري؟'),
              answer: context.tr(
                'Open Billing from the menu, then tap Invoices to see your billing history.',
                'افتح الفواتير من القائمة ثم اضغط على سجل الفواتير لرؤية سجل الدفع.',
              ),
            ),
            HelpFaqItem(
              question: context.tr('How do I cancel my subscription?', 'كيف ألغي اشتراكي؟'),
              answer: context.tr(
                'Open Billing and use the Cancel option. Access continues until the end of the current billing period.',
                'افتح الفواتير واستخدم خيار الإلغاء. يستمر الوصول حتى نهاية فترة الفوترة الحالية.',
              ),
            ),
          ],
        ),
        HelpCategory(
          title: context.tr('Technical Issues', 'مشاكل تقنية'),
          faqs: [
            HelpFaqItem(
              question: context.tr('The app is not loading my content.', 'التطبيق لا يحمّل المحتوى.'),
              answer: context.tr(
                'Check your internet connection and try again. If the problem continues, submit a ticket.',
                'تحقق من اتصالك بالإنترنت وأعد المحاولة. إذا استمرت المشكلة فأرسل تذكرة.',
              ),
            ),
          ],
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final tickets = ref.watch(ticketListProvider);
    final categories = _categories(context);

    Widget actionCard(IconData icon, String title, String desc, VoidCallback onTap) {
      return AIMCard(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  color: AimColors.primary500,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: Colors.white, size: 22),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AimTextStyles.bodyLg.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      desc,
                      style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                    ),
                  ],
                ),
              ),
              Icon(
                Directionality.of(context) == TextDirection.rtl
                    ? Icons.chevron_left_rounded
                    : Icons.chevron_right_rounded,
                color: surfaces.textMuted,
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        // Inside the app chrome the top inset is already handled, so this adds none.
        child: RefreshIndicator(
          onRefresh: () => ref.read(ticketListProvider.notifier).load(),
          child: ListView(
            padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
            children: [
              PageTitleBar(title: context.tr('Help & Support', 'المساعدة والدعم')),
              const SizedBox(height: AimSpacing.sectionGap),
              actionCard(
                Icons.assignment_outlined,
                context.tr('Submit a Ticket', 'أرسل تذكرة'),
                context.tr('Report an issue or ask for help', 'أبلغ عن مشكلة أو اطلب المساعدة'),
                () => context.push(AppRoutePaths.createTicket),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              actionCard(
                Icons.chat_bubble_outline_rounded,
                context.tr('Send Feedback', 'أرسل ملاحظاتك'),
                context.tr('Share your thoughts and suggestions', 'شاركنا رأيك واقتراحاتك'),
                () => context.push(AppRoutePaths.feedback),
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              _SectionTitle(context.tr('My Tickets', 'تذاكري')),
              const SizedBox(height: AimSpacing.componentGap),
              switch (tickets) {
                AppAsyncLoading() || AppAsyncIdle() => const Padding(
                    padding: EdgeInsets.all(AimSpacing.space24),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                AppAsyncFailure(:final message) => AIMCard(
                    child: Padding(
                      padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                      child: Column(
                        children: [
                          Text(message, textAlign: TextAlign.center),
                          const SizedBox(height: AimSpacing.space8),
                          AIMButton(
                            size: AIMButtonSize.small,
                            variant: AIMButtonVariant.secondary,
                            onPressed: () => ref.read(ticketListProvider.notifier).load(),
                            child: Text(context.tr('Retry', 'إعادة المحاولة')),
                          ),
                        ],
                      ),
                    ),
                  ),
                AppAsyncSuccess(:final data) => data.isEmpty
                    ? AIMEmptyState(
                        icon: const Icon(Icons.confirmation_number_outlined),
                        title: context.tr('No tickets yet', 'لا توجد تذاكر بعد'),
                        subtitle: context.tr(
                          'Submit a ticket above if you need help.',
                          'أرسل تذكرة أعلاه إذا احتجت إلى مساعدة.',
                        ),
                      )
                    : Column(
                        children: [
                          for (final t in data) ...[
                            AIMCard(
                              onTap: () => context.push(
                                AppRoutePaths.ticketDetail,
                                extra: {'ticketId': t.id},
                              ),
                              child: Padding(
                                padding: const EdgeInsetsDirectional.all(AimSpacing.space16),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            t.subject,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: AimTextStyles.bodyMd.copyWith(
                                              color: surfaces.textPrimary,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${_label(t.category)} · ${t.createdAt.year}-${t.createdAt.month.toString().padLeft(2, '0')}-${t.createdAt.day.toString().padLeft(2, '0')}',
                                            style: AimTextStyles.caption.copyWith(
                                              color: surfaces.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: AimSpacing.space8),
                                    StatusChip(
                                      label: _status(context, t.status),
                                      color: switch (t.status) {
                                        'resolved' => AimColors.success500,
                                        'closed' => surfaces.textMuted,
                                        _ => AimColors.primary500,
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: AimSpacing.listItemGap),
                          ],
                        ],
                      ),
              },
              const SizedBox(height: AimSpacing.sectionGap),
              _SectionTitle(context.tr('Common questions', 'أسئلة شائعة')),
              const SizedBox(height: AimSpacing.componentGap),
              for (final c in categories) ...[
                HelpCategoryAccordionCard(category: c),
                const SizedBox(height: AimSpacing.listItemGap),
              ],
              const SizedBox(height: AimSpacing.space8),
              AIMButton(
                fullWidth: true,
                variant: AIMButtonVariant.secondary,
                leadingIcon: const Icon(Icons.info_outline),
                onPressed: () => context.push(AppRoutePaths.supportStatus),
                child: Text(context.tr('System status', 'حالة النظام')),
              ),
              const SizedBox(height: AimSpacing.space24),
            ],
          ),
        ),
      ),
    );
  }

  static String _label(String value) {
    final words = value.split('_').where((w) => w.isNotEmpty);
    return words.map((w) => w[0].toUpperCase() + w.substring(1)).join(' ');
  }

  String _status(BuildContext context, String status) => switch (status) {
        'open' => context.tr('Open', 'مفتوحة'),
        'in_progress' => context.tr('In progress', 'قيد المعالجة'),
        'resolved' => context.tr('Resolved', 'تم الحل'),
        'closed' => context.tr('Closed', 'مغلقة'),
        _ => _label(status),
      };
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: AimTextStyles.h3.copyWith(color: aimSurfacesOf(context).textPrimary),
      );
}
