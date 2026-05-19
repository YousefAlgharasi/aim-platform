import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the AIM status shell', async () => {
  render(<App />);

  expect(screen.getByRole('heading', {
    name: /adaptive intelligence module/i,
  })).toBeInTheDocument();
  expect(await screen.findByText(/online/i)).toBeInTheDocument();
});
