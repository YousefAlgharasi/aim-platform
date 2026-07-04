import { useMemo, useState } from 'react';

const skills = [
  'Vocabulary',
  'Grammar',
  'Reading Comprehension',
  'Listening Comprehension',
  'Sentence Structure',
  'Verb Tenses',
  'Pronunciation',
  'Writing Skills',
];

const tabs = [
  'إعداد الطالب',
  'اختبار الطالب',
  'محاكاة سريعة',
  'نتائج الخوارزمية',
  'منحنى المراجعة',
];

const skillLabels = {
  Vocabulary: 'المفردات',
  Grammar: 'القواعد',
  'Reading Comprehension': 'فهم القراءة',
  'Listening Comprehension': 'فهم الاستماع',
  'Sentence Structure': 'بناء الجملة',
  'Verb Tenses': 'أزمنة الأفعال',
  Pronunciation: 'النطق',
  'Writing Skills': 'مهارات الكتابة',
};

const decisionLabels = {
  INCREASE: 'رفع الصعوبة تدريجيا',
  DECREASE: 'تخفيف الصعوبة',
  MAINTAIN: 'الثبات على المستوى الحالي',
  TYPE_1_RANDOM: 'أخطاء متفرقة',
  TYPE_2_CONSISTENT: 'نمط خطأ متكرر',
  TYPE_3_PRESSURE: 'إجابات تحتاج هدوءا أكثر',
  TYPE_4_WARMUP: 'تحسن بعد بداية بطيئة',
  CONFIDENCE_BUILDER: 'نشاط يعزز الثقة',
  RETEACH_CONCEPT: 'شرح موجه للمفهوم',
  REVIEW: 'مراجعة قصيرة',
  TIMED_PRACTICE: 'تدريب طلاقة',
  CHALLENGE: 'تحد أعلى تدريجي',
  EASY_WIN: 'بداية سهلة داعمة',
};

function displaySkill(skill) {
  return skillLabels[skill] || skill;
}

function displayDecision(value) {
  return decisionLabels[value] || value;
}

