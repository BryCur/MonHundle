// A failed authentication blocks every page that needs the backend: the router guard sends the
// player to the error page instead, carrying the reason and the page they were heading to.

describe('Error page on a failed authentication', () => {
    it('shows the critical error page when the backend refuses the authentication', () => {
        cy.intercept('GET', '**/user/authenticate', { statusCode: 500 }).as('authUser');

        cy.visit('/settings');

        cy.location('pathname').should('eq', '/error');
        cy.location('search').should('eq', '?reason=critical&from=/settings');
        cy.get('.error-content-title').should('have.text', 'Something went wrong');
        cy.contains('button', 'Retry').should('exist');
        cy.contains('button', 'Back to home').should('exist');
    });

    it('hides the navigation header but keeps the footer on the error page', () => {
        cy.intercept('GET', '**/user/authenticate', { statusCode: 500 }).as('authUser');

        cy.visit('/settings');

        cy.location('pathname').should('eq', '/error');
        cy.get('header').should('not.exist');
        cy.get('footer').should('exist');
    });

    it('still lets the player read /about, which does not need the backend', () => {
        cy.intercept('GET', '**/user/authenticate', { statusCode: 500 }).as('authUser');

        cy.visit('/about');

        cy.location('pathname').should('eq', '/about');
        cy.get('h1').should('have.text', 'About');
    });
});
