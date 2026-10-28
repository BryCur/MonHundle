// SettingView.loadUuid() swaps the locally stored identity and preferences for those of another
// player. Flagged earlier as a data-loss risk (it overwrites localStorage/cookies) and better
// suited to a real end-to-end check than more service-level mocking.

const TARGET_UUID = '22222222-2222-2222-2222-222222222222';

describe('Loading a profile by UUID', () => {
    function visitSettings() {
        cy.visit('/settings', {
            onBeforeLoad(win) {
                win.localStorage.setItem('gameList', JSON.stringify(['MHR']));
            },
        });
        cy.wait('@authUser');
    }

    function loadUuid(uuid: string) {
        cy.get('.composed-field input[type="text"]').type(uuid);
        cy.get('.composed-field button').click();
    }

    it('overwrites the local game list, accessibility preference, and game cookies', () => {
        cy.intercept('GET', `**/user/profile/${TARGET_UUID}`, {
            statusCode: 200,
            body: {
                enableTableVisualAid: true,
                gameList: ['MHWilds'],
                currentDailyGameUuid: 'daily-1',
                currentUnlimitedGameUuid: 'unlimited-1',
            },
        }).as('getProfile');
        cy.intercept('GET', '**/user/load*', {
            statusCode: 200,
            body: JSON.stringify(TARGET_UUID),
        }).as('loadUser');

        visitSettings();
        loadUuid(TARGET_UUID);

        // the profile is fetched before the identity is switched
        cy.wait('@getProfile');
        cy.wait('@loadUser');

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

    it('warns about an unknown UUID and keeps the local data', () => {
        cy.intercept('GET', `**/user/profile/${TARGET_UUID}`, { statusCode: 404 }).as('getProfile');
        cy.intercept('GET', '**/user/load*', { statusCode: 200 }).as('loadUser');

        visitSettings();
        loadUuid(TARGET_UUID);
        cy.wait('@getProfile');

        cy.get('.notification-canvas .notification-card')
            .should('have.length', 1)
            .and('have.class', 'notification-warning')
            .find('.notification-message')
            .should('have.text', 'No profile found with this identifier.');
        cy.get('@loadUser.all').should('have.length', 0);
        cy.window()
            .its('localStorage')
            .invoke('getItem', 'gameList')
            .should('eq', JSON.stringify(['MHR']));
    });

    it('shows an error under the field for a malformed UUID, cleared once the player edits it', () => {
        cy.intercept('GET', '**/user/profile/*').as('getProfile');

        visitSettings();
        loadUuid('not-a-uuid');

        cy.get('.field-error')
            .should('be.visible')
            .and(
                'have.text',
                'Identifier must follow the UUID format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.',
            );
        cy.get('.composed-field input[type="text"]').should('have.attr', 'aria-invalid', 'true');
        cy.get('@getProfile.all').should('have.length', 0);

        cy.get('.composed-field input[type="text"]').type('x');
        cy.get('.field-error').should('not.exist');
    });
});