const questionBank = {
  Vocabulary: [
    {
      prompt: 'Choose the closest meaning of "rapid".',
      options: ['Slow', 'Fast', 'Quiet', 'Careful'],
      answer: 'Fast',
      hint: 'Think about something that happens in a short time.',
      difficulty: 2,
    },
    {
      prompt: 'Which word is the opposite of "ancient"?',
      options: ['Old', 'Modern', 'Broken', 'Simple'],
      answer: 'Modern',
      hint: 'Ancient means very old.',
      difficulty: 2,
    },
    {
      prompt: 'Choose the best word: She gave a ___ explanation of the rule.',
      options: ['clear', 'clearly', 'clearness', 'cleared'],
      answer: 'clear',
      hint: 'The blank describes the noun "explanation".',
      difficulty: 3,
    },
    {
      prompt: 'What does "improve" mean?',
      options: ['Make better', 'Make smaller', 'Forget', 'Repeat exactly'],
      answer: 'Make better',
      hint: 'Students improve when their skill gets stronger.',
      difficulty: 2,
    },
    {
      prompt: 'Which sentence uses "however" correctly?',
      options: [
        'I was tired. However, I finished my homework.',
        'However I was tired I finished.',
        'I however was tired finished homework.',
        'I was however tired because.',
      ],
      answer: 'I was tired. However, I finished my homework.',
      hint: 'However often connects two contrasting ideas.',
      difficulty: 3,
    },
  ],
  Grammar: [
    {
      prompt: 'Choose the correct sentence.',
      options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'],
      answer: 'She goes to school.',
      hint: 'With he/she/it in present simple, add -s to the verb.',
      difficulty: 2,
    },
    {
      prompt: 'Fill in the blank: They ___ watching a movie now.',
      options: ['is', 'are', 'am', 'be'],
      answer: 'are',
      hint: 'Use "are" with they.',
      difficulty: 1,
    },
    {
      prompt: 'Choose the correct article: I saw ___ elephant at the zoo.',
      options: ['a', 'an', 'the only', 'no article'],
      answer: 'an',
      hint: 'Use "an" before a vowel sound.',
      difficulty: 2,
    },
    {
      prompt: 'Which sentence is in the past simple?',
      options: ['I walk home.', 'I am walking home.', 'I walked home.', 'I will walk home.'],
      answer: 'I walked home.',
      hint: 'Past simple often uses -ed for regular verbs.',
      difficulty: 3,
    },
    {
      prompt: 'Choose the correct pronoun: Ahmed and I finished ___ project.',
      options: ['our', 'us', 'we', 'ours'],
      answer: 'our',
      hint: 'The blank comes before a noun, so use a possessive adjective.',
      difficulty: 2,
    },
  ],
  'Reading Comprehension': [
    {
      prompt: 'Read: "Lina missed the bus, so she walked to school." Why did Lina walk?',
      options: ['She wanted exercise', 'She missed the bus', 'School was closed', 'She lost her bag'],
      answer: 'She missed the bus',
      hint: 'Look for the reason before "so".',
      difficulty: 2,
    },
    {
      prompt: 'Read: "The room was silent except for the clock." What can you infer?',
      options: ['The room was noisy', 'The clock was not working', 'It was very quiet', 'Many people were talking'],
      answer: 'It was very quiet',
      hint: 'Silent means almost no sound.',
      difficulty: 2,
    },
    {
      prompt: 'Read: "Omar studied every night and passed the exam." What happened first?',
      options: ['He passed', 'He studied', 'He taught the class', 'He missed the exam'],
      answer: 'He studied',
      hint: 'Follow the order of actions in the sentence.',
      difficulty: 2,
    },
    {
      prompt: 'Read: "Although it was raining, Sara went outside." What does "although" show?',
      options: ['Cause', 'Contrast', 'Time', 'Place'],
      answer: 'Contrast',
      hint: 'Although often shows an unexpected contrast.',
      difficulty: 3,
    },
    {
      prompt: 'Read: "The teacher repeated the instructions because some students looked confused." Why did she repeat them?',
      options: ['The students looked confused', 'The class ended', 'The lesson was easy', 'The students were absent'],
      answer: 'The students looked confused',
      hint: 'The word "because" gives the reason.',
      difficulty: 3,
    },
  ],
  'Listening Comprehension': [
    {
      prompt: 'You hear: "Please open your books to page fifteen." What should you do?',
      options: ['Close the book', 'Open page 15', 'Write your name', 'Leave the room'],
      answer: 'Open page 15',
      hint: 'Listen for the action and the page number.',
      difficulty: 2,
    },
    {
      prompt: 'You hear: "The meeting starts at quarter past nine." What time is it?',
      options: ['9:00', '9:15', '9:30', '9:45'],
      answer: '9:15',
      hint: 'Quarter past means 15 minutes after.',
      difficulty: 3,
    },
    {
      prompt: 'You hear: "I would like a glass of water, please." What does the speaker want?',
      options: ['Tea', 'Water', 'Coffee', 'Juice'],
      answer: 'Water',
      hint: 'Focus on the noun after "a glass of".',
      difficulty: 1,
    },
    {
      prompt: 'You hear: "Do not forget your umbrella." What is the advice?',
      options: ['Bring an umbrella', 'Buy a coat', 'Open a window', 'Call a friend'],
      answer: 'Bring an umbrella',
      hint: 'Do not forget means remember to take it.',
      difficulty: 2,
    },
    {
      prompt: 'You hear: "The train is delayed by ten minutes." What happened?',
      options: ['The train is early', 'The train is late', 'The train is cancelled', 'The train arrived yesterday'],
      answer: 'The train is late',
      hint: 'Delayed means late.',
      difficulty: 2,
    },
  ],
  'Sentence Structure': [
    {
      prompt: 'Choose the best word order.',
      options: ['Always she is kind.', 'She is always kind.', 'Kind always she is.', 'Is always she kind.'],
      answer: 'She is always kind.',
      hint: 'Adverbs like always usually come after the verb be.',
      difficulty: 3,
    },
    {
      prompt: 'Which sentence is complete?',
      options: ['Because I was tired.', 'Running quickly.', 'The student answered the question.', 'After the lesson.'],
      answer: 'The student answered the question.',
      hint: 'A complete sentence needs a subject and a complete verb idea.',
      difficulty: 2,
    },
    {
      prompt: 'Combine the ideas: "I was hungry. I made lunch."',
      options: ['I was hungry, so I made lunch.', 'I was hungry made lunch.', 'So I was hungry lunch.', 'I made hungry lunch.'],
      answer: 'I was hungry, so I made lunch.',
      hint: 'Use "so" to show result.',
      difficulty: 2,
    },
    {
      prompt: 'Choose the correct question.',
      options: ['Where you live?', 'Where do you live?', 'Where live you do?', 'Where does you live?'],
      answer: 'Where do you live?',
      hint: 'Use do with you in present simple questions.',
      difficulty: 3,
    },
    {
      prompt: 'Choose the best sentence.',
      options: ['The book interesting is.', 'Interesting the book is.', 'The book is interesting.', 'Is book the interesting.'],
      answer: 'The book is interesting.',
      hint: 'Use subject + be + adjective.',
      difficulty: 2,
    },
  ],
  'Verb Tenses': [
    {
      prompt: 'Fill in the blank: Yesterday, I ___ to the market.',
      options: ['go', 'goes', 'went', 'going'],
      answer: 'went',
      hint: 'Yesterday needs a past tense verb.',
      difficulty: 2,
    },
    {
      prompt: 'Fill in the blank: She ___ English every day.',
      options: ['study', 'studies', 'studied', 'studying'],
      answer: 'studies',
      hint: 'Use present simple with she.',
      difficulty: 2,
    },
    {
      prompt: 'Choose the future sentence.',
      options: ['I visited my uncle.', 'I am visiting now.', 'I will visit my uncle.', 'I visit my uncle every week.'],
      answer: 'I will visit my uncle.',
      hint: 'Will often marks future meaning.',
      difficulty: 2,
    },
    {
      prompt: 'Fill in the blank: They ___ dinner when I called.',
      options: ['were eating', 'eats', 'has eaten', 'eat'],
      answer: 'were eating',
      hint: 'Use past continuous for an action happening at a past moment.',
      difficulty: 4,
    },
    {
      prompt: 'Choose the present perfect sentence.',
      options: ['I have finished my homework.', 'I finished yesterday.', 'I finish now.', 'I will finish soon.'],
      answer: 'I have finished my homework.',
      hint: 'Present perfect uses have or has plus past participle.',
      difficulty: 4,
    },
  ],
  Pronunciation: [
    {
      prompt: 'Which word has a different vowel sound?',
      options: ['seat', 'meat', 'sit', 'team'],
      answer: 'sit',
      hint: 'Three words have the long /ee/ sound.',
      difficulty: 3,
    },
    {
      prompt: 'Which word ends with the /t/ sound?',
      options: ['played', 'washed', 'opened', 'called'],
      answer: 'washed',
      hint: 'After sounds like sh, -ed is pronounced /t/.',
      difficulty: 4,
    },
    {
      prompt: 'How many syllables are in "beautiful"?',
      options: ['1', '2', '3', '4'],
      answer: '3',
      hint: 'Say it slowly: beau-ti-ful.',
      difficulty: 2,
    },
    {
      prompt: 'Which word has stress on the first syllable?',
      options: ['TAble', 'aBOUT', 'beGIN', 'reLAX'],
      answer: 'TAble',
      hint: 'Say the words aloud and notice the strongest part.',
      difficulty: 3,
    },
    {
      prompt: 'Which pair rhymes?',
      options: ['make / take', 'food / good', 'come / home', 'said / seed'],
      answer: 'make / take',
      hint: 'Rhyming words end with the same sound.',
      difficulty: 2,
    },
  ],
  'Writing Skills': [
    {
      prompt: 'Which is the best topic sentence?',
      options: [
        'My favorite hobby is reading because it helps me learn.',
        'And then very good.',
        'Reading books.',
        'Because I like.',
      ],
      answer: 'My favorite hobby is reading because it helps me learn.',
      hint: 'A topic sentence should be complete and clear.',
      difficulty: 3,
    },
    {
      prompt: 'Choose the best connector: I studied hard, ___ I passed the test.',
      options: ['but', 'so', 'although', 'before'],
      answer: 'so',
      hint: 'The second idea is a result.',
      difficulty: 2,
    },
    {
      prompt: 'Which sentence needs a capital letter?',
      options: ['I live in Sana’a.', 'my teacher is kind.', 'This is my book.', 'English is useful.'],
      answer: 'my teacher is kind.',
      hint: 'The first word in a sentence starts with a capital letter.',
      difficulty: 1,
    },
    {
      prompt: 'Which sentence has correct punctuation?',
      options: ['Where are you going?', 'Where are you going.', 'Where are you going!', 'Where, are you going'],
      answer: 'Where are you going?',
      hint: 'A question usually ends with a question mark.',
      difficulty: 2,
    },
    {
      prompt: 'Choose the clearest sentence.',
      options: [
        'The lesson was difficult, but I understood it after practice.',
        'Difficult lesson practice understood.',
        'Lesson difficult but practice it.',
        'I understood difficult after.',
      ],
      answer: 'The lesson was difficult, but I understood it after practice.',
      hint: 'The clearest sentence has complete grammar and logical order.',
      difficulty: 3,
    },
  ],
};

