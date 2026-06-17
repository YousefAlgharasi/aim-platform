import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ReviewPlaceholderPage extends StatelessWidget {
  const ReviewPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AIMTopAppBar(title: 'Review'),
      body: const MainShellPlaceholderCard(
        title: 'Review',
        description:
            'Review and retention placeholder. Retention scheduling is backend-owned.',
      ),
    );
  }
}
