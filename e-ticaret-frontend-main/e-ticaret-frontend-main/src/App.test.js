import { render, screen } from '@testing-library/react';
import App from './App';

test('renders role selection on first visit', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText('Admin')).toBeInTheDocument();
  expect(screen.getByText('Satıcı')).toBeInTheDocument();
});
