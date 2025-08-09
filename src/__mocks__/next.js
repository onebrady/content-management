// Mock for Next.js server utilities
module.exports = {
  headers: jest.fn(
    () =>
      new Map([
        ['authorization', 'Bearer mock-token'],
        ['cookie', 'mock-session-cookie'],
      ])
  ),
  cookies: jest.fn(() => ({
    get: jest.fn(() => 'mock-session-cookie'),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  redirect: jest.fn(),
  notFound: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options = {}) => ({
      status: options.status ?? 200,
      ok: (options.status ?? 200) >= 200 && (options.status ?? 200) < 300,
      headers: options.headers ?? {},
      json: async () => data,
      text: async () => JSON.stringify(data),
    })),
    redirect: jest.fn(),
    next: jest.fn(),
  },
};
