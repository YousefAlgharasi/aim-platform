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

import '../../../../core/state/app_async_state.dart';
import '../../../../core/theme/theme.dart';
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
/// RTL/Arabic: [EdgeInsetsDirectional] used throughout. [AIMTopAppBar]
/// mirrors the back icon. No [TextDirection] hard-coded.
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

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  late final TextEditingController _displayNameController;
  late final TextEditingController _preferredLanguageController;
  late final TextEditingController _timezoneController;

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
    _preferredLanguageController =
        TextEditingController(text: profile?.preferredLanguage ?? '');
    _timezoneController =
        TextEditingController(text: profile?.timezone ?? '');

    for (final ctrl in [
      _displayNameController,
      _preferredLanguageController,
      _timezoneController,
    ]) {
      ctrl.addListener(_markDirty);
    }
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _preferredLanguageController.dispose();
    _timezoneController.dispose();
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
    final lang = _preferredLanguageController.text.trim();
    final tz = _timezoneController.text.trim();

    final payload = SafeStudentProfileUpdatePayloadModel(
      displayName: dn.isEmpty ? null : dn,
      preferredLanguage: lang.isEmpty ? null : lang,
      timezone: tz.isEmpty ? null : tz,
    );

    final bearerToken = ref.read(authFlowProvider).accessToken;

    if (bearerToken == null || bearerToken.isEmpty) {
      if (!mounted) return;
      _showSnack('Your session has expired. Please sign in again.');
      return;
    }

    final success = await ref
        .read(profileProvider.notifier)
        .updateProfile(bearerToken, studentPayload: payload);

    if (!mounted) return;
    if (success) {
      _showSnack('Profile updated.');
      Navigator.of(context).pop();
    }
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final isSubmitting = profileState is AppAsyncLoading;
    final canSave = _dirty && !isSubmitting;

    String? submitError;
    if (profileState case AppAsyncFailure(:final message)) {
      submitError = message;
    }

    return Scaffold(
      appBar: AIMTopAppBar(
        title: 'Edit Profile',
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsetsDirectional.only(
              end: AimSpacing.space8,
            ),
            child: AIMButton(
              variant: AIMButtonVariant.ghost,
              size: AIMButtonSize.small,
              loading: isSubmitting,
              disabled: !canSave,
              onPressed: canSave ? _submit : null,
              child: const Text('Save'),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsetsDirectional.fromSTEB(
          AimSpacing.screenPaddingMobile,
          AimSpacing.space24,
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
            AIMInput(
              label: 'Preferred Language',
              placeholder: 'e.g. en, ar',
              controller: _preferredLanguageController,
              textInputAction: TextInputAction.next,
              semanticLabel: 'Preferred language field',
            ),
            const SizedBox(height: AimSpacing.componentGap),

            // Timezone
            AIMInput(
              label: 'Timezone',
              placeholder: 'e.g. Asia/Riyadh',
              controller: _timezoneController,
              textInputAction: TextInputAction.done,
              semanticLabel: 'Timezone field',
            ),
            const SizedBox(height: AimSpacing.sectionGap),

            // Safe-fields note
            AIMAlertBanner(
              tone: AIMAlertTone.info,
              child: const Text(
                'Only your display name, preferred language, and timezone '
                'can be edited here. Email, roles, and account status are '
                'managed by the platform.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
