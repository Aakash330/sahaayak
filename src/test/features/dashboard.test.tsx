import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../src/features/dashboard/Dashboard';

describe('Dashboard Feature', () => {
  it('renders dashboard greeting correctly', async () => {
    render(<Dashboard userName="Ravi" />);
    // Since it's synchronous mock data in our useEffect right now, it renders immediately or after 1 tick
    expect(await screen.findByText(/Good morning, Ravi/i)).toBeInTheDocument();
  });

  it('renders maximum 3 items', async () => {
    render(<Dashboard />);
    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeLessThanOrEqual(3);
  });

  it('displays item titles and categories', async () => {
    render(<Dashboard />);
    expect(await screen.findByText('Electricity bill')).toBeInTheDocument();
    expect(await screen.findByText('Doctor appointment')).toBeInTheDocument();
    expect(await screen.findByText('Bank message')).toBeInTheDocument();
  });

  it('contains expected actions on items', async () => {
    render(<Dashboard />);
    const explainButtons = await screen.findAllByRole('button', { name: /Explain this/i });
    expect(explainButtons.length).toBeGreaterThan(0);
  });
});
