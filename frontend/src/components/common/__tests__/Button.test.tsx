import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/click me/i)).not.toBeInTheDocument();
  });

  it('does not call onClick when loading', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} isLoading>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  describe('variants', () => {
    it('applies primary variant classes by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-600');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary-600');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-danger-600');
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-700');
    });

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'border-2');
    });
  });

  describe('sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('applies small size classes', () => {
      render(<Button size="sm">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('applies large size classes', () => {
      render(<Button size="lg">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('full width', () => {
    it('does not apply full width by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('applies full width when specified', () => {
      render(<Button fullWidth>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref to button element', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('spreads additional props to button element', () => {
    render(<Button data-testid="custom-button">Click me</Button>);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
