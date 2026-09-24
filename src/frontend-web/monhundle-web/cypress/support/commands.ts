/// <reference types="cypress" />

import { FAKE_GAME_ID, DEFAULT_GAME_TITLES, DEFAULT_MONSTERS } from './testData';

// -- stubs for the calls almost every spec needs --

Cypress.Commands.add('mockAuth', (userId: string) => {
    cy.intercept('GET', '**/user/authenticate', {
        statusCode: 200,
        body: JSON.stringify(userId),
    }).as('authUser');
});

Cypress.Commands.add('mockGameTitles', (titles: string[] = DEFAULT_GAME_TITLES) => {
    cy.intercept('GET', '**/resources/game-titles', {
        statusCode: 200,
        body: titles,
    }).as('gameTitles');
});

Cypress.Commands.add('mockMonsterChoices', (monsters: string[] = DEFAULT_MONSTERS) => {
    cy.intercept('GET', '**/resources/monster-choices*', {
        statusCode: 200,
        body: monsters,
    }).as('monsterChoices');
});

// -- higher-level flows shared by several specs --

// Selects the game tile at `index` (order matches whatever mockGameTitles() was given) on the
// home screen and confirms the selection.
Cypress.Commands.add('selectGameAndConfirm', (index: number = 0) => {
    cy.get('.list-item').eq(index).click();
    cy.get('button.btn-confirm').click();
});

// Gets from a fresh visit to `/` all the way to a playable unlimited game screen: picks the
// first mocked game, confirms, and waits for the new game + monster list to load.
Cypress.Commands.add('startUnlimitedGame', () => {
    cy.mockGameTitles();
    cy.mockMonsterChoices();
    cy.intercept('POST', '**/game/unlimited/start', {
        statusCode: 200,
        body: JSON.stringify(FAKE_GAME_ID),
    }).as('startGame');

    cy.visit('/');
    cy.wait('@authUser');
    cy.wait('@gameTitles');
    cy.selectGameAndConfirm(0);

    cy.location('pathname').should('eq', '/unlimited');
    cy.wait('@startGame');
    cy.wait('@monsterChoices');
});

// Gets from a fresh visit to `/daily` all the way to a playable daily game screen.
Cypress.Commands.add('startDailyGame', () => {
    cy.mockMonsterChoices();
    cy.intercept('POST', '**/game/daily/start', {
        statusCode: 200,
        body: JSON.stringify(FAKE_GAME_ID),
    }).as('startDaily');

    cy.visit('/daily');
    cy.wait('@authUser');
    cy.wait('@startDaily');
    cy.wait('@monsterChoices');
});

// Opens the monster selector and picks the option whose code matches `monsterCode`. The option's
// <img alt="..."> carries the raw (untranslated) monster code, so this is locale-independent.
Cypress.Commands.add('pickMonster', (monsterCode: string) => {
    cy.get('.monster-select-toggle').click();
    cy.get(`.monster-option:has(img[alt="${monsterCode}"])`).click();
});

Cypress.Commands.add('sendGuess', (monsterCode: string) => {
    cy.pickMonster(monsterCode);
    // direct-child combinator: excludes MonsterSelectBox's own nested toggle button, which also
    // lives inside .option-selector-container.
    cy.get('.option-selector-container > button').click();
});

// Returns the cells of the most recent (first, since the list is rendered reversed) guess row,
// skipping the sticky column-header row. Mirrors the `getFirstRowDataCells` helper used in the
// GameGuessList Vitest tests: [0] monster, then classification, generation, weaknesses,
// afflictions, threatLevel, habitats.
Cypress.Commands.add('latestGuessRowCells', () => {
    return cy
        .get('.guess-container .guess-table-row')
        .not('.table-header')
        .first()
        .find('.guess-table-cell');
});

declare global {
    namespace Cypress {
        interface Chainable {
            mockAuth(userId: string): Chainable<void>;
            mockGameTitles(titles?: string[]): Chainable<void>;
            mockMonsterChoices(monsters?: string[]): Chainable<void>;
            selectGameAndConfirm(index?: number): Chainable<void>;
            startUnlimitedGame(): Chainable<void>;
            startDailyGame(): Chainable<void>;
            pickMonster(monsterCode: string): Chainable<void>;
            sendGuess(monsterCode: string): Chainable<void>;
            latestGuessRowCells(): Chainable<JQuery<HTMLElement>>;
        }
    }
}

export {};
