import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Test', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Main App Modes/i })).toBeInTheDocument();
    expect(screen.getByText('Sahaayak')).toBeInTheDocument();
  });
});
