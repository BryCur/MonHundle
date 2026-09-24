import { buildGuessResponse, ComparisonResults, GameStates } from '@cypress-support/testData';

// Ensure an ongoing game can make guesses. And guesses are correctly added to the table
describe('Making a guess in an unlimited game', () => {
    it('adds the guess to the table with the result of each criterion', () => {
        cy.startUnlimitedGame();

        cy.intercept('POST', '**/game/unlimited/guess', {
            statusCode: 200,
            body: buildGuessResponse('diablos', GameStates.Ongoing, {
                classification: ComparisonResults.Incorrect,
                generation: ComparisonResults.Higher,
                weaknesses: ComparisonResults.Partial,
                afflictions: ComparisonResults.Incorrect,
                threatLevel: ComparisonResults.Lower,
                habitats: ComparisonResults.Correct,
            }),
        }).as('makeGuess');

        cy.sendGuess('diablos');
        cy.wait('@makeGuess');

        // the guess table now should have the header row + exactly one guess row
        cy.get('.guess-container .guess-table-row').should('have.length', 2);

        cy.latestGuessRowCells().eq(1).should('have.class', 'result-incorrect'); // classification
        cy.latestGuessRowCells().eq(2).should('have.class', 'result-higher'); // generation
        cy.latestGuessRowCells().eq(3).should('have.class', 'result-partial'); // weaknesses
        cy.latestGuessRowCells().eq(4).should('have.class', 'result-incorrect'); // afflictions
        cy.latestGuessRowCells().eq(5).should('have.class', 'result-lower'); // threatLevel
        cy.latestGuessRowCells().eq(6).should('have.class', 'result-correct'); // habitats

        // the game stays open on an ongoing guess
        cy.get('.option-selector-container').should('exist');
        cy.get('.option-game-over-container').should('not.exist');
    });
});
