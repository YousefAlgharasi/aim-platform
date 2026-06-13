// Phase 2 — P2-055
// Edit profile page.
//
// Security boundary:
// - Only safe, backend-approved fields are editable: displayName, preferredLanguage, timezone.
// - Roles, permissions, userType, status, and email are NOT editable from this screen.
// - The backend validates all updates server-side and is the final authority.
// - No role or permission is sent in the update payload.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/state/app_async_state.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/profile_update_payload_models.dart';
import '../../logic/provider/profile_provider.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _displayNameController;
  late final TextEditingController _preferredLanguageController;
  late final TextEditingController _timezoneController;

  bool _dirty = false;

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
    _timezoneController = TextEditingController(text: profile?.timezone ?? '');

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
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Your session has expired. Please sign in again.'),
        ),
      );
      return;
    }

    final success = await ref
        .read(profileProvider.notifier)
        .updateProfile(bearerToken, studentPayload: payload);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated.')),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final isSubmitting = profileState is AppAsyncLoading;

    String? submitError;
    if (profileState case AppAsyncFailure(:final message)) {
      submitError = message;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        actions: [
          TextButton(
            onPressed: (isSubmitting || !_dirty) ? null : _submit,
            child: isSubmitting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (submitError != null) ...[
                _ErrorBanner(message: submitError),
                const SizedBox(height: 16),
              ],
              const _FieldLabel('Display Name'),
              TextFormField(
                controller: _displayNameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  hintText: 'Your display name',
                  border: OutlineInputBorder(),
                ),
                maxLength: 80,
                validator: (v) {
                  if (v != null && v.trim().length > 80) {
                    return 'Display name must be 80 characters or fewer.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              const _FieldLabel('Preferred Language'),
              TextFormField(
                controller: _preferredLanguageController,
                decoration: const InputDecoration(
                  hintText: 'e.g. en, ar',
                  border: OutlineInputBorder(),
                ),
                maxLength: 10,
              ),
              const SizedBox(height: 16),
              const _FieldLabel('Timezone'),
              TextFormField(
                controller: _timezoneController,
                decoration: const InputDecoration(
                  hintText: 'e.g. Asia/Riyadh',
                  border: OutlineInputBorder(),
                ),
                maxLength: 60,
              ),
              const SizedBox(height: 24),
              const _SafeFieldsNote(),
            ],
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        message,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onErrorContainer,
        ),
      ),
    );
  }
}

class _SafeFieldsNote extends StatelessWidget {
  const _SafeFieldsNote();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'Only your display name, preferred language, and timezone can be edited here. '
        'Email, roles, and account status are managed by the platform.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }
}
