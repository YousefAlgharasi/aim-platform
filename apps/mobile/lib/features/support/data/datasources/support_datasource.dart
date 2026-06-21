import '../models/support_models.dart';

abstract class SupportDatasource {
  // Support tickets — GET /support/tickets
  Future<List<SupportTicket>> getTickets();

  // Ticket detail — GET /support/tickets/:id
  Future<SupportTicket> getTicket(String ticketId);

  // Create ticket — POST /support/tickets
  Future<SupportTicket> createTicket({
    required String category,
    required String severity,
    required String subject,
    required String description,
  });

  // Ticket comments — GET /support/tickets/:id/comments
  Future<List<TicketComment>> getTicketComments(String ticketId);

  // Add comment — POST /support/tickets/:id/comments
  Future<TicketComment> addTicketComment({
    required String ticketId,
    required String body,
  });

  // Submit feedback — POST /feedback
  Future<UserFeedback> submitFeedback({
    required String category,
    int? rating,
    required String title,
    required String body,
  });

  // Release notes — GET /release-notes
  Future<List<ReleaseNote>> getReleaseNotes();

  // Release note detail — GET /release-notes/:id
  Future<ReleaseNote> getReleaseNote(String noteId);

  // Operational status — GET /status
  Future<List<OperationalStatus>> getOperationalStatus();
}
