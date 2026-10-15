// End-to-end path of the notification system in the real app: an error raised anywhere reaches
// one of the global error handler's gates (main.ts), is converted into a notification and shown
// by the canvas mounted in App.vue, with the real translations. The components' behaviour
// (timers, pause, limits) is covered by their unit tests.

import { FAKE_GAME_ID } from '@cypress-support/testData';

// A failed game-list load saves "all games" and leaves for the unlimited game, which then starts a
// game and loads the monsters: stub those calls so the only failure is the one under test.
function failGameTitlesLoad() {
    cy.intercept('GET', '**/resources/game-titles', { statusCode: 500 }).as('gameTitles');
    cy.mockMonsterChoices();
    cy.intercept('POST', '**/game/unlimited/start', {
        statusCode: 200,
        body: JSON.stringify(FAKE_GAME_ID),
    }).as('startGame');
}

describe('Notifications', () => {
    it('notifies the player when the game list cannot be loaded', () => {
        failGameTitlesLoad();

        cy.visit('/');
        cy.wait('@authUser');
        cy.wait('@gameTitles');

        // the notification lives outside the routed views: it survives the redirect
        cy.location('pathname').should('eq', '/unlimited');
        cy.get('.notification-canvas .notification-card')
            .should('have.length', 1)
            .and('have.class', 'notification-error')
            .find('.notification-message')
            .should(
                'have.text',
                'Failed to fetch the game title list. Refresh or try again later.',
            );
    });

    it('removes a notification when its close button is clicked', () => {
        failGameTitlesLoad();

        cy.visit('/');
        cy.wait('@gameTitles');
        cy.get('.notification-canvas .notification-card').should('have.length', 1);

        cy.get('.notification-canvas .notification-button-dismiss').click();

        cy.get('.notification-canvas .notification-card').should('not.exist');
    });

    it('shows the generic message for an error nobody handled', () => {
        // the rejection below is meant to stay unhandled: keep Cypress from failing the test on it
        cy.on('uncaught:exception', (error) => !error.message.includes('unhandled on purpose'));

        cy.visit('/about');
        cy.wait('@authUser');

        cy.window().then((win) => {
            // created in the app's window, so the app's unhandledrejection listener sees it
            void win.Promise.reject(new win.Error('unhandled on purpose'));
        });

        cy.get('.notification-canvas .notification-card')
            .should('have.length', 1)
            .and('have.class', 'notification-error')
            .find('.notification-message')
            .should('have.text', 'An unexpected error occurred. Refresh or try again later.');
    });
});
