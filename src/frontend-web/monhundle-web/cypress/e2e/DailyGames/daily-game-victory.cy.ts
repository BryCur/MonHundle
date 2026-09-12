import { buildGuessResponse, GameStates } from '../../support/testData'

function winTheDailyChallenge() {
  cy.startDailyGame()

  cy.intercept('POST', '**/game/daily/guess', {
    statusCode: 200,
    body: buildGuessResponse('diablos', GameStates.Win),
  }).as('makeGuess')

  cy.sendGuess('diablos')
  cy.wait('@makeGuess')
}

describe('Winning the daily challenge', () => {
  it('shows the game-over screen with only a share button, no restart', () => {
    winTheDailyChallenge()

    cy.get('.option-game-over-container').should('exist')
    cy.get('.option-selector-container').should('not.exist')
    // unlike Unlimited, a finished daily challenge cannot be replayed - no "New Game" button
    cy.get('.option-game-over-container button').should('have.length', 1)
  })

  it('copies a shareable result to the clipboard', () => {
    winTheDailyChallenge()

    // headless Electron doesn't expose a real navigator.clipboard; define a fake one to spy on
    // instead of stubbing a property of an object that doesn't exist here.
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'clipboard', {
        value: { writeText: cy.stub().as('clipboardWrite') },
        configurable: true,
      })
    })

    cy.get('.option-game-over-container button').eq(0).click()

    cy.get('@clipboardWrite').should('have.been.calledOnce')
  })
})
