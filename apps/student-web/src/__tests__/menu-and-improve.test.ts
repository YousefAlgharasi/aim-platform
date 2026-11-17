import fs from 'fs';
import path from 'path';

jest.mock('../layouts/navItems', () => jest.requireActual('../layouts/navItems'));
import { navSections, navItems } from '../layouts/navItems';

describe('menu', () => {
  const listed = navSections.flatMap((s) => s.items.map((i) => i.to));

  it('no longer lists AI Teacher, My mistakes or Billing', () => {
    expect(listed).not.toContain('/ai-teacher');
    expect(listed).not.toContain('/mistakes');
    expect(listed).not.toContain('/billing');
  });

  it('keeps the other menu entries', () => {
    ['/', '/curriculum', '/practice', '/improve', '/progress', '/settings', '/support'].forEach((p) => expect(listed).toContain(p));
  });

  it('still knows the unlisted pages so their titles and back buttons keep working', () => {
    const all = navItems.map((i) => i.to);
    ['/ai-teacher', '/mistakes', '/billing'].forEach((p) => expect(all).toContain(p));
  });
});

describe('Improve page', () => {
  it('has no "Find a lesson" button any more', () => {
    const src = fs.readFileSync(path.join(__dirname, '../features/improve/ImprovePage.tsx'), 'utf8');
    expect(src).not.toContain('Find a lesson');
  });
});

describe('placement never enrolls a course by itself', () => {
  it('the placement result and start pages do not call an auto-enroll helper', () => {
    for (const f of ['../features/placement/PlacementResultPage.tsx', '../features/start/StartPage.tsx']) {
      const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
      expect(src).not.toMatch(/ensureStartingCourse|enrollInCourse/);
    }
  });
});
