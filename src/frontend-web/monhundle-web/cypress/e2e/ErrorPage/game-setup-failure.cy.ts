// A game page that cannot set its game up (here: the backend refuses to start the daily game)
// leaves for the error page instead of staying stuck on its loading state.

describe('Error page on a failed game setup', () => {
    it('shows the critical error page when the daily game cannot be started', () => {
        cy.mockMonsterChoices();
        cy.intercept('POST', '**/game/daily/start', { statusCode: 500 }).as('startDaily');

        cy.visit('/daily');
        cy.wait('@startDaily');

        cy.location('pathname').should('eq', '/error');
        cy.location('search').should('eq', '?reason=critical&from=/daily');
        cy.get('.error-content-title').should('have.text', 'Something went wrong');
    });

    it('goes back to the daily game when retrying once the backend accepts to start it', () => {
        cy.mockMonsterChoices();
        cy.intercept('POST', '**/game/daily/start', { statusCode: 500 }).as('startDailyDown');
        cy.visit('/daily');
        cy.location('pathname').should('eq', '/error');

        cy.intercept('POST', '**/game/daily/start', {
            statusCode: 200,
            body: JSON.stringify('retried-daily-game'),
        }).as('startDaily');
        cy.contains('button', 'Retry').click();
        cy.wait('@startDaily');

        cy.location('pathname').should('eq', '/daily');
        cy.get('.monster-select-toggle').should('exist');
    });
});
