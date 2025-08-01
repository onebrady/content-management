import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render with default size', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with small size when specified', () => {
    render(<LoadingSpinner size="small" />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('MuiCircularProgress-sizeSmall');
  });

  it('should render with large size when specified', () => {
    render(<LoadingSpinner size="large" />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('MuiCircularProgress-sizeLarge');
  });

  it('should render with custom color when specified', () => {
    render(<LoadingSpinner color="secondary" />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('MuiCircularProgress-colorSecondary');
  });

  it('should render with custom className when provided', () => {
    render(<LoadingSpinner className="custom-spinner" />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner.parentElement).toHaveClass('custom-spinner');
  });
});
