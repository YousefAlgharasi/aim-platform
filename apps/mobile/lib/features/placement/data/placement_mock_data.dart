import 'dart:math';

import '../data/models/placement_question_model.dart';
import '../data/models/placement_result_model.dart';
import '../data/models/placement_test_model.dart';
import '../logic/entity/placement_skill_mastery.dart';
import '../logic/provider/placement_question_notifier.dart';

/// Centralized mock data for placement test questions, results, and CEFR levels.
final class PlacementMockData {
  const PlacementMockData._();

  static const PlacementTestModel mockTest = PlacementTestModel(
    id: 'dev-placement-test',
    title: 'English Placement Assessment',
    status: 'active',
    totalSections: 4,
    estimatedMinutes: 25,
  );

  /// Comprehensive pool of 22 distinct questions across all skills & formats.
  static const List<PlacementQuestionModel> questionPool = [
    // 1. Conditionals Multiple Choice
    PlacementQuestionModel(
      id: 'q1',
      sectionId: 'sec-1',
      type: 'multiple_choice',
      text: 'GRAMMAR • QUESTION\n\nChoose the correct option to complete the sentence:\n\n"If I ___ time, I would have finished the project on schedule."',
      options: [
        PlacementOptionModel(id: 'A', text: 'have'),
        PlacementOptionModel(id: 'B', text: 'had had'),
        PlacementOptionModel(id: 'C', text: 'had'),
        PlacementOptionModel(id: 'D', text: 'has'),
      ],
    ),

    // 2. Reading Choice with Passage
    PlacementQuestionModel(
      id: 'q2',
      sectionId: 'sec-1',
      type: 'multiple_choice',
      text: 'READING • QUESTION\n\nWhat is identified as the primary catalyst for reducing student attrition rates?\n\nArtificial intelligence is rapidly reshaping personalized learning systems. By analyzing micro-behaviors and mistake patterns in real time, modern algorithms dynamically adapt content difficulty to keep students engaged.',
      options: [
        PlacementOptionModel(id: 'A', text: 'Providing human tutor oversight'),
        PlacementOptionModel(id: 'B', text: 'Altering course trajectories dynamically based on user data'),
        PlacementOptionModel(id: 'C', text: 'Lowering subscription costs for premium learning paths'),
        PlacementOptionModel(id: 'D', text: 'Increasing the frequency of standardized tests'),
      ],
    ),

    // 3. Listening Choice
    PlacementQuestionModel(
      id: 'q3',
      sectionId: 'sec-1',
      type: 'listening_choice',
      text: 'LISTENING • QUESTION\n\nWhat is the speaker\'s main goal?',
      options: [
        PlacementOptionModel(id: 'A', text: 'To request a professional meeting'),
        PlacementOptionModel(id: 'B', text: 'To cancel a previous dinner reservation'),
        PlacementOptionModel(id: 'C', text: 'To inquire about available travel options'),
        PlacementOptionModel(id: 'D', text: 'To provide feedback on a recent service'),
      ],
    ),

    // 4. Speaking Question
    PlacementQuestionModel(
      id: 'q4',
      sectionId: 'sec-1',
      type: 'speaking',
      text: 'SPEAKING • QUESTION\n\nDescribe your typical morning routine in one minute?',
      options: [],
    ),

    // 5. Writing Response
    PlacementQuestionModel(
      id: 'q5',
      sectionId: 'sec-1',
      type: 'writing',
      text: 'WRITING • QUESTION\n\nIntroduce yourself\n\nWrite a short paragraph (3-5 sentences) introducing yourself to a new friend. Include your name, where you are from, and one hobby.',
      options: [],
    ),

    // 6. True / False Comprehension
    PlacementQuestionModel(
      id: 'q6',
      sectionId: 'sec-1',
      type: 'true_false',
      text: 'COMPREHENSION • QUESTION\n\nThe speaker agreed to all proposed project timelines.',
      options: [],
    ),

    // 7. Grammar - Past Perfect
    PlacementQuestionModel(
      id: 'q7',
      sectionId: 'sec-2',
      type: 'multiple_choice',
      text: 'GRAMMAR • QUESTION\n\nSelect the correct form:\n\n"By the time Sarah arrived at the airport, the flight ___ already taken off."',
      options: [
        PlacementOptionModel(id: 'A', text: 'has'),
        PlacementOptionModel(id: 'B', text: 'had'),
        PlacementOptionModel(id: 'C', text: 'was'),
        PlacementOptionModel(id: 'D', text: 'is'),
      ],
    ),

    // 8. Vocabulary - Advanced Synonyms
    PlacementQuestionModel(
      id: 'q8',
      sectionId: 'sec-2',
      type: 'multiple_choice',
      text: 'VOCABULARY • QUESTION\n\nWhich word is closest in meaning to "PRAGMATIC"?',
      options: [
        PlacementOptionModel(id: 'A', text: 'Idealistic'),
        PlacementOptionModel(
            id: 'B', text: 'Practical and sensible'),
        PlacementOptionModel(id: 'C', text: 'Extravagant'),
        PlacementOptionModel(id: 'D', text: 'Theatrical'),
      ],
    ),

    // 9. Reading - Technical Article
    PlacementQuestionModel(
      id: 'q9',
      sectionId: 'sec-2',
      type: 'multiple_choice',
      text: 'READING • QUESTION\n\nAccording to the passage, what is essential for long-term skill retention?\n\nSpaced repetition algorithms schedule review intervals based on forgetting curves. Memory decay slows down significantly when learners are prompted right before forgetting occurs.',
      options: [
        PlacementOptionModel(id: 'A', text: 'Cramming all lessons in one day'),
        PlacementOptionModel(
            id: 'B', text: 'Reviewing items at optimal spaced intervals'),
        PlacementOptionModel(id: 'C', text: 'Reading passive textbooks without testing'),
        PlacementOptionModel(id: 'D', text: 'Memorizing dictionary definitions'),
      ],
    ),

    // 10. Listening - Dialogue Summary
    PlacementQuestionModel(
      id: 'q10',
      sectionId: 'sec-2',
      type: 'listening_choice',
      text: 'LISTENING • QUESTION\n\nWhere does this conversation take place?',
      options: [
        PlacementOptionModel(id: 'A', text: 'At a hotel reception desk'),
        PlacementOptionModel(id: 'B', text: 'Inside a university lecture hall'),
        PlacementOptionModel(id: 'C', text: 'At an international airport terminal'),
        PlacementOptionModel(id: 'D', text: 'Inside a medical clinic'),
      ],
    ),

    // 11. Speaking - Future Aspirations
    PlacementQuestionModel(
      id: 'q11',
      sectionId: 'sec-2',
      type: 'speaking',
      text: 'SPEAKING • QUESTION\n\nWhat is your biggest personal goal for the next 2 years? Explain why.',
      options: [],
    ),

    // 12. Writing - Formal Email Response
    PlacementQuestionModel(
      id: 'q12',
      sectionId: 'sec-2',
      type: 'writing',
      text: 'WRITING • QUESTION\n\nFormal Request\n\nWrite a short email (3-4 sentences) requesting a schedule change for an upcoming meeting due to a conflicting deadline.',
      options: [],
    ),

    // 13. True / False - Academic Ethics
    PlacementQuestionModel(
      id: 'q13',
      sectionId: 'sec-3',
      type: 'true_false',
      text: 'COMPREHENSION • QUESTION\n\nSpaced repetition is ineffective for language learning.',
      options: [],
    ),

    // 14. Grammar - Modal Verbs
    PlacementQuestionModel(
      id: 'q14',
      sectionId: 'sec-3',
      type: 'multiple_choice',
      text: 'GRAMMAR • QUESTION\n\n"You ___ not bring outside food into the examination room under any circumstances."',
      options: [
        PlacementOptionModel(id: 'A', text: 'must'),
        PlacementOptionModel(id: 'B', text: 'might'),
        PlacementOptionModel(id: 'C', text: 'could'),
        PlacementOptionModel(id: 'D', text: 'would'),
      ],
    ),

    // 15. Vocabulary - Contextual Idioms
    PlacementQuestionModel(
      id: 'q15',
      sectionId: 'sec-3',
      type: 'multiple_choice',
      text: 'VOCABULARY • QUESTION\n\nWhat does "HIT THE NAIL ON THE HEAD" mean?',
      options: [
        PlacementOptionModel(id: 'A', text: 'To cause accidental damage'),
        PlacementOptionModel(id: 'B', text: 'To be exactly correct'),
        PlacementOptionModel(id: 'C', text: 'To start a construction project'),
        PlacementOptionModel(id: 'D', text: 'To feel tired and give up'),
      ],
    ),

    // 16. Reading - Science Summary
    PlacementQuestionModel(
      id: 'q16',
      sectionId: 'sec-3',
      type: 'multiple_choice',
      text: 'READING • QUESTION\n\nWhat is the primary conclusion regarding neuroplasticity?\n\nNeuroplasticity demonstrates that the human brain continues to rewire itself well into adulthood. Active learning stimulates new neural pathways regardless of age.',
      options: [
        PlacementOptionModel(id: 'A', text: 'Brain growth stops at age 18'),
        PlacementOptionModel(id: 'B', text: 'Adults can build new neural connections through active learning'),
        PlacementOptionModel(id: 'C', text: 'Memory cannot be improved'),
        PlacementOptionModel(id: 'D', text: 'Learning is impossible after childhood'),
      ],
    ),

    // 17. Listening - Customer Support
    PlacementQuestionModel(
      id: 'q17',
      sectionId: 'sec-3',
      type: 'listening_choice',
      text: 'LISTENING • QUESTION\n\nWhat resolution did the customer service agent offer?',
      options: [
        PlacementOptionModel(id: 'A', text: 'A full refund and store credit'),
        PlacementOptionModel(id: 'B', text: 'An immediate replacement item shipped priority'),
        PlacementOptionModel(id: 'C', text: 'A voucher for future purchases'),
        PlacementOptionModel(id: 'D', text: 'A technical repair appointment'),
      ],
    ),

    // 18. Speaking - Problem Solving
    PlacementQuestionModel(
      id: 'q18',
      sectionId: 'sec-3',
      type: 'speaking',
      text: 'SPEAKING • QUESTION\n\nDescribe a difficult challenge you faced recently and how you resolved it.',
      options: [],
    ),

    // 19. Writing - Opinion Statement
    PlacementQuestionModel(
      id: 'q19',
      sectionId: 'sec-3',
      type: 'writing',
      text: 'WRITING • QUESTION\n\nTechnology in Education\n\nState your opinion in 3-4 sentences on whether artificial intelligence helps or hinders student creativity.',
      options: [],
    ),

    // 20. True / False - Scientific Fact
    PlacementQuestionModel(
      id: 'q20',
      sectionId: 'sec-4',
      type: 'true_false',
      text: 'COMPREHENSION • QUESTION\n\nActive learning stimulates new neural pathways across all age groups.',
      options: [],
    ),

    // 21. Grammar - Relative Clauses
    PlacementQuestionModel(
      id: 'q21',
      sectionId: 'sec-4',
      type: 'multiple_choice',
      text: 'GRAMMAR • QUESTION\n\n"The professor ___ research won the Nobel prize gave a keynote lecture yesterday."',
      options: [
        PlacementOptionModel(id: 'A', text: 'whose'),
        PlacementOptionModel(id: 'B', text: 'whom'),
        PlacementOptionModel(id: 'C', text: 'which'),
        PlacementOptionModel(id: 'D', text: 'that'),
      ],
    ),

    // 22. True / False - Language Retention
    PlacementQuestionModel(
      id: 'q22',
      sectionId: 'sec-4',
      type: 'true_false',
      text: 'COMPREHENSION • QUESTION\n\nConsistent micro-practice yields better retention than infrequent long study sessions.',
      options: [],
    ),
  ];

