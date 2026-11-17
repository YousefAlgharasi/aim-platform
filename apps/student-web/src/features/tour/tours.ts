// Guided tours: one short tour per page that has something worth explaining.
// Steps point at elements by `data-tour="…"` (stable hooks added to the pages), never by position or class.
// A step whose element is missing or hidden (for example the sidebar on a phone) is skipped.
// All text goes through t(); Arabic lives in i18n/ar/tour.ts.

export interface TourStep {
  /** CSS selector, normally `[data-tour="name"]`. If several match, the first visible one is used. */
  target: string;
  title: string;
  body: string;
}

export interface Tour {
  id: string;
  /** Pages this tour belongs to. */
  path: RegExp;
  /** Where to send the user when they ask for this tour from somewhere else (Settings). */
  home: string;
  /** Offered automatically on the first visit. Only the dashboard does this; the rest wait for the Help button. */
  autoStart?: boolean;
  steps: TourStep[];
}

const at = (name: string) => `[data-tour="${name}"]`;

export const TOURS: Tour[] = [
  {
    id: 'dashboard',
    path: /^\/$/,
    home: '/',
    autoStart: true,
    steps: [
      { target: at('course-lessons'), title: 'Continue your lessons', body: 'Your next lessons are here. Tap one to keep learning.' },
      { target: at('daily-goal'), title: 'Your daily goal', body: 'Finish your daily lessons to fill this ring.' },
      { target: at('streak'), title: 'Your streak', body: 'Learn every day to grow your streak. Tap the flame to see your week.' },
      { target: at('word-of-day'), title: 'Word of the day', body: 'Learn one new word each day. Tap the speaker to hear it, then add it to My words.' },
      { target: at('daily-challenges'), title: 'Daily challenges', body: 'These are small goals for today. Finish them to earn extra XP.' },
      { target: at('xp-stats'), title: 'XP and badges', body: 'You earn XP for every lesson. XP raises your level and unlocks badges.' },
      { target: at('nav'), title: 'Find your way around', body: 'Use the menu to move between Learn, Practice, Progress and your account.' },
    ],
  },
  {
    id: 'courses',
    path: /^\/curriculum\/?$/,
    home: '/curriculum',
    steps: [
      { target: at('level-badge'), title: 'Your level', body: 'Courses are matched to your level.' },
      { target: `${at('courses-start')}, ${at('courses-levels')}`, title: 'Pick a course', body: 'Tap a course to open it. The bar shows how much you have finished.' },
    ],
  },
  {
    id: 'course',
    path: /^\/curriculum\/[^/]+\/?$/,
    home: '/curriculum',
    steps: [
      { target: at('course-summary'), title: 'About this course', body: 'See what the course covers and how far you have come.' },
      { target: at('chapter-list'), title: 'Chapters and lessons', body: 'Open a lesson to start. Finish a lesson to unlock the next one.' },
    ],
  },
  {
    id: 'practice',
    path: /^\/practice\/?$/,
    home: '/practice',
    steps: [
      { target: at('practice-plan'), title: 'Your 5-minute plan', body: 'This shows what is waiting for you today. Tap the button to start.' },
      { target: at('practice-speak'), title: 'Speak and write', body: 'Pick a topic, talk or write about it, and get feedback.' },
      { target: at('practice-fix'), title: 'Remember and fix', body: 'Review your saved words and try your mistakes again.' },
    ],
  },
  {
    id: 'vocabulary-library',
    path: /^\/vocabulary-library\/?$/,
    home: '/vocabulary-library',
    steps: [
      { target: at('vocab-search'), title: 'Search and filter', body: 'Type a word, or choose a level to see words that fit you.' },
      { target: at('vocab-list'), title: 'Listen and save', body: 'Tap the speaker to hear a word. Tap the bookmark to save it to My words.' },
    ],
  },
  {
    id: 'my-words',
    path: /^\/vocabulary\/?$/,
    home: '/vocabulary',
    steps: [
      { target: at('words-review'), title: 'Today’s review', body: 'Words come back at the right time so you remember them. Start your review here.' },
      { target: at('words-add'), title: 'Add your own words', body: 'Found a new word? Add it with its meaning and an example.' },
      { target: at('words-list'), title: 'Your saved words', body: 'The bars show how well you know each word.' },
    ],
  },
  {
    id: 'ai-teacher',
    path: /^\/ai-teacher\/?$/,
    home: '/ai-teacher',
    steps: [
      { target: at('teacher-start'), title: 'Your AI Teacher', body: 'Ask questions, practice speaking, and get help with your writing at any time.' },
      { target: at('teacher-prompts'), title: 'Not sure what to ask?', body: 'Tap an idea to start a conversation.' },
    ],
  },
  {
    id: 'voice-teacher',
    path: /^\/voice-teacher(\/[^/]+)?\/?$/,
    home: '/ai-teacher',
    // The live voice room is new to most students: offer its tour the first time they open it.
    autoStart: true,
    steps: [
      { target: at('voice-stage'), title: 'Your live teacher', body: 'The robot shows what your teacher is doing: listening, thinking or speaking. Talk to it like a real teacher.' },
      { target: at('voice-mic'), title: 'Talk with your voice', body: 'Tap the microphone and start speaking. Tap it again to pause. Speak slowly and clearly.' },
      { target: at('voice-text'), title: 'Or type', body: 'Cannot speak right now? Type your message here and press send.' },
      { target: at('voice-mute'), title: 'The teacher’s voice', body: 'Turn the teacher’s voice off if you only want to read, and on again to listen.' },
      { target: at('voice-chat'), title: 'Your conversation', body: 'Everything you and the teacher say is written here, so you can read it again.' },
    ],
  },
  {
    id: 'improve',
    path: /^\/improve\/?$/,
    home: '/improve',
    steps: [
      { target: at('improve-start'), title: 'Start with this', body: 'This is your most important weak spot right now. Practice it first.' },
      { target: at('improve-stats'), title: 'Your numbers', body: 'See how many skills need work, how many mistakes you can retry, and what you have already fixed.' },
      { target: at('improve-spots'), title: 'Weak spots', body: 'Each card is a skill to improve. Retry opens a few days later, because spacing helps you remember.' },
    ],
  },
  {
    id: 'speaking-writing',
    path: /^\/practice\/(speaking|writing)\/?$/,
    home: '/practice',
    steps: [
      { target: at('topics-list'), title: 'Pick a topic', body: 'Choose a topic, then speak or write about it. Your teacher gives you feedback on what to fix.' },
    ],
  },
  {
    id: 'assessments',
    path: /^\/assessments\/?$/,
    home: '/assessments',
    steps: [
      { target: at('assess-next'), title: 'Up next', body: 'Your next quiz or exam is here. Tap Take it when you are ready.' },
      { target: at('assess-list'), title: 'Quizzes and exams', body: 'Quizzes come at the end of chapters. The final exam comes at the end of the course.' },
    ],
  },
  {
    id: 'achievements',
    path: /^\/achievements\/?$/,
    home: '/achievements',
    steps: [
      { target: at('ach-summary'), title: 'Your badges', body: 'See how many badges you have unlocked and your level.' },
      { target: at('ach-list'), title: 'Unlock more', body: 'Finish lessons and keep your streak to unlock each badge.' },
    ],
  },
  {
    id: 'certificates',
    path: /^\/certificates\/?$/,
    home: '/certificates',
    steps: [
      { target: at('cert-list'), title: 'Your certificates', body: 'Finish a course and pass its final exam to earn a certificate. Tap one to view and print it.' },
    ],
  },
  {
    id: 'leaderboard',
    path: /^\/leaderboard\/?$/,
    home: '/leaderboard',
    steps: [
      { target: at('board-list'), title: 'The leaderboard', body: 'See how your XP compares with other learners. Switch between this week and all time.' },
    ],
  },
  {
    id: 'notifications',
    path: /^\/notifications\/?$/,
    home: '/notifications',
    steps: [
      { target: at('notif-filter'), title: 'Your notifications', body: 'Show only unread messages, or mark them all as read.' },
    ],
  },
  {
    id: 'settings',
    path: /^\/settings\/?$/,
    home: '/settings',
    steps: [
      { target: at('settings-prefs'), title: 'Make it yours', body: 'Choose your language, theme and daily goal here.' },
    ],
  },
  {
    id: 'support',
    path: /^\/support\/?$/,
    home: '/support',
    steps: [
      { target: at('support-tickets'), title: 'Need help?', body: 'Send us a message and follow the answer here under My Tickets.' },
    ],
  },
  {
    id: 'progress',
    path: /^\/progress\/?$/,
    home: '/progress',
    steps: [
      { target: at('progress-next'), title: 'Your next step', body: 'This is the best thing to do next, based on your results.' },
      { target: at('progress-skills'), title: 'Your skills', body: 'See which skills are strong and which need more practice.' },
    ],
  },
];

export function tourForPath(pathname: string): Tour | undefined {
  return TOURS.find((t) => t.path.test(pathname));
}

export function tourById(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}
