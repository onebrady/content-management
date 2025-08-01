# Testing Documentation

## Overview

This document provides an overview of the testing setup for the Content Development Flow project. It covers both unit testing with Jest and end-to-end testing with Playwright.

## Unit Testing

### Framework

- **Jest**: Main testing framework
- **React Testing Library**: For testing React components
- **Jest DOM**: For DOM testing assertions

### Configuration

- **Configuration File**: `jest.config.js`
- **Setup File**: `jest.setup.js`
- **Test Environment**: `jest-environment-jsdom`
- **Module Aliases**: Configured to match Next.js aliases (e.g., `@/components`)
- **Coverage Thresholds**: Temporarily set to 10% for statements/lines and 5% for branches/functions to allow incremental improvement

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm test -- path/to/test.ts

# Run tests for specific parts of the application
npm run test:component  # Components
npm run test:api        # API routes
npm run test:hooks      # React hooks
npm run test:lib        # Library functions
npm run test:utils      # Utility functions
```

### Test File Structure

- Tests are located next to the files they test in `__tests__` directories
- Test files follow the naming convention `*.test.ts` or `*.test.tsx`

### Mocks

The following mocks are set up in `jest.setup.js`:

- **Next.js Navigation**: `useRouter`, `usePathname`, etc.
- **NextAuth.js**: Authentication functions and hooks
- **Window APIs**: `matchMedia`, `ResizeObserver`, etc.
- **Fetch API**: Global fetch is mocked
- **Text Encoding**: `TextEncoder` and `TextDecoder` are polyfilled

### Component Testing

When testing components:

1. Use the custom `render` function from `@/utils/test-utils` which provides necessary providers
2. Mock external dependencies (e.g., API calls, context providers)
3. Test component rendering, user interactions, and state changes

Example:

```tsx
import { render, screen, fireEvent } from '@/utils/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

### API Route Testing

When testing API routes:

1. Mock Next.js server components (`NextRequest`, `NextResponse`)
2. Mock Prisma client functions
3. Mock authentication middleware
4. Test success and error scenarios

Example:

```tsx
// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
    })),
  },
}));

// Import after mocking
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../route';

describe('API Route', () => {
  it('should return data', async () => {
    const request = new NextRequest('http://localhost:3000/api/endpoint');
    const response = await GET(request);
    const data = await response.json();
    expect(data).toEqual(expect.objectContaining({ success: true }));
  });
});
```

### Hook Testing

When testing custom hooks:

1. Use `renderHook` from React Testing Library
2. Mock external dependencies
3. Test initial state, state changes, and side effects

Example:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(1);
  });
});
```

### Current Coverage

- **API Routes**: Good coverage for search, content, tags, and users APIs
- **Components**: Coverage for navigation, UI, and some content components
- **Hooks**: Good coverage for auth, search, and autosave hooks
- **Library Functions**: Partial coverage for core utilities

## End-to-End Testing

### Framework

- **Playwright**: For end-to-end testing
- **Configuration File**: `playwright.config.ts`
- **Test Directory**: `e2e/`

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# View test reports
npm run test:e2e:report
```

### Test Structure

E2E tests are organized by user journey or feature:

- `auth.spec.ts`: Authentication flows
- `user-journey.spec.ts`: Critical user journeys

### Best Practices

1. **Isolation**: Each test should be independent
2. **Setup/Teardown**: Use `test.beforeEach` and `test.afterEach` for setup and cleanup
3. **Selectors**: Use data-testid attributes for stable selectors
4. **Assertions**: Use Playwright's built-in assertions for reliability
5. **Screenshots**: Capture screenshots on failure for debugging

## Known Issues and Future Improvements

### Issues

1. **Component Tests**: Some component tests fail due to:
   - Missing mock implementations for complex components
   - Selector issues with Material UI components
   - Issues with rich text editor testing

2. **Coverage**: Overall coverage is low (around 11%) and needs improvement

### Future Improvements

1. **Fix Failing Tests**: Address issues in component tests
2. **Increase Coverage**: Add more tests for:
   - Core components
   - API routes
   - Utility functions
3. **Improve E2E Tests**: Add more user journey tests
4. **CI Integration**: Set up automated testing in CI pipeline

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
