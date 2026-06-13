// Phase 2 — P2-054
// Profile screen.
//
// Security boundary:
// - Displays only data returned from the backend via authContextProvider.
// - Role badges are UX-only. Backend is the final authority for role enforcement.
// - supabase_auth_uid and internal permission keys are never rendered.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/app_route_paths.dart';
import 'edit_profile_page.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/logout_provider.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authContextState = ref.watch(authContextProvider);
    final logoutState = ref.watch(logoutProvider);
    final isLoggingOut = logoutState is AppAsyncLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (authContextState is AppAsyncSuccess<AuthContextModel>)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit profile',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const EditProfilePage(),
                  ),
                );
              },
            ),
        ],
      ),
      body: switch (authContextState) {
        AppAsyncLoading() => const Center(child: CircularProgressIndicator()),
        AppAsyncFailure(:final message) => _ErrorBody(message: message),
        AppAsyncSuccess(:final data) => _ProfileBody(authContext: data),
        _ => const Center(child: Text('No profile loaded.')),
      },
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: FilledButton.tonal(
            onPressed: isLoggingOut
                ? null
                : () async {
                    final token = ref
                        .read(authFlowProvider)
                        .accessToken;

                    await ref
                        .read(logoutProvider.notifier)
                        .logout(token ?? '');

                    if (context.mounted) {
                      Navigator.of(context).pushNamedAndRemoveUntil(
                        AppRoutePaths.signIn,
                        (_) => false,
                      );
                    }
                  },
            child: isLoggingOut
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Sign out'),
          ),
        ),
      ),
    );
  }
}

class _ProfileBody extends StatelessWidget {
  const _ProfileBody({required this.authContext});

  final AuthContextModel authContext;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profile = authContext.profile;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _ProfileAvatar(displayName: profile?.displayName, email: authContext.user.email),
        const SizedBox(height: 24),
        _SectionCard(
          title: 'Account',
          children: [
            _InfoRow(label: 'Email', value: authContext.user.email),
            _InfoRow(label: 'Status', value: authContext.user.status),
            _InfoRow(label: 'Type', value: authContext.user.userType),
          ],
        ),
        if (profile != null) ...[
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Profile',
            children: [
              _InfoRow(label: 'Display Name', value: profile.displayName),
              if (profile.profileType == 'student_profile') ...[
                _InfoRow(label: 'Language', value: profile.preferredLanguage),
                _InfoRow(label: 'Timezone', value: profile.timezone),
              ],
            ],
          ),
        ],
        if (authContext.roles.isNotEmpty) ...[
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Roles',
            subtitle: 'Displayed for reference only. Enforced by backend.',
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: authContext.roles
                    .map(
                      (r) => Chip(
                        label: Text(
                          r.name,
                          style: theme.textTheme.labelSmall,
                        ),
                        visualDensity: VisualDensity.compact,
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({this.displayName, this.email});

  final String? displayName;
  final String? email;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initials = _initials(displayName ?? email);

    return Column(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Text(
            initials,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: theme.colorScheme.onPrimaryContainer,
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (displayName != null)
          Text(displayName!, style: theme.textTheme.titleLarge),
        if (email != null)
          Text(
            email!,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
      ],
    );
  }

  String _initials(String? value) {
    if (value == null || value.isEmpty) return '?';
    final parts = value.trim().split(RegExp(r'[\s@.]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return value[0].toUpperCase();
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.children,
    this.subtitle,
  });

  final String title;
  final String? subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.primary,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(
                subtitle!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String? value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '—',
              style: theme.textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          'Could not load profile: $message',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.error,
              ),
        ),
      ),
    );
  }
}
