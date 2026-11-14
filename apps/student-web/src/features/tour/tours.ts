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
