import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from '../components/common/BackButton';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState(null, '');
});

describe('BackButton', () => {
  it('has an accessible "Go back" name', () => {
    render(<BackButton />);
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('goes to the previous page when there is history', () => {
    window.history.replaceState({ idx: 2 }, '');
    render(<BackButton fallback="/curriculum" />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('goes to the fallback when the tab started on this page', () => {
    render(<BackButton fallback="/curriculum" />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum', { replace: true });
  });

  it('defaults the fallback to the home page', () => {
    render(<BackButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
