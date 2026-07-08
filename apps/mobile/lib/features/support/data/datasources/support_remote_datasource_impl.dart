// SupportRemoteDatasourceImpl — concrete implementation of SupportDatasource.
//
// Bearer token is injected automatically by authenticatedBackendApiClientProvider
// (see support_provider.dart), so no token is threaded through these methods.
//
// Note: the real backend (services/backend-api/src/features/operations) has
// no endpoint to list a ticket's existing comments — only
// POST /support-tickets/:id/comments to add one. getTicketComments() is kept
// honest about that rather than fabricating a listing endpoint.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import '../models/support_models.dart';
import 'support_datasource.dart';

class SupportRemoteDatasourceImpl implements SupportDatasource {
  const SupportRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<SupportTicket>> getTickets() async {
    final envelope = await _apiClient.get<List<SupportTicket>>(
      BackendApiPaths.supportTickets,
      decodeData: (json) => (json as List<dynamic>)
          .map((e) => SupportTicket.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<SupportTicket> getTicket(String ticketId) async {
    final envelope = await _apiClient.get<SupportTicket>(
      BackendApiPaths.supportTicket(ticketId),
      decodeData: (json) =>
          SupportTicket.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<SupportTicket> createTicket({
    required String category,
    required String severity,
    required String subject,
    required String description,
  }) async {
    final envelope = await _apiClient.post<SupportTicket>(
      BackendApiPaths.supportTickets,
      body: {
        'category': category,
        'severity': severity,
        'subject': subject,
        'description': description,
      },
      decodeData: (json) =>
          SupportTicket.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<TicketComment>> getTicketComments(String ticketId) async {
    // No GET .../comments endpoint exists on the backend today.
    return const [];
  }

  @override
  Future<TicketComment> addTicketComment({
    required String ticketId,
    required String body,
  }) async {
    final envelope = await _apiClient.post<TicketComment>(
      BackendApiPaths.supportTicketComments(ticketId),
      body: {'body': body},
      decodeData: (json) =>
          TicketComment.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<UserFeedback> submitFeedback({
    required String category,
    int? rating,
    required String title,
    required String body,
  }) async {
    final envelope = await _apiClient.post<UserFeedback>(
      BackendApiPaths.feedback,
      body: {
        'category': category,
        if (rating != null) 'rating': rating,
        'title': title,
        'body': body,
      },
      decodeData: (json) =>
          UserFeedback.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<ReleaseNote>> getReleaseNotes() async {
    final envelope = await _apiClient.get<List<ReleaseNote>>(
      BackendApiPaths.releaseNotes,
      decodeData: (json) => (json as List<dynamic>)
          .map((e) => ReleaseNote.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<ReleaseNote> getReleaseNote(String noteId) async {
    final envelope = await _apiClient.get<ReleaseNote>(
      BackendApiPaths.releaseNote(noteId),
      decodeData: (json) =>
          ReleaseNote.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<OperationalStatus>> getOperationalStatus() async {
    final envelope = await _apiClient.get<List<OperationalStatus>>(
      BackendApiPaths.operationalStatus,
      decodeData: (json) => (json as List<dynamic>)
          .map((e) => OperationalStatus.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }
}
