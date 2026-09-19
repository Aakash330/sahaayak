import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '../../src/components/ui/Layout';
import { TextSizeProvider } from '../../src/accessibility/TextSizeContext';

describe('Layout and TextSizeProvider', () => {
  it('renders header and main content area', () => {
    render(
      <TextSizeProvider>
        <AppShell>
          <p>Main Content</p>
        </AppShell>
      </TextSizeProvider>
    );
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('allows cycling through text sizes', async () => {
    render(
      <TextSizeProvider>
        <AppShell>Content</AppShell>
      </TextSizeProvider>
    );
    
    const sizeButton = screen.getByRole('button', { name: /change text size/i });
    expect(sizeButton).toBeInTheDocument();

    // Default is normal
    expect(document.documentElement).toHaveClass('text-size-normal');

    // Click -> large
    await userEvent.click(sizeButton);
    expect(document.documentElement).toHaveClass('text-size-large');

    // Click -> extra-large
    await userEvent.click(sizeButton);
    expect(document.documentElement).toHaveClass('text-size-extra-large');

    // Click -> normal
    await userEvent.click(sizeButton);
    expect(document.documentElement).toHaveClass('text-size-normal');
  });
});
