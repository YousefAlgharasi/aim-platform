// Support feature Riverpod providers.
//
// Registers the concrete SupportDatasource/SupportRepository and one
// notifier per screen. Uses authenticatedBackendApiClientProvider so the
// bearer token is injected automatically; never stored here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';

import '../../data/datasources/support_datasource.dart';
import '../../data/datasources/support_remote_datasource_impl.dart';
import '../../data/models/support_models.dart';
import '../../data/repository/support_repository_impl.dart';
import '../repository/support_repository.dart';
import 'create_ticket_notifier.dart';
import 'operational_status_notifier.dart';
import 'submit_feedback_notifier.dart';
import 'ticket_detail_notifier.dart';
import 'ticket_list_notifier.dart';

final supportDatasourceProvider = Provider<SupportDatasource>((ref) {
  return SupportRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final supportRepositoryProvider = Provider<SupportRepository>((ref) {
  return SupportRepositoryImpl(ref.watch(supportDatasourceProvider));
});

final ticketListProvider =
    StateNotifierProvider.autoDispose<TicketListNotifier, AppAsyncState<List<SupportTicket>>>(
  (ref) => TicketListNotifier(repository: ref.watch(supportRepositoryProvider)),
);

final ticketDetailProvider =
    StateNotifierProvider.autoDispose<TicketDetailNotifier, AppAsyncState<SupportTicket>>(
  (ref) => TicketDetailNotifier(repository: ref.watch(supportRepositoryProvider)),
);

final createTicketProvider =
    StateNotifierProvider.autoDispose<CreateTicketNotifier, AppAsyncState<SupportTicket>>(
  (ref) => CreateTicketNotifier(repository: ref.watch(supportRepositoryProvider)),
);

final submitFeedbackProvider =
    StateNotifierProvider.autoDispose<SubmitFeedbackNotifier, AppAsyncState<UserFeedback>>(
  (ref) => SubmitFeedbackNotifier(repository: ref.watch(supportRepositoryProvider)),
);

final operationalStatusProvider = StateNotifierProvider.autoDispose<
    OperationalStatusNotifier, AppAsyncState<List<OperationalStatus>>>(
  (ref) => OperationalStatusNotifier(repository: ref.watch(supportRepositoryProvider)),
);
