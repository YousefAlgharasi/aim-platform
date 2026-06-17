import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/data/models/auth_context_model.dart';
import '../../../auth/logic/provider/auth_context_provider.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';
import '../../../shell/ui/widgets/role_aware_placeholder_section.dart';

class ProfilePlaceholderPage extends ConsumerWidget {
  const ProfilePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);
    final authContextState = ref.watch(authContextProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: 'Profile'),
      body: ListView(
        padding: EdgeInsets.all(AimSpacing.sectionGap),
        children: [
          MainShellPlaceholderCard(
            title: 'Profile',
            description: authState.email == null
                ? 'Profile placeholder. No placeholder learner is signed in.'
                : 'Profile placeholder for ${authState.email}. Real account data will come from the Backend API.',
          ),
          if (authContextState is AppAsyncSuccess<AuthContextModel>) ...[
            SizedBox(height: AimSpacing.formFieldGap),
            RoleAwarePlaceholderSection(
                authContext: authContextState.data),
          ],
          SizedBox(height: AimSpacing.formFieldGap),
          AIMButton(
            onPressed: () {
              ref.read(authFlowProvider.notifier).signOutPlaceholder();
              Navigator.of(context).pushNamedAndRemoveUntil(
                AppRoutePaths.signIn,
                (route) => false,
              );
            },
            variant: AIMButtonVariant.outline,
            fullWidth: true,
            semanticLabel: 'Sign out',
            child: const Text('Sign out placeholder'),
          ),
        ],
      ),
    );
  }
}
