import fs from 'fs';
import path from 'path';
import { TOURS, tourForPath } from '../features/tour/tours';
import { hasSeenTour, markTourSeen, requestTour, TOUR_START_EVENT } from '../features/tour/tourStore';
import { ar } from '../i18n/ar';

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === '__tests__' ? [] : sourceFiles(p);
    return /\.tsx$/.test(d.name) ? [p] : [];
  });
}

describe('guided tour config', () => {
  const src = sourceFiles(path.join(__dirname, '..')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  it('only points at data-tour hooks that exist in the pages', () => {
    for (const tour of TOURS) {
      for (const step of tour.steps) {
        for (const m of step.target.matchAll(/data-tour="([^"]+)"/g)) {
          expect({ tour: tour.id, hook: m[1], found: src.includes(`'${m[1]}'`) || src.includes(`"${m[1]}"`) }).toMatchObject({ found: true });
        }
      }
    }
  });

  it('has Arabic text for every title and explanation (or reuses an existing translation)', () => {
    const missing: string[] = [];
    for (const tour of TOURS) for (const s of tour.steps) for (const text of [s.title, s.body]) if (!ar[text]) missing.push(text);
    expect(missing).toEqual([]);
  });

  it('keeps explanations short for learners', () => {
    for (const tour of TOURS) for (const s of tour.steps) expect(s.body.length).toBeLessThanOrEqual(110);
  });

  it('only the dashboard starts by itself, and each page maps to one tour', () => {
    expect(TOURS.filter((t) => t.autoStart).map((t) => t.id)).toEqual(['dashboard']);
    expect(tourForPath('/')?.id).toBe('dashboard');
    expect(tourForPath('/curriculum')?.id).toBe('courses');
    expect(tourForPath('/curriculum/abc')?.id).toBe('course');
    expect(tourForPath('/practice')?.id).toBe('practice');
  });

  it('has no tour on lessons, running practice sessions or assessment attempts', () => {
    ['/lessons/l1', '/practice/session-1', '/assessments/a1/attempt/x', '/placement/q'].forEach((p) => expect(tourForPath(p)).toBeUndefined());
  });
});

describe('tour memory', () => {
  beforeEach(() => window.localStorage.clear());

  it('is per user and per tour', () => {
    expect(hasSeenTour('u1', 'dashboard')).toBe(false);
    markTourSeen('u1', 'dashboard');
    expect(hasSeenTour('u1', 'dashboard')).toBe(true);
    expect(hasSeenTour('u1', 'courses')).toBe(false);
    expect(hasSeenTour('u2', 'dashboard')).toBe(false);
  });

  it('does not interrupt people who already dismissed the earlier welcome tips', () => {
    window.localStorage.setItem('aim_tips_seen:u1', '1');
    expect(hasSeenTour('u1', 'dashboard')).toBe(true);
    expect(hasSeenTour('u1', 'courses')).toBe(false);
  });

  it('requestTour announces which tour to start', () => {
    const seen = jest.fn();
    const on = (e: Event) => seen((e as CustomEvent).detail);
    window.addEventListener(TOUR_START_EVENT, on);
    requestTour('practice');
    window.removeEventListener(TOUR_START_EVENT, on);
    expect(seen).toHaveBeenCalledWith({ tourId: 'practice' });
  });
});
