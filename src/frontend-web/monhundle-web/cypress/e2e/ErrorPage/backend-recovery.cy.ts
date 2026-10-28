// The whole "backend down, then back" chain in a real browser: a network failure while
// authenticating leads to the unavailable error page; Retry checks the server status first, stays
// put (with a notification) while it is down, then authenticates again and returns to the page
// the player was heading to once it is back.

import { FAKE_USER_ID } from '@cypress-support/testData';

describe('Recovering from an unavailable backend', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/user/authenticate', { forceNetworkError: true }).as('authDown');
    });

    it('shows the unavailable error page when the backend cannot be reached', () => {
        cy.visit('/daily');

        cy.location('pathname').should('eq', '/error');
        cy.location('search').should('eq', '?reason=unavailable&from=/daily');
        cy.get('.error-content-title').should('have.text', 'Server unavailable');
    });

    it('stays on the error page and warns the player while the server is still down', () => {
        cy.intercept('HEAD', '**/service/status', { statusCode: 503 }).as('statusDown');
        cy.visit('/daily');
        cy.location('pathname').should('eq', '/error');

        cy.contains('button', 'Retry').click();
        cy.wait('@statusDown');

        cy.location('pathname').should('eq', '/error');
        cy.get('.notification-canvas .notification-card')
            .should('have.length', 1)
            .and('have.class', 'notification-warning')
            .find('.notification-message')
            .should(
                'have.text',
                'The server is still unreachable. Please try again in a few moments.',
            );
    });

    it('authenticates again and returns to the original page once the server is back', () => {
        cy.intercept('HEAD', '**/service/status', { statusCode: 503 }).as('statusDown');
        cy.visit('/daily');
        cy.location('pathname').should('eq', '/error');
        cy.contains('button', 'Retry').click();
        cy.wait('@statusDown');

        // the backend is back: the most recently registered intercepts win
        cy.intercept('HEAD', '**/service/status', { statusCode: 200 }).as('statusUp');
        cy.mockAuth(FAKE_USER_ID);
        cy.mockMonsterChoices();
        cy.intercept('POST', '**/game/daily/start', {
            statusCode: 200,
            body: JSON.stringify('recovered-daily-game'),
        }).as('startDaily');

        cy.contains('button', 'Retry').click();
        cy.wait('@statusUp');
        cy.wait('@authUser');

        cy.location('pathname').should('eq', '/daily');
        cy.wait('@startDaily');
        cy.get('header').should('exist');
        cy.get('.monster-select-toggle').should('exist');
    });
});