const fallbackQuestions = [
  {
    prompt: 'Choose the correct sentence.',
    options: ['He are happy.', 'He is happy.', 'He am happy.', 'He be happy.'],
    answer: 'He is happy.',
    hint: 'Use "is" with he.',
    difficulty: 2,
  },
  {
    prompt: 'What is the opposite of "easy"?',
    options: ['Simple', 'Hard', 'Fast', 'Soft'],
    answer: 'Hard',
    hint: 'Think about a difficult test.',
    difficulty: 2,
  },
  {
    prompt: 'Fill in the blank: I ___ English every day.',
    options: ['study', 'studies', 'studied', 'studying'],
    answer: 'study',
    hint: 'Use the base verb with I in present simple.',
    difficulty: 2,
  },
  {
    prompt: 'Which word is a noun?',
    options: ['quickly', 'beautiful', 'teacher', 'run'],
    answer: 'teacher',
    hint: 'A noun can name a person.',
    difficulty: 3,
  },
  {
    prompt: 'Choose the correct question.',
    options: ['You like English?', 'Do you like English?', 'Does you like English?', 'Like you English do?'],
    answer: 'Do you like English?',
    hint: 'Use do before you in present simple questions.',
    difficulty: 2,
  },
];

const initialStudent = {
  skill: skills[0],
  mastery: 62,
  confidence: 58,
  retention: 72,
  avgSpeed: 64,
  attempts: 6,
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value, digits = 0) => Number(value.toFixed(digits));

function getCompetenceState(mastery, confidence) {
  if (mastery >= 70 && confidence >= 70) return 'توازن جيد';
  if (mastery >= 70 && confidence < 70) return 'يحتاج تعزيز الثقة';
  if (mastery < 70 && confidence < 70) return 'يحتاج تدريبا داعما';
  return 'يحتاج ضبط الثقة مع الأداء';
}

function getMetrics(log) {
  const chronologicalLog = [...log].reverse();
  const total = log.length;
  const correct = log.filter((item) => item.type === 'correct').length;
  const wrong = log.filter((item) => item.type === 'wrong').length;
  const retries = log.filter((item) => item.type === 'wrong' || item.type === 'hint').length;
  const skips = log.filter((item) => item.type === 'skip').length;
  const slow = log.filter((item) => item.seconds > 8).length;
  const hints = log.filter((item) => item.type === 'hint').length;
  const wrongStreak = log.findIndex((item) => item.type === 'correct');
  const currentWrongStreak = wrongStreak === -1 ? total : wrongStreak;
  const earlySkips = chronologicalLog.slice(0, 4).filter((item) => item.type === 'skip').length;

  return {
    total,
    correct,
    wrong,
    retries,
    skips,
    hints,
    slow,
    accuracy: total ? (correct / total) * 100 : 0,
    retryRate: total ? retries / total : 0,
    hesitationIndex: total ? slow / total : 0,
    currentWrongStreak,
    earlySkips,
  };
}

