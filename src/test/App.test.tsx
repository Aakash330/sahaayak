import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Test', () => {
  it('renders without crashing', () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });
});
