// the theme is applied through <html data-theme>: first by the inline script of index.html (before
// the first paint), then kept in sync by the app. /about is used as it needs no backend data.
// With a single registered theme, picking another one from Settings can't be tested yet.

const DEFAULT_THEME = 'classic-dark';
const DEFAULT_BACKGROUND = 'rgb(63, 37, 2)'; // --palette-brown-900 of classic-dark

function visitWithStoredTheme(theme: string) {
    cy.visit('/about', {
        onBeforeLoad(win) {
            win.localStorage.setItem('monhundle_settings', JSON.stringify({ version: 1, theme }));
        },
    });
}

describe('Theme', () => {
    it('applies the default theme on a first visit', () => {
        cy.visit('/about');

        cy.get('html').should('have.attr', 'data-theme', DEFAULT_THEME);
        cy.get('body').should('have.css', 'background-color', DEFAULT_BACKGROUND);
    });

    it('applies the stored theme before the app starts', () => {
        // the app never starts: only the inline script of index.html can set the attribute.
        // An id the app doesn't know is used, as the app would replace it with the default one.
        cy.intercept('GET', '**/src/main.ts*', { statusCode: 404 }).as('appBundle');

        visitWithStoredTheme('some-future-theme');

        cy.wait('@appBundle');
        cy.get('html').should('have.attr', 'data-theme', 'some-future-theme');
    });

    it('falls back to the default theme for an unknown stored theme once the app starts', () => {
        visitWithStoredTheme('some-future-theme');

        cy.get('html').should('have.attr', 'data-theme', DEFAULT_THEME);
        cy.get('body').should('have.css', 'background-color', DEFAULT_BACKGROUND);
    });
});
