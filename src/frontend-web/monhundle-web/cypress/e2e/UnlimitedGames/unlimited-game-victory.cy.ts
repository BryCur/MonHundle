import { buildGuessResponse, FAKE_GAME_ID, GameModes, GameStates } from '@cypress-support/testData'

function winTheGame() {
  cy.startUnlimitedGame();

  cy.intercept('POST', '**/game/unlimited/guess', {
    statusCode: 200,
    body: buildGuessResponse('diablos', GameStates.Win),
  }).as('makeGuess');

  cy.sendGuess('diablos');
  cy.wait('@makeGuess');
}

describe('Winning an unlimited game', () => {
  it('shows the game-over screen instead of the guess controls', () => {
    winTheGame();

    cy.get('.option-game-over-container').should('exist');
    cy.get('.option-selector-container').should('not.exist');
  })

  it('lets the player start a new game from the game-over screen', () => {
    winTheGame();

    // "New Game" reuses the same POST /game/unlimited/start already stubbed by startUnlimitedGame()
    cy.get('.option-game-over-container button').eq(0).click();
    cy.wait('@startGame');

    cy.get('.option-selector-container').should('exist');
    cy.get('.option-game-over-container').should('not.exist');
  })

  it('copies a shareable result to the clipboard', () => {
    winTheGame();

    // headless Electron doesn't expose a real navigator.clipboard; define a fake one to spy on
    // instead of stubbing a property of an object that doesn't exist here.
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'clipboard', {
        value: { writeText: cy.stub().as('clipboardWrite') },
        configurable: true,
      })
    });

    cy.get('.option-game-over-container button').eq(1).click();

    cy.get('@clipboardWrite').should('have.been.calledOnce');
  })

  it('starts a brand new game when a page change/reload resumes an already-finished game', () => {
    winTheGame();

    // the cookie set while winning still points at that (now finished) game
    cy.intercept('GET', `**/game/unlimited/resume/${FAKE_GAME_ID}`, {
      statusCode: 200,
      body: {
        gameId: FAKE_GAME_ID,
        gameMode: GameModes.Unlimited,
        state: GameStates.Win, // the resumed game is already finished
        guesses: [],
      },
    }).as('resumeGame');

    cy.reload();
    cy.wait('@authUser');
    cy.wait('@resumeGame');

    // UnlimitedGameService.resumeGame() only reports success when the resumed game is still
    // ongoing - a finished one makes it return false, so the view transparently starts a fresh
    // game instead of showing the (already resolved) game-over screen for the old one.
    cy.wait('@startGame');
    cy.wait('@monsterChoices');

    cy.get('.option-selector-container').should('exist');
    cy.get('.option-game-over-container').should('not.exist');
  })
})
