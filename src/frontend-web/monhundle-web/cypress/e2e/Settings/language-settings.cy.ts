import { FAKE_USER_ID } from '@cypress-support/testData';

// the interface language: detected from the browser on a first visit, then picked from Settings.
// navigator.languages is stubbed so that the result doesn't depend on the browser running the tests.
describe('Interface language', () => {
    function visitSettings(browserLanguages: string[]) {
        cy.visit('/settings', {
            onBeforeLoad(win) {
                win.localStorage.setItem('user_id', FAKE_USER_ID);
                Object.defineProperty(win.navigator, 'languages', { value: browserLanguages });
            },
        });
        cy.wait('@authUser');
    }

    it('follows the browser language on a first visit', () => {
        visitSettings(['fr-CH', 'en']);

        cy.get('html').should('have.attr', 'lang', 'fr');
        cy.get('h2').first().should('have.text', 'Préférences');
        cy.get('#language-select').should('have.value', 'fr');
    });

    it('translates the interface when another language is picked, and keeps it after a reload', () => {
        visitSettings(['en']);
        cy.get('h2').first().should('have.text', 'Preferences');

        cy.get('#language-select').select('Français');

        cy.get('html').should('have.attr', 'lang', 'fr');
        cy.get('h2').first().should('have.text', 'Préférences');
        cy.shouldHaveStoredSetting('language', 'fr');

        // the browser still says english: the explicit choice wins
        cy.reload();
        cy.wait('@authUser');
        cy.get('h2').first().should('have.text', 'Préférences');
        cy.get('#language-select').should('have.value', 'fr');
    });
});