function getAlgorithmOutput(student, log) {
  const metrics = getMetrics(log);
  const consistency = clamp(100 - metrics.retryRate * 45 - metrics.currentWrongStreak * 9 - metrics.hesitationIndex * 20);
  const speed = clamp(student.avgSpeed - metrics.hesitationIndex * 20 + metrics.correct * 1.5);
  const difficultyPerf = clamp(metrics.accuracy * 0.75 + consistency * 0.25);
  const masteryScore = clamp(
    metrics.accuracy * 0.35 +
      speed * 0.15 +
      consistency * 0.2 +
      student.retention * 0.15 +
      difficultyPerf * 0.15,
  );
  const difficultyScore = clamp(masteryScore * 0.5 + student.confidence * 0.2 + consistency * 0.3);
  const difficultyDecision =
    difficultyScore >= 76 ? 'INCREASE' : difficultyScore <= 48 ? 'DECREASE' : 'MAINTAIN';
  const weaknessScore = metrics.total ? (metrics.wrong / metrics.total) * 3 : 0;
  const frustrationScore = clamp(metrics.currentWrongStreak * 18 + metrics.earlySkips * 16 + metrics.hints * 7);
  const errorPatternType = classifyErrorPattern(log, metrics);
  const recommendation = getRecommendation({
    masteryScore,
    difficultyDecision,
    weaknessScore,
    frustrationScore,
    errorPatternType,
    metrics,
    student,
  });

  return {
    metrics,
    speed,
    consistency,
    difficultyPerf,
    masteryScore,
    difficultyScore,
    difficultyDecision,
    weaknessScore,
    frustrationScore,
    errorPatternType,
    recommendation,
  };
}

function classifyErrorPattern(log, metrics) {
  const chronologicalLog = [...log].reverse();
  if (metrics.total < 4) return 'TYPE_1_RANDOM';

  const firstTwoWrong = chronologicalLog.slice(0, 2).every((item) => item.type === 'wrong' || item.type === 'skip');
  const laterCorrect = chronologicalLog.slice(2).filter((item) => item.type === 'correct').length;
  if (firstTwoWrong && laterCorrect >= 2) return 'TYPE_4_WARMUP';

  const pressureErrors = log.filter(
    (item) => item.seconds > 8 && (item.type === 'wrong' || item.type === 'skip'),
  ).length;
  if (pressureErrors / metrics.total >= 0.35) return 'TYPE_3_PRESSURE';

  if (metrics.currentWrongStreak >= 3 || metrics.wrong / metrics.total >= 0.45) {
    return 'TYPE_2_CONSISTENT';
  }

  return 'TYPE_1_RANDOM';
}

function getRecommendation(input) {
  const { masteryScore, difficultyDecision, weaknessScore, frustrationScore, errorPatternType, metrics, student } = input;

  if (frustrationScore >= 65) {
    return {
      label: 'CONFIDENCE_BUILDER',
      reason: 'الطالب يحتاج إلى تبسيط أو إبطاء، لذلك يفضل البدء بخطوة سهلة وداعمة.',
    };
  }

  if (weaknessScore >= 1.25 || errorPatternType === 'TYPE_2_CONSISTENT') {
    return {
      label: 'RETEACH_CONCEPT',
      reason: 'توجد مهارة تحتاج تدريبا مخصصا قبل الانتقال إلى صعوبة أعلى.',
    };
  }

  if (student.retention < 70) {
    return {
      label: 'REVIEW',
      reason: 'حان وقت المراجعة لتعزيز الاحتفاظ بالمعلومة.',
    };
  }

  if (metrics.hesitationIndex >= 0.4 || errorPatternType === 'TYPE_3_PRESSURE') {
    return {
      label: 'TIMED_PRACTICE',
      reason: 'يوجد تردد متكرر، لذلك يفضل تدريب طلاقة قصير بدون ضغط.',
    };
  }

  if (masteryScore >= 78 && difficultyDecision === 'INCREASE') {
    return {
      label: 'CHALLENGE',
      reason: 'نسبة الإتقان والثبات يسمحان بتحد أعلى بشكل تدريجي.',
    };
  }

  if (student.confidence < 55 || masteryScore < 45) {
    return {
      label: 'EASY_WIN',
      reason: 'الطالب يحتاج بداية سهلة تعزز الثقة قبل المتابعة.',
    };
  }

  return {
    label: 'REVIEW',
    reason: 'الأداء مستقر، لذلك يفضل تعزيز المهارة الحالية بتدريب قصير.',
  };
}