  /// Generates a randomized list of [count] questions for a unique student attempt.
  static List<PlacementQuestionModel> getRandomizedMockQuestions({int count = 20}) {
    final list = List<PlacementQuestionModel>.from(questionPool);
    list.shuffle(Random());
    final selected = list.take(count).toList();

    // Re-index titles so question headers show clean 1/20, 2/20, etc.
    return List.generate(selected.length, (index) {
      final q = selected[index];
      final parts = q.text.split('\n\n');
      final category = parts[0].split(' • ')[0];
      final header = '$category • QUESTION ${index + 1}/$count';
      final updatedText = '$header\n\n${parts.sublist(1).join('\n\n')}';

      return PlacementQuestionModel(
        id: 'q_${index + 1}',
        sectionId: q.sectionId,
        type: q.type,
        text: updatedText,
        options: q.options,
      );
    });
  }

  /// Default randomized initial ready state with 20 questions.
  static PlacementQuestionReady get defaultMockQuestionReadyState {
    final questions = getRandomizedMockQuestions(count: 20);
    return PlacementQuestionReady(
      attemptId: 'mock-attempt-${DateTime.now().millisecondsSinceEpoch}',
      questions: questions,
      currentIndex: 0,
      selectedAnswer: null,
      isSubmitting: false,
    );
  }

