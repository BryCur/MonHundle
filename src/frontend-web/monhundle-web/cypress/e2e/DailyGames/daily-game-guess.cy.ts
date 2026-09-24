import { buildGuessResponse, ComparisonResults, GameStates } from '@cypress-support/testData'

describe('Making a guess in the daily challenge', () => {
  it('adds the guess to the table with the result of each criterion', () => {
    cy.startDailyGame()

    cy.intercept('POST', '**/game/daily/guess', {
      statusCode: 200,
      body: buildGuessResponse('diablos', GameStates.Ongoing, {
        classification: ComparisonResults.Correct,
        generation: ComparisonResults.Lower,
        weaknesses: ComparisonResults.Incorrect,
        afflictions: ComparisonResults.Partial,
        threatLevel: ComparisonResults.Higher,
        habitats: ComparisonResults.Incorrect,
      }),
    }).as('makeGuess')

    cy.sendGuess('diablos')
    cy.wait('@makeGuess')

    // the guess table now has the header row + exactly one guess row
    cy.get('.guess-container .guess-table-row').should('have.length', 2)

    cy.latestGuessRowCells().eq(1).should('have.class', 'result-correct') // classification
    cy.latestGuessRowCells().eq(2).should('have.class', 'result-lower') // generation
    cy.latestGuessRowCells().eq(3).should('have.class', 'result-incorrect') // weaknesses
    cy.latestGuessRowCells().eq(4).should('have.class', 'result-partial') // afflictions
    cy.latestGuessRowCells().eq(5).should('have.class', 'result-higher') // threatLevel
    cy.latestGuessRowCells().eq(6).should('have.class', 'result-incorrect') // habitats

    // the challenge stays open on an ongoing guess
    cy.get('.option-selector-container').should('exist')
    cy.get('.option-game-over-container').should('not.exist')
  })
})
