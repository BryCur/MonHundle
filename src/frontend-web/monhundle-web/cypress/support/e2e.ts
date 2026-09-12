import './commands'
import { FAKE_USER_ID } from './testData'

// The router's auth guard runs on every navigation in every spec, so stub it globally instead of
// repeating it per spec. A spec that needs to exercise a *failing* auth (see auth-redirect.cy.ts)
// registers its own cy.intercept() for the same route right before visiting — Cypress matches new
// requests against the most recently registered intercept first, so the spec-level one wins.
beforeEach(() => {
  cy.mockAuth(FAKE_USER_ID)
})
