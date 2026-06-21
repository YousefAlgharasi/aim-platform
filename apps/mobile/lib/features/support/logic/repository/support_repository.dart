import '../../data/models/support_models.dart';

abstract class SupportRepository {
  Future<List<SupportTicket>> getTickets();
  Future<SupportTicket> getTicket(String ticketId);
  Future<SupportTicket> createTicket({
    required String category,
    required String severity,
    required String subject,
    required String description,
  });
  Future<List<TicketComment>> getTicketComments(String ticketId);
  Future<TicketComment> addTicketComment({
    required String ticketId,
    required String body,
  });
  Future<UserFeedback> submitFeedback({
    required String category,
    int? rating,
    required String title,
    required String body,
  });
  Future<List<ReleaseNote>> getReleaseNotes();
  Future<ReleaseNote> getReleaseNote(String noteId);
  Future<List<OperationalStatus>> getOperationalStatus();
}
