import { render, screen } from '@testing-library/react';
import { isFocusPath } from '../layouts/focusMode';
import { DashboardSkeleton } from '../components/common/Skeleton';

jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

describe('isFocusPath', () => {
  it.each(['/lessons/abc', '/practice/5f2c'])('%s is a focus screen', (p) => expect(isFocusPath(p)).toBe(true));
  it.each(['/', '/curriculum/abc', '/practice/speaking', '/practice/writing', '/practice/writing/t1', '/practice/lesson/l1', '/lessons'])(
    '%s is not', (p) => expect(isFocusPath(p)).toBe(false));
});

describe('DashboardSkeleton', () => {
  it('announces loading once and hides the placeholder blocks from assistive tech', () => {
    render(<DashboardSkeleton />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(status.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(5);
  });
});

import { CardGridSkeleton, ChatSkeleton, DetailSkeleton, FormSkeleton, ListSkeleton, QuestionSkeleton } from '../components/common/Skeleton';

describe('page skeletons', () => {
  it.each([
    ['ListSkeleton', <ListSkeleton key="a" />],
    ['ListSkeleton bare', <ListSkeleton key="b" bare rows={2} />],
    ['CardGridSkeleton', <CardGridSkeleton key="c" />],
    ['DetailSkeleton', <DetailSkeleton key="d" />],
    ['FormSkeleton', <FormSkeleton key="e" />],
    ['QuestionSkeleton', <QuestionSkeleton key="f" />],
    ['ChatSkeleton', <ChatSkeleton key="g" />],
  ])('%s announces loading once', (_name, el) => {
    const { container } = render(el);
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(container.querySelector('[role="status"]')?.getAttribute('aria-busy')).toBe('true');
  });
});
