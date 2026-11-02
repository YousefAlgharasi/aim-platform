import '@testing-library/jest-dom';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { PageChromeProvider, PageTitleBar, usePageChrome } from '../components/common/PageTitleBar';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

describe('PageTitleBar', () => {
  it('shows the back arrow and the title (as the page h1) together, plus subtitle and action', () => {
    render(<PageTitleBar title="Profile" subtitle="Your details" action={<button>Edit</button>} />);
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Your details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    // arrow and title share one row
    expect(screen.getByRole('button', { name: 'Go back' }).parentElement).toBe(screen.getByRole('heading', { level: 1 }).parentElement);
  });

  it('tells the layout it has its own arrow, and clears that when it goes away', () => {
    function Host({ withBar }: { withBar: boolean }) {
      const { hasTitleBar, chrome } = usePageChrome();
      return (
        <PageChromeProvider value={chrome}>
          <span data-testid="flag">{String(hasTitleBar)}</span>
          {withBar && <PageTitleBar title="X" />}
        </PageChromeProvider>
      );
    }
    const { rerender } = render(<Host withBar={false} />);
    expect(screen.getByTestId('flag')).toHaveTextContent('false');
    rerender(<Host withBar />);
    expect(screen.getByTestId('flag')).toHaveTextContent('true');
    rerender(<Host withBar={false} />);
    expect(screen.getByTestId('flag')).toHaveTextContent('false');
  });

  it('does not remount the page when the arrow flag changes (no render loop)', () => {
    let mounts = 0;
    function Child() {
      // runs once per mount
      useEffect(() => { mounts += 1; }, []);
      return <PageTitleBar title="Y" />;
    }
    function Host() {
      const { chrome } = usePageChrome();
      return <PageChromeProvider value={chrome}><Child /></PageChromeProvider>;
    }
    render(<Host />);
    expect(mounts).toBe(1);
  });
});
