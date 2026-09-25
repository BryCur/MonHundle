// pick a game on the home screen -> confirm -> land on the Unlimited game
// screen with the game started and the monster selector populated.

import { DEFAULT_GAME_TITLES, DEFAULT_MONSTERS, FAKE_GAME_ID } from '@cypress-support/testData';

describe('Choosing a game and starting an unlimited run', () => {
    beforeEach(() => {
        cy.mockGameTitles();
        cy.mockMonsterChoices();
        cy.intercept('POST', '**/game/unlimited/start', {
            statusCode: 200,
            body: JSON.stringify(FAKE_GAME_ID),
        }).as('startGame');
    });

    it('lets the player pick a game, confirm, and reach a playable unlimited game', () => {
        cy.visit('/');
        cy.wait('@authUser');
        cy.wait('@gameTitles');

        // one tile per game title in the stubbed response
        cy.get('.list-item').should('have.length', DEFAULT_GAME_TITLES.length);

        // select the first tile (MHWilds) and confirm it's the one we think it is
        cy.get('.list-item')
            .eq(0)
            .find('img[alt="logo"]')
            .should('have.attr', 'src')
            .and('include', 'MHWilds');

        cy.get('.list-item').eq(0).click();
        cy.get('.list-item').eq(0).should('have.class', 'selected');

        cy.get('button.btn-confirm').click();

        // confirming persists only the selected game (not the full list) to localStorage
        cy.window()
            .its('localStorage')
            .invoke('getItem', 'gameList')
            .should('eq', JSON.stringify(['MHWilds']));

        // ...and navigates to the unlimited game screen
        cy.location('pathname').should('eq', '/unlimited');

        // landing there starts a new game and loads monster choices for the selected game only
        cy.wait('@startGame');
        cy.wait('@monsterChoices').its('request.url').should('include', 'gameTitles=MHWilds');

        // the monster selector is rendered with the stubbed monster list
        cy.get('.monster-select-toggle').click();
        cy.get('.monster-option').should('have.length', DEFAULT_MONSTERS.length);
    });
});
