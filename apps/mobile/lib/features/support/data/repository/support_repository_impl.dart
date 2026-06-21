import '../datasources/support_datasource.dart';
import '../models/support_models.dart';
import '../../logic/repository/support_repository.dart';

class SupportRepositoryImpl implements SupportRepository {
  final SupportDatasource _datasource;

  const SupportRepositoryImpl(this._datasource);

  @override
  Future<List<SupportTicket>> getTickets() => _datasource.getTickets();

  @override
  Future<SupportTicket> getTicket(String ticketId) =>
      _datasource.getTicket(ticketId);

  @override
  Future<SupportTicket> createTicket({
    required String category,
    required String severity,
    required String subject,
    required String description,
  }) =>
      _datasource.createTicket(
        category: category,
        severity: severity,
        subject: subject,
        description: description,
      );

  @override
  Future<List<TicketComment>> getTicketComments(String ticketId) =>
      _datasource.getTicketComments(ticketId);

  @override
  Future<TicketComment> addTicketComment({
    required String ticketId,
    required String body,
  }) =>
      _datasource.addTicketComment(ticketId: ticketId, body: body);

  @override
  Future<UserFeedback> submitFeedback({
    required String category,
    int? rating,
    required String title,
    required String body,
  }) =>
      _datasource.submitFeedback(
        category: category,
        rating: rating,
        title: title,
        body: body,
      );

  @override
  Future<List<ReleaseNote>> getReleaseNotes() =>
      _datasource.getReleaseNotes();

  @override
  Future<ReleaseNote> getReleaseNote(String noteId) =>
      _datasource.getReleaseNote(noteId);

  @override
  Future<List<OperationalStatus>> getOperationalStatus() =>
      _datasource.getOperationalStatus();
}
