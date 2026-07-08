import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../../data/models/support_models.dart';
import '../repository/support_repository.dart';

class SubmitFeedbackNotifier extends AppStateNotifier<UserFeedback> {
  SubmitFeedbackNotifier({required SupportRepository repository})
      : _repository = repository;

  final SupportRepository _repository;

  Future<void> submit({
    required String category,
    int? rating,
    required String title,
    required String body,
  }) async {
    setLoading();
    try {
      final feedback = await _repository.submitFeedback(
        category: category,
        rating: rating,
        title: title,
        body: body,
      );
      setSuccess(feedback);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to submit feedback',
        code: 'FEEDBACK_SUBMIT_FAILED',
      );
    }
  }
}
