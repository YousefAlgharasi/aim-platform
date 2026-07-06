// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Edit profile"
//   docs/design/ui-for-all-system-mobile/screenshots/light/17-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/17-screen.png
// Endpoint: PATCH /profile/me
// Widgets: AIMInput, AIMSelect, AIMGradientButton, AIMAlertBanner
//
// Phase 6 — P6-114
// Edit profile page — polished with AIM Mobile Design System.
//
// Security boundary:
// - Only safe, backend-approved fields are editable: displayName, preferredLanguage, timezone.
// - Roles, permissions, userType, status, and email are NOT editable from this screen.
// - The backend validates all updates server-side and is the final authority.
// - No role or permission is sent in the update payload.
// - No AIM Engine calls. No client-side scoring or authority.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/state/app_async_state.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/profile_update_payload_models.dart';
import '../../logic/provider/profile_provider.dart';

/// Edit profile screen — AIM Mobile Design System.
///
/// Allows the student to update [displayName], [preferredLanguage], and
/// [timezone] only. All other fields (email, roles, permissions, userType,
/// status) are read-only and enforced by the backend.
///
/// Design system: all colours, typography, spacing, radius, inputs, and
/// buttons use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: [EdgeInsetsDirectional]/[AlignmentDirectional] used
/// throughout so layout mirrors under the ambient locale direction (same
/// pattern as [RegisterPage]'s bespoke gradient header). No [TextDirection]
/// hard-coded.
///
/// Security:
/// - Reads initial values from authContextProvider (backend-sourced).
/// - Submits only the three safe fields to the backend via profileProvider.
/// - No credentials, no scoring, no AIM Engine calls.
class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

/// Selectable preferred-language options shown in the Edit Profile dropdown.
const List<AIMSelectOption> _kLanguageOptions = [
  AIMSelectOption(value: 'en', label: 'English'),
  AIMSelectOption(value: 'ar', label: 'Arabic'),
];

