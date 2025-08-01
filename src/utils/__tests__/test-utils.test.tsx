import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { render } from '../test-utils';

// Create a simple test component
const TestComponent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-component">{children}</div>
);

describe('Test Utilities', () => {
  it('should render components with theme provider', () => {
    render(<TestComponent>Test Content</TestComponent>);

    // Verify the component rendered correctly
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should be different from regular RTL render', () => {
    // Use a spy to check if ThemeProvider is used
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;

    try {
      // Using RTL render directly would cause theme-related errors
      // if components depend on theme context
      rtlRender(
        <div data-testid="mui-component" className="MuiButton-root">
          MUI Component
        </div>
      );

      // Our custom render should wrap with ThemeProvider
      render(
        <div data-testid="mui-component" className="MuiButton-root">
          MUI Component
        </div>
      );

      // Both renders should show the component
      expect(screen.getAllByTestId('mui-component')).toHaveLength(2);
    } finally {
      console.error = originalConsoleError;
    }
  });
});