  static const PlacementResultModel mockResult = PlacementResultModel(
    id: 'mock-result-1',
    placementAttemptId: 'mock-attempt-1',
    estimatedLevel: 'intermediate',
    skillMasteryMap: {
      'grammar': PlacementSkillMastery(
        skillCode: 'grammar',
        correctAnswers: 16,
        totalQuestions: 20,
        masteryScore: 0.8,
        signal: 'strong',
      ),
      'listening': PlacementSkillMastery(
        skillCode: 'listening',
        correctAnswers: 15,
        totalQuestions: 18,
        masteryScore: 0.83,
        signal: 'developing',
      ),
      'reading': PlacementSkillMastery(
        skillCode: 'reading',
        correctAnswers: 17,
        totalQuestions: 20,
        masteryScore: 0.85,
        signal: 'strong',
      ),
    },
    weaknesses: [
      PlacementWeakness(
        skillCode: 'grammar',
        masteryScore: 0.6,
        priority: 1,
        signal: 'developing',
      ),
    ],
    initialPathId: 'path-b1',
    createdAt: '2026-07-26',
    recommendedCourseId: 'course-b1',
    unlockedCourseIds: ['course-a1', 'course-b1'],
  );

  static const Map<String, String> cefrCodes = {
    'beginner': 'A1',
    'elementary': 'A2',
    'intermediate': 'B1',
    'upper_intermediate': 'B2',
    'advanced': 'C1',
  };

  static const Map<String, String> cefrDisplayNames = {
    'beginner': 'Beginner',
    'elementary': 'Elementary',
    'intermediate': 'Intermediate',
    'upper_intermediate': 'Upper Intermediate',
    'advanced': 'Advanced',
  };
}
