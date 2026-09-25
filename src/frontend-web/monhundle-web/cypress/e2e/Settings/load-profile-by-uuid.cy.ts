// SettingView.loadUuid() swaps the locally stored identity and preferences for those of another
// player. Flagged earlier as a data-loss risk (it overwrites localStorage/cookies) and better
// suited to a real end-to-end check than more service-level mocking.

const TARGET_UUID = '22222222-2222-2222-2222-222222222222';

describe('Loading a profile by UUID', () => {
    it('overwrites the local game list, accessibility preference, and game cookies', () => {
        cy.intercept('GET', '**/user/validate*', { statusCode: 200 }).as('validateUser');
        cy.intercept('GET', '**/user/load*', {
            statusCode: 200,
            body: JSON.stringify(TARGET_UUID),
        }).as('loadUser');
        cy.intercept('GET', `**/user/profile/${TARGET_UUID}`, {
            statusCode: 200,
            body: {
                enableTableVisualAid: true,
                gameList: ['MHWilds'],
                currentDailyGameUuid: 'daily-1',
                currentUnlimitedGameUuid: 'unlimited-1',
            },
        }).as('getProfile');

        cy.visit('/settings', {
            onBeforeLoad(win) {
                win.localStorage.setItem('gameList', JSON.stringify(['MHR']));
            },
        });
        cy.wait('@authUser');

        cy.get('.composed-field input[type="text"]').type(TARGET_UUID);
        cy.get('.composed-field button').click();

        cy.wait('@validateUser');
        cy.wait('@loadUser');
        cy.wait('@getProfile');

        // loadUuid() reloads the page once the swap is done; re-stub auth for that reload
        cy.wait('@authUser');

        cy.window()
            .its('localStorage')
            .invoke('getItem', 'gameList')
            .should('eq', JSON.stringify(['MHWilds']));
        cy.window()
            .its('localStorage')
            .invoke('getItem', 'enableTableVisualA11y')
            .should('eq', 'true');
        cy.getCookie('currentDailyGame').its('value').should('eq', 'daily-1');
        cy.getCookie('currentUnlimitedGame').its('value').should('eq', 'unlimited-1');
    });
});
