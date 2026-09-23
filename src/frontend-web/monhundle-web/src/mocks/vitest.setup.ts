import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

 
// Intercepts `fetch` itself, so the real code path runs unmodified; only the network call is faked.
export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' })) // a test that triggers a real network call should fail loudly, not silently slip to the real network.
afterEach(() => server.resetHandlers()) // clean any server.use an individual test could define, avoid cross-test pollution
afterAll(() => server.close())