/// Curated IANA timezone options relevant to the platform's user base, plus
/// UTC.
///
/// Labels are formatted as `'{ianaId} (GMT{offset})'` to match the design.
/// Offsets shown are each zone's real, fixed UTC *standard* (non-DST) offset
/// — Dart's core `DateTime` can't resolve arbitrary IANA-zone offsets (and no
/// DST) without a timezone package, and none is installed, so DST shifts
/// (e.g. Europe/London and Europe/Paris in summer, America/New_York in
/// summer) are intentionally not reflected here.
const List<AIMSelectOption> _kTimezoneOptions = [
  AIMSelectOption(value: 'UTC', label: 'UTC (GMT+0)'),
  AIMSelectOption(value: 'Asia/Riyadh', label: 'Asia/Riyadh (GMT+3)'),
  AIMSelectOption(value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)'),
  AIMSelectOption(value: 'Asia/Kuwait', label: 'Asia/Kuwait (GMT+3)'),
  AIMSelectOption(value: 'Asia/Qatar', label: 'Asia/Qatar (GMT+3)'),
  AIMSelectOption(value: 'Asia/Bahrain', label: 'Asia/Bahrain (GMT+3)'),
  AIMSelectOption(value: 'Africa/Cairo', label: 'Africa/Cairo (GMT+2)'),
  AIMSelectOption(value: 'Asia/Amman', label: 'Asia/Amman (GMT+2)'),
  AIMSelectOption(value: 'Asia/Beirut', label: 'Asia/Beirut (GMT+2)'),
  AIMSelectOption(value: 'Europe/London', label: 'Europe/London (GMT+0)'),
  AIMSelectOption(value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)'),
  AIMSelectOption(
    value: 'America/New_York',
    label: 'America/New_York (GMT-5)',
  ),
];

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  late final TextEditingController _displayNameController;
  String? _preferredLanguage;
  String? _timezone;

  bool _dirty = false;

  // Inline validation errors (AIMInput shows these below the field).
  String? _displayNameError;

  @override
  void initState() {
    super.initState();
    final authCtx = ref.read(authContextProvider);
    final profile = authCtx is AppAsyncSuccess<AuthContextModel>
        ? authCtx.data.profile
        : null;

    _displayNameController =
        TextEditingController(text: profile?.displayName ?? '');
    _preferredLanguage = profile?.preferredLanguage;
    _timezone = profile?.timezone;

    _displayNameController.addListener(_markDirty);
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    super.dispose();
  }

  void _markDirty() {
    if (!_dirty) setState(() => _dirty = true);
    // Clear field error on next edit.
    if (_displayNameError != null) {
      setState(() => _displayNameError = null);
    }
  }

  bool _validate() {
    final dn = _displayNameController.text.trim();
    String? dnErr;
    if (dn.length > 80) {
      dnErr = 'Display name must be 80 characters or fewer.';
    }
    setState(() => _displayNameError = dnErr);
    return dnErr == null;
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    final dn = _displayNameController.text.trim();

    final payload = SafeStudentProfileUpdatePayloadModel(
      displayName: dn.isEmpty ? null : dn,
      preferredLanguage: _preferredLanguage,
      timezone: _timezone,
    );

    final bearerToken = ref.read(authFlowProvider).accessToken;

    if (bearerToken == null || bearerToken.isEmpty) {
      if (!mounted) return;
      AIMToast.show(
        context,
        message: 'Your session has expired. Please sign in again.',
        tone: AIMAlertTone.error,
      );
      return;
    }

    final success = await ref
        .read(profileProvider.notifier)
        .updateProfile(bearerToken, studentPayload: payload);

    if (!mounted) return;
    if (success) {
      AIMToast.show(context, message: 'Profile updated.');
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final profileState = ref.watch(profileProvider);
    final isSubmitting = profileState is AppAsyncLoading;
    final canSave = _dirty && !isSubmitting;

    String? submitError;
    if (profileState case AppAsyncFailure(:final message)) {
      submitError = message;
    }

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        children: [
          _EditProfileGradientHeader(
            canSave: canSave,
            isSubmitting: isSubmitting,
            onSave: _submit,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
                AimSpacing.screenPaddingMobile,
                AimSpacing.space32,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Submit error banner
                  if (submitError != null) ...[
                    AIMAlertBanner(
                      tone: AIMAlertTone.error,
                      child: Text(submitError),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                  ],

                  // Display Name
                  AIMInput(
                    label: 'Display Name',
                    placeholder: 'Your display name',
                    controller: _displayNameController,
                    error: _displayNameError,
                    textInputAction: TextInputAction.next,
                    semanticLabel: 'Display name field',
                  ),
                  const SizedBox(height: AimSpacing.componentGap),

                  // Preferred Language
                  AIMSelect(
                    label: 'Preferred Language',
                    placeholder: 'Select a language',
                    options: _kLanguageOptions,
                    value: _preferredLanguage,
                    onChanged: (value) {
                      setState(() {
                        _preferredLanguage = value;
                        _dirty = true;
                      });
                    },
                    semanticLabel: 'Preferred language field',
                  ),
                  const SizedBox(height: AimSpacing.componentGap),

                  // Timezone
                  AIMSelect(
                    label: 'Timezone',
                    placeholder: 'Select a timezone',
                    options: _kTimezoneOptions,
                    value: _timezone,
                    onChanged: (value) {
                      setState(() {
                        _timezone = value;
                        _dirty = true;
                      });
                    },
                    semanticLabel: 'Timezone field',
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),

                  // ── Save changes CTA ─────────────────────────────────
                  AIMGradientButton(
                    label: 'Save changes',
                    fullWidth: true,
                    loading: isSubmitting,
                    enabled: canSave,
                    onPressed: _submit,
                    semanticLabel: 'Save changes',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

/// Compact gradient header bar for the Edit Profile screen: back chevron,
/// "Edit profile" title, and a light "Save" text action, all in a single row
/// on a [AimGradients.gzHero] banner.
///
/// Bespoke rather than [AIMGradientHeroHeader]: that shared widget lays out
/// [leading] and [title] side-by-side (e.g. avatar + heading), which doesn't
/// match this screen's back-button-then-title nav-bar shape — the same
/// reason [RegisterPage] builds its own gradient header instead of reusing
/// it.
class _EditProfileGradientHeader extends StatelessWidget {
  const _EditProfileGradientHeader({
    required this.canSave,
    required this.isSubmitting,
    required this.onSave,
  });

  final bool canSave;
  final bool isSubmitting;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: AimSizes.topBarHeight,
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space8,
            ),
            child: Row(
              children: [
                Semantics(
                  button: true,
                  label: 'Back',
                  child: InkWell(
                    onTap: () => context.pop(),
                    customBorder: const CircleBorder(),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: AimColors.neutral0.withValues(alpha: 0.18),
                        shape: BoxShape.circle,
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(AimSpacing.space12),
                        child: Icon(
                          Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                          size: AimSizes.iconMd,
                          color: AimColors.neutral0,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsetsDirectional.only(
                      start: AimSpacing.space8,
                    ),
                    child: Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Text(
                        'Edit profile',
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: AimTextStyles.h3.copyWith(
                          color: AimColors.neutral0,
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  height: AimSizes.touchTarget,
                  child: TextButton(
                    onPressed: canSave ? onSave : null,
                    style: TextButton.styleFrom(
                      foregroundColor: AimColors.neutral0,
                      disabledForegroundColor:
                          AimColors.neutral0.withValues(alpha: 0.4),
                    ),
                    child: isSubmitting
                        ? const SizedBox(
                            width: AimSizes.iconMd,
                            height: AimSizes.iconMd,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AimColors.neutral0,
                            ),
                          )
                        : Text(
                            'Save',
                            style: AimTextStyles.button.copyWith(
                              color: AimColors.neutral0,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
