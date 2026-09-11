// First real Cypress spec, meant as a tour of the toolkit rather than exhaustive coverage:
// - cy.intercept() stubs every backend call (GET and POST) so this spec never needs a running
//   API or database.
// - cy.wait('@alias') waits for a specific intercepted request/response instead of guessing timing.
// - cy.get()/.click() drive the real rendered app in a real browser.
// - assertions cover the DOM, localStorage, the client-side route, and even the *content* of an
//   intercepted request (see the monsterChoices assertion below).
//
// Flow under test: pick a game on the home screen -> confirm -> land on the Unlimited game
// screen with the game started and the monster selector populated.

describe('Choosing a game and starting an unlimited run', () => {
  const GAME_TITLES = ['MHWilds', 'MHR']
  const MONSTER_LIST = ['rathalos', 'diablos']
  const FAKE_USER_ID = '11111111-1111-1111-1111-111111111111'
  const FAKE_GAME_ID = 'demo-game-id'

  beforeEach(() => {
    // the router's auth guard runs on every navigation; without this the app never
    // renders anything and gets redirected to /about instead.
    cy.intercept('GET', '**/user/authenticate', {
      statusCode: 200,
      body: JSON.stringify(FAKE_USER_ID),
    }).as('authUser')

    cy.intercept('GET', '**/resources/game-titles', {
      statusCode: 200,
      body: GAME_TITLES,
    }).as('gameTitles')

    cy.intercept('POST', '**/game/unlimited/start', {
      statusCode: 200,
      body: JSON.stringify(FAKE_GAME_ID),
    }).as('startGame')

    cy.intercept('GET', '**/resources/monster-choices*', {
      statusCode: 200,
      body: MONSTER_LIST,
    }).as('monsterChoices')
  })

  it('lets the player pick a game, confirm, and reach a playable unlimited game', () => {
    cy.visit('/')
    cy.wait('@authUser')
    cy.wait('@gameTitles')

    // one tile per game title in the stubbed response
    cy.get('.list-item').should('have.length', GAME_TITLES.length)

    // select the first tile (MHWilds) and confirm it's the one we think it is
    cy.get('.list-item').eq(0).find('img[alt="logo"]')
      .should('have.attr', 'src')
      .and('include', 'MHWilds')

    cy.get('.list-item').eq(0).click()
    cy.get('.list-item').eq(0).should('have.class', 'selected')

    cy.get('button.btn-confirm').click()

    // confirming persists only the selected game (not the full list) to localStorage
    cy.window().its('localStorage')
      .invoke('getItem', 'gameList')
      .should('eq', JSON.stringify(['MHWilds']))

    // ...and navigates to the unlimited game screen
    cy.location('pathname').should('eq', '/unlimited')

    // landing there starts a new game and loads monster choices for the selected game only
    cy.wait('@startGame')
    cy.wait('@monsterChoices').its('request.url').should('include', 'gameTitles=MHWilds')

    // the monster selector is rendered with the stubbed monster list
    cy.get('.monster-select-toggle').click()
    cy.get('.monster-option').should('have.length', MONSTER_LIST.length)
  })
})