function Slider({ label, value, min = 0, max = 100, step = 1, suffix = '', onChange }) {
  return (
    <label className="aim-slider">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        min={min}
        max={max}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Meter({ label, value, tone = 'blue' }) {
  return (
    <div className="aim-meter">
      <div>
        <span>{label}</span>
        <strong>{round(value)}%</strong>
      </div>
      <div className="aim-meter__track">
        <span className={`aim-meter__bar aim-meter__bar--${tone}`} style={{ width: `${clamp(value)}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="aim-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RetentionChart({ initialMastery, lambda }) {
  const width = 720;
  const height = 260;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = Array.from({ length: 61 }, (_, day) => {
    const retention = initialMastery * Math.exp(-lambda * day);
    const x = padding + (day / 60) * chartWidth;
    const y = padding + chartHeight - (clamp(retention) / 100) * chartHeight;
    return { day, retention, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const thresholdY = padding + chartHeight - 0.7 * chartHeight;

  return (
    <svg className="aim-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="منحنى الاحتفاظ خلال 60 يوما">
      <rect x="0" y="0" width={width} height={height} rx="8" />
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padding + chartHeight - (tick / 100) * chartHeight;
        return (
          <g key={tick}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} className="aim-chart__grid" />
            <text x="6" y={y + 4}>
              {tick}
            </text>
          </g>
        );
      })}
      <line x1={padding} x2={width - padding} y1={thresholdY} y2={thresholdY} className="aim-chart__threshold" />
      <text x={width - 154} y={thresholdY - 8} className="aim-chart__threshold-label">
        Review threshold
      </text>
      <path d={path} className="aim-chart__line" />
      <circle cx={points[0].x} cy={points[0].y} r="4" className="aim-chart__point" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" className="aim-chart__point" />
      <line x1={padding} x2={padding} y1={padding} y2={height - padding} className="aim-chart__axis" />
      <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} className="aim-chart__axis" />
    </svg>
  );
}

function AlgorithmTester() {
  const [activeTab, setActiveTab] = useState(0);
  const [student, setStudent] = useState(initialStudent);
  const [sessionLog, setSessionLog] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [hintVisible, setHintVisible] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [retentionConfig, setRetentionConfig] = useState({ lambda: 0.1, initialMastery: 80, daysElapsed: 12 });

  const questionSet = useMemo(() => questionBank[student.skill] || fallbackQuestions, [student.skill]);
  const currentQuestion = questionSet[questionIndex] || questionSet[0];
  const output = useMemo(() => getAlgorithmOutput(student, sessionLog), [student, sessionLog]);
  const competenceState = getCompetenceState(student.mastery, student.confidence);
  const quizScore = questionSet.length ? (output.metrics.correct / questionSet.length) * 100 : 0;
  const elapsedRetention = retentionConfig.initialMastery * Math.exp(-retentionConfig.lambda * retentionConfig.daysElapsed);
  const thresholdDay =
    retentionConfig.initialMastery <= 70
      ? 0
      : Math.ceil(Math.log(retentionConfig.initialMastery / 70) / retentionConfig.lambda);

  function updateStudent(key, value) {
    setStudent((current) => ({ ...current, [key]: value }));
    if (key === 'skill') {
      setSessionLog([]);
      setQuestionIndex(0);
      setSelectedAnswer('');
      setHintVisible(false);
      setQuizFinished(false);
      setQuestionStartedAt(Date.now());
    }
  }

  function applySessionEvent(type, seconds, extra = {}) {
    const labels = {
      correct: 'إجابة صحيحة',
      wrong: 'إجابة تحتاج تصحيحا',
      hint: 'استخدم تلميحا',
      skip: 'تم تجاوز السؤال',
    };
    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      label: labels[type],
      seconds,
      index: sessionLog.length + 1,
      ...extra,
    };

    setSessionLog((current) => [entry, ...current]);
    setStudent((current) => {
      const delta = {
        correct: { mastery: 4, confidence: 3, retention: 2, avgSpeed: seconds <= 8 ? 2 : -1 },
        wrong: { mastery: -4, confidence: -5, retention: -2, avgSpeed: -2 },
        hint: { mastery: 1, confidence: -1, retention: 1, avgSpeed: -1 },
        skip: { mastery: -3, confidence: -4, retention: -3, avgSpeed: -3 },
      }[type];

      return {
        ...current,
        mastery: clamp(current.mastery + delta.mastery),
        confidence: clamp(current.confidence + delta.confidence),
        retention: clamp(current.retention + delta.retention),
        avgSpeed: clamp(current.avgSpeed + delta.avgSpeed),
        attempts: current.attempts + 1,
      };
    });
  }

  function simulate(type) {
    const seconds = Math.floor(3 + Math.random() * 12);
    applySessionEvent(type, seconds);
  }

  function moveToNextQuestion() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= questionSet.length) {
      setQuizFinished(true);
      setSelectedAnswer('');
      return;
    }

    setQuestionIndex(nextIndex);
    setSelectedAnswer('');
    setHintVisible(false);
    setQuestionStartedAt(Date.now());
  }

  function submitAnswer() {
    if (!selectedAnswer || quizFinished) {
      return;
    }

    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
    const isCorrect = selectedAnswer === currentQuestion.answer;
    applySessionEvent(isCorrect ? 'correct' : 'wrong', seconds, {
      question: currentQuestion.prompt,
      answer: selectedAnswer,
      correctAnswer: currentQuestion.answer,
      difficulty: currentQuestion.difficulty,
    });
    moveToNextQuestion();
  }

  function useHint() {
    if (hintVisible || quizFinished) {
      return;
    }

    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
    setHintVisible(true);
    applySessionEvent('hint', seconds, {
      question: currentQuestion.prompt,
      answer: 'تم فتح التلميح',
      correctAnswer: currentQuestion.answer,
      difficulty: currentQuestion.difficulty,
    });
  }

  function skipQuestion() {
    if (quizFinished) {
      return;
    }

    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));
    applySessionEvent('skip', seconds, {
      question: currentQuestion.prompt,
      answer: 'تم التجاوز',
      correctAnswer: currentQuestion.answer,
      difficulty: currentQuestion.difficulty,
    });
    moveToNextQuestion();
  }

  function resetSession() {
    setSessionLog([]);
    setStudent(initialStudent);
    setQuestionIndex(0);
    setSelectedAnswer('');
    setQuestionStartedAt(Date.now());
    setHintVisible(false);
    setQuizFinished(false);
  }

  return (
    <main className="aim-tester">
      <style>{styles}</style>

      <header className="aim-header">
        <div>
          <p>مختبر خوارزمية AIM</p>
          <h1>لوحة تحليل تعليمية تجريبية</h1>
        </div>
        <button type="button" onClick={resetSession}>
          إعادة ضبط
        </button>
      </header>

      <nav className="aim-tabs" aria-label="Algorithm tester screens">
        {tabs.map((tab, index) => (
          <button
            className={activeTab === index ? 'is-active' : ''}
            key={tab}
            type="button"
            onClick={() => setActiveTab(index)}
          >
            <span>{index + 1}</span>
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 0 && (
        <section className="aim-grid">
          <div className="aim-panel">
            <h2>إعداد الطالب</h2>
            <label className="aim-field">
              <span>المهارة</span>
              <select value={student.skill} onChange={(event) => updateStudent('skill', event.target.value)}>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>{displaySkill(skill)}</option>
                ))}
              </select>
            </label>
            <Slider label="نسبة الإتقان" value={student.mastery} onChange={(value) => updateStudent('mastery', value)} />
            <Slider label="مستوى الثقة" value={student.confidence} onChange={(value) => updateStudent('confidence', value)} />
            <Slider label="الاحتفاظ" value={student.retention} onChange={(value) => updateStudent('retention', value)} />
            <Slider label="متوسط السرعة" value={student.avgSpeed} onChange={(value) => updateStudent('avgSpeed', value)} />
            <Slider label="عدد المحاولات" value={student.attempts} max={30} onChange={(value) => updateStudent('attempts', value)} />
          </div>

          <div className="aim-panel aim-state">
            <h2>الثقة مقارنة بالأداء</h2>
            <div className="aim-big-label">{competenceState}</div>
            <p>
              نسبة الإتقان {student.mastery}% ومستوى الثقة {student.confidence}% يضعان الطالب في حالة {competenceState}.
            </p>
            <Meter label="نسبة الإتقان" value={student.mastery} tone="green" />
            <Meter label="مستوى الثقة" value={student.confidence} tone="amber" />
          </div>
        </section>
      )}

      {activeTab === 1 && (
        <section className="aim-grid aim-grid--wide">
          <div className="aim-panel">
            <div className="aim-quiz-head">
              <h2>اختبار الطالب</h2>
              <strong>
                {Math.min(questionIndex + 1, questionSet.length)} / {questionSet.length}
              </strong>
            </div>

            {!quizFinished ? (
              <>
                <div className="aim-question">
                  <span>الصعوبة {currentQuestion.difficulty}</span>
                  <h3>{currentQuestion.prompt}</h3>
                </div>

                <div className="aim-options">
                  {currentQuestion.options.map((option) => (
                    <label className={selectedAnswer === option ? 'is-selected' : ''} key={option}>
                      <input
                        checked={selectedAnswer === option}
                        name="quiz-answer"
                        type="radio"
                        value={option}
                        onChange={(event) => setSelectedAnswer(event.target.value)}
                      />
                      {option}
                    </label>
                  ))}
                </div>

                {hintVisible && <div className="aim-hint">{currentQuestion.hint}</div>}

                <div className="aim-actions aim-actions--quiz">
                  <button type="button" onClick={submitAnswer} disabled={!selectedAnswer}>
                    إرسال الإجابة
                  </button>
                  <button type="button" onClick={useHint} disabled={hintVisible}>
                    استخدام تلميح
                  </button>
                  <button type="button" onClick={skipQuestion}>
                    تجاوز
                  </button>
                </div>
              </>
            ) : (
              <div className="aim-result">
                <span>النتيجة النهائية</span>
                <strong>{round(quizScore)}%</strong>
                <p>
                  أجاب الطالب عن {output.metrics.correct} إجابة صحيحة من أصل {questionSet.length}. توصية AIM:
                  {' '}{displayDecision(output.recommendation.label)}.
                </p>
              </div>
            )}
          </div>

          <div className="aim-panel">
            <h2>مؤشرات مباشرة</h2>
            <div className="aim-stats">
              <Stat label="إجابات صحيحة" value={output.metrics.correct} />
              <Stat label="إجابات تحتاج تصحيحا" value={output.metrics.wrong} />
              <Stat label="تلميحات" value={output.metrics.hints} />
            </div>
            <Meter label="نتيجة الاختبار" value={quizScore} tone="green" />
            <Meter label="تقدير الإتقان" value={output.masteryScore} tone="blue" />
            <Meter label="يحتاج إلى تبسيط أو إبطاء" value={output.frustrationScore} tone="red" />
            <div className="aim-formula">
              <strong>{displayDecision(output.recommendation.label)}</strong>
              <span>{output.recommendation.reason}</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 2 && (
        <section className="aim-grid">
          <div className="aim-panel">
            <h2>محاكاة سريعة</h2>
            <div className="aim-actions">
              <button type="button" onClick={() => simulate('correct')}>إجابة صحيحة</button>
              <button type="button" onClick={() => simulate('wrong')}>إجابة تحتاج تصحيحا</button>
              <button type="button" onClick={() => simulate('hint')}>استخدام تلميح</button>
              <button type="button" onClick={() => simulate('skip')}>تجاوز السؤال</button>
            </div>
            <div className="aim-stats">
              <Stat label="الدقة" value={`${round(output.metrics.accuracy)}%`} />
              <Stat label="معدل الإعادة" value={round(output.metrics.retryRate, 2)} />
              <Stat label="مؤشر التردد" value={round(output.metrics.hesitationIndex, 2)} />
            </div>
            <Meter label="يحتاج إلى تبسيط أو إبطاء" value={output.frustrationScore} tone="red" />
          </div>

          <div className="aim-panel">
            <h2>سجل الجلسة</h2>
            <div className="aim-log">
              {sessionLog.length === 0 && <p>لا توجد محاولات مسجلة بعد.</p>}
              {sessionLog.map((entry) => (
                <div className={`aim-log__item aim-log__item--${entry.type}`} key={entry.id}>
                  <span>#{entry.index}</span>
                  <strong>
                    {entry.label}
                    {entry.question && <small>{entry.question}</small>}
                    {entry.answer && (
                      <small>
                        إجابة الطالب: {entry.answer}
                        {entry.correctAnswer ? ` | الإجابة الصحيحة: ${entry.correctAnswer}` : ''}
                      </small>
                    )}
                  </strong>
                  <em>{entry.seconds}s</em>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 3 && (
        <section className="aim-grid aim-grid--wide">
          <div className="aim-panel">
            <h2>نتائج الخوارزمية</h2>
            <div className="aim-formula">
              <strong>نسبة الإتقان: {round(output.masteryScore)}%</strong>
              <span>
                الدقة {round(output.metrics.accuracy)} × 0.35 + السرعة {round(output.speed)} × 0.15 +
                الاتساق {round(output.consistency)} × 0.20 + الاحتفاظ {student.retention} × 0.15 +
                أداء الصعوبة {round(output.difficultyPerf)} × 0.15
              </span>
            </div>
            <Meter label="نسبة الإتقان" value={output.masteryScore} tone="green" />
            <Meter label="درجة الصعوبة" value={output.difficultyScore} tone="blue" />
            <div className="aim-stats">
              <Stat label="قرار الصعوبة" value={displayDecision(output.difficultyDecision)} />
              <Stat label="مهارة تحتاج تدريب" value={round(output.weaknessScore, 2)} />
              <Stat label="أنماط الأخطاء المتكررة" value={displayDecision(output.errorPatternType)} />
            </div>
          </div>

          <div className="aim-panel aim-recommendation">
            <h2>التوصية التالية</h2>
            <div className="aim-big-label">{displayDecision(output.recommendation.label)}</div>
            <p>{output.recommendation.reason}</p>
            <div className="aim-system-list">
              <span>المهارة: {displaySkill(student.skill)}</span>
              <span>يحتاج إلى تبسيط أو إبطاء: {round(output.frustrationScore)}%</span>
              <span>الاتساق: {round(output.consistency)}%</span>
              <span>تم تطبيق أولوية القرار في محاكاة الواجهة</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 4 && (
        <section className="aim-grid">
          <div className="aim-panel">
            <h2>منحنى الاحتفاظ مع الوقت</h2>
            <RetentionChart initialMastery={retentionConfig.initialMastery} lambda={retentionConfig.lambda} />
            <div className="aim-stats">
              <Stat label="اليوم المحدد" value={retentionConfig.daysElapsed} />
              <Stat label="الاحتفاظ" value={`${round(elapsedRetention)}%`} />
              <Stat label="يصل إلى 70%" value={`اليوم ${thresholdDay}`} />
            </div>
          </div>
          <div className="aim-panel">
            <h2>إعدادات المنحنى</h2>
            <Slider
              label="الإتقان الأولي"
              value={retentionConfig.initialMastery}
              onChange={(value) => setRetentionConfig((current) => ({ ...current, initialMastery: value }))}
            />
            <Slider
              label="معامل النسيان"
              min={0.05}
              max={0.3}
              step={0.01}
              value={retentionConfig.lambda}
              onChange={(value) => setRetentionConfig((current) => ({ ...current, lambda: value }))}
            />
            <Slider
              label="الأيام المنقضية"
              max={60}
              value={retentionConfig.daysElapsed}
              onChange={(value) => setRetentionConfig((current) => ({ ...current, daysElapsed: value }))}
            />
            <div className="aim-formula">
              <strong>الاحتفاظ = الإتقان الأولي × e^(-معامل النسيان × الوقت)</strong>
              <span>
                {retentionConfig.initialMastery} x e^(-{retentionConfig.lambda} x {retentionConfig.daysElapsed})
              </span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const styles = `
.aim-tester {
  background: #eef3f7;
  color: #14213d;
  direction: rtl;
  min-height: 100vh;
  padding: 28px;
  text-align: right;
}

.aim-header {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin: 0 auto 22px;
  max-width: 1180px;
}

.aim-header p {
  color: #116a63;
  font-size: 0.78rem;
  font-weight: 800;
  margin: 0 0 8px;
}

.aim-header h1 {
  font-size: clamp(2rem, 4vw, 3.8rem);
  line-height: 1;
  margin: 0;
}

.aim-header button,
.aim-actions button,
.aim-tabs button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
}

.aim-header button {
  background: #14213d;
  color: #ffffff;
  padding: 12px 18px;
}

.aim-tabs {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0 auto 18px;
  max-width: 1180px;
}

.aim-tabs button {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d8e0ea;
  color: #516173;
  display: flex;
  gap: 10px;
  justify-content: center;
  min-height: 48px;
}

.aim-tabs button.is-active {
  background: #1f6feb;
  border-color: #1f6feb;
  color: #ffffff;
}

.aim-tabs span {
  align-items: center;
  background: rgba(20, 33, 61, 0.1);
  border-radius: 999px;
  display: inline-flex;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.aim-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  margin: 0 auto;
  max-width: 1180px;
}

.aim-grid--wide {
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.aim-panel {
  background: #ffffff;
  border: 1px solid #d8e0ea;
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
  padding: 22px;
}

.aim-panel h2 {
  font-size: 1.25rem;
  margin: 0 0 18px;
}

.aim-field,
.aim-slider {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.aim-field span,
.aim-slider span,
.aim-meter span,
.aim-stat span {
  color: #65758b;
  font-size: 0.82rem;
  font-weight: 800;
}

.aim-field select {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #14213d;
  min-height: 44px;
  padding: 0 12px;
}

.aim-slider span,
.aim-meter div:first-child {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.aim-slider strong,
.aim-meter strong {
  color: #14213d;
}

.aim-slider input {
  accent-color: #1f6feb;
  width: 100%;
}

.aim-big-label {
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #166534;
  font-size: clamp(1.8rem, 4vw, 3.4rem);
  font-weight: 900;
  line-height: 1;
  margin-bottom: 14px;
  overflow-wrap: anywhere;
  padding: 20px;
}

.aim-state p,
.aim-recommendation p,
.aim-log p {
  color: #65758b;
  line-height: 1.6;
}

.aim-meter {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.aim-meter__track {
  background: #e6edf5;
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}

.aim-meter__bar {
  display: block;
  height: 100%;
}

.aim-meter__bar--blue { background: #1f6feb; }
.aim-meter__bar--green { background: #16a34a; }
.aim-meter__bar--amber { background: #d97706; }
.aim-meter__bar--red { background: #dc2626; }

.aim-actions {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.aim-actions button {
  background: #eef4ff;
  border: 1px solid #bcd3ff;
  color: #164da8;
  min-height: 48px;
}

.aim-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.aim-actions--quiz {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

.aim-quiz-head {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 18px;
}

.aim-quiz-head h2 {
  margin: 0;
}

.aim-quiz-head strong {
  background: #eef4ff;
  border: 1px solid #bcd3ff;
  border-radius: 999px;
  color: #164da8;
  padding: 8px 12px;
}

.aim-question {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 18px;
}

.aim-question span {
  color: #65758b;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.aim-question h3 {
  font-size: 1.45rem;
  line-height: 1.35;
  margin: 10px 0 0;
}

.aim-options {
  display: grid;
  gap: 10px;
}

.aim-options label {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d8e0ea;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  min-height: 48px;
  padding: 12px;
}

.aim-options label.is-selected {
  background: #eef4ff;
  border-color: #1f6feb;
  color: #164da8;
  font-weight: 800;
}

.aim-hint {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  color: #9a3412;
  font-weight: 700;
  line-height: 1.5;
  margin-top: 14px;
  padding: 14px;
}

.aim-result {
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #166534;
  display: grid;
  gap: 10px;
  padding: 22px;
}

.aim-result span {
  font-size: 0.82rem;
  font-weight: 900;
}

.aim-result strong {
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.95;
}

.aim-result p {
  color: #166534;
  line-height: 1.55;
  margin: 0;
}

.aim-stats {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 18px 0;
}

.aim-stat {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 14px;
}

.aim-stat strong {
  font-size: 1.15rem;
  overflow-wrap: anywhere;
}

.aim-log {
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow: auto;
}

.aim-log__item {
  align-items: center;
  border: 1px solid #e2e8f0;
  border-right: 6px solid #94a3b8;
  border-radius: 8px;
  display: grid;
  gap: 10px;
  grid-template-columns: 48px minmax(0, 1fr) 52px;
  padding: 12px;
}

.aim-log__item span,
.aim-log__item em {
  color: #64748b;
  font-style: normal;
  font-weight: 800;
}

.aim-log__item strong {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.aim-log__item small {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.4;
}

.aim-log__item--correct { border-right-color: #16a34a; }
.aim-log__item--wrong { border-right-color: #dc2626; }
.aim-log__item--hint { border-right-color: #d97706; }
.aim-log__item--skip { border-right-color: #64748b; }

.aim-formula {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 8px;
  line-height: 1.5;
  margin-bottom: 18px;
  padding: 16px;
}

.aim-formula span,
.aim-system-list span {
  color: #65758b;
}

.aim-system-list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.aim-chart {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: block;
  height: auto;
  width: 100%;
}

.aim-chart rect {
  fill: #f8fafc;
}

.aim-chart text {
  fill: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.aim-chart__grid {
  stroke: #dbe4ef;
}

.aim-chart__axis {
  stroke: #94a3b8;
  stroke-width: 2;
}

.aim-chart__threshold {
  stroke: #dc2626;
  stroke-dasharray: 6 6;
  stroke-width: 2;
}

.aim-chart__threshold-label {
  fill: #dc2626;
}

.aim-chart__line {
  fill: none;
  stroke: #1f6feb;
  stroke-linecap: round;
  stroke-width: 4;
}

.aim-chart__point {
  fill: #1f6feb;
}

@media (max-width: 880px) {
  .aim-grid,
  .aim-grid--wide,
  .aim-tabs {
    grid-template-columns: 1fr;
  }

  .aim-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .aim-tester {
    padding: 16px;
  }

  .aim-actions,
  .aim-actions--quiz,
  .aim-stats {
    grid-template-columns: 1fr;
  }
}
`;

export default AlgorithmTester;
