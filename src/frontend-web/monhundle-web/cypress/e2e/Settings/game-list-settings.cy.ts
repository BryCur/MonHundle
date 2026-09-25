// start as a returning player who already has a game list, straight on /settings - no need
// to replay the first-time selection flow, already covered by
// UnlimitedGames/select-and-start-unlimited-game.cy.ts.
describe('Changing the game list from Settings', () => {
    beforeEach(() => {
        cy.visit('/settings', {
            onBeforeLoad(win) {
                win.localStorage.setItem('gameList', JSON.stringify(['MHR']));
            },
        });
        cy.wait('@authUser');
    });

    it('routes back to settings after confirming a new selection', () => {
        cy.mockGameTitles(['MHWilds', 'MHR']);

        // "change games" button, second .setting-line on the page
        cy.get('.setting-line').eq(1).find('button').click();
        cy.location('pathname').should('eq', '/');
        cy.wait('@gameTitles');

        cy.selectGameAndConfirm(0); // MHWilds

        // SelectGamesView reads where we came from (window.history.state.back) and, since we came
        // from /settings, routes back there instead of defaulting to /unlimited.
        cy.location('pathname').should('eq', '/settings');
        cy.window()
            .its('localStorage')
            .invoke('getItem', 'gameList')
            .should('eq', JSON.stringify(['MHWilds']));
    });

    it('lets the accessibility preference be toggled', () => {
        cy.get('input[type="checkbox"]').should('not.be.checked');
        cy.get('input[type="checkbox"]').check();

        cy.window()
            .its('localStorage')
            .invoke('getItem', 'enableTableVisualA11y')
            .should('eq', 'true');
    });
});
