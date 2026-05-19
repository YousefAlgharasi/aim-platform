import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/aim-demo');
});

afterEach(() => {
  window.history.pushState({}, '', '/');
});

test('renders the AIM visual demo dashboard', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: /aim adaptive pipeline dashboard/i,
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /run aim demo/i })).toBeInTheDocument();
  expect(screen.getByText(/mock demo data/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Student Profile' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Submitted Attempts' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Prompt Adaptation Instruction' })).toBeInTheDocument();
});
