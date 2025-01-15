import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http } from 'msw';

// Add custom jest matchers
expect.extend({
  // Add any custom matchers here
});

// Create MSW server instance
export const server = setupServer(
  // Add your API mocks here
  http.get('/api/schema', () => {
    return new Response(
      JSON.stringify({
        schema: {
          // Your mock schema here
        },
        version: '1.0.0'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
  vi.clearAllMocks();
  vi.resetModules();
});

// Reset timers after each test
afterEach(() => {
  vi.clearAllTimers();
});