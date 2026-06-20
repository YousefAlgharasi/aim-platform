// P10-049: assessments feature barrel export.
//
// Phase 10 assessment feature — student-facing quiz/exam flow.
// Backend is the sole authority for grading, scoring, pass/fail, deadline
// status, attempt eligibility, mastery, and all assessment outputs.
// Flutter displays what the backend returns; it must never compute any of
// those values locally.
//
// See docs/phase-10/assessment-authority-rules.md for the binding rule set.
// See docs/phase-10/mobile-assessment-flow-map.md for the full screen flow.

export 'ui/pages/assessment_pages.dart';
export 'ui/widgets/assessment_widgets.dart';
export 'data/datasources/assessment_datasources.dart';
export 'data/models/assessment_models.dart';
export 'data/repository/assessment_data_repository.dart';
export 'logic/entity/assessment_entities.dart';
export 'logic/provider/assessment_provider.dart';
export 'logic/repository/assessment_repository.dart';
