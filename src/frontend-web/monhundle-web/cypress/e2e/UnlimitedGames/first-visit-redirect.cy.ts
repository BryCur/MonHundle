// A first-time visitor (no game list saved yet) who lands directly on /unlimited should be sent
// back to the game-selection screen instead of seeing a broken game page.

describe('First-time visitor without a selected game list', () => {
  it('redirects /unlimited to the game-selection screen', () => {
    cy.mockGameTitles() // needed once redirected back to '/'

    cy.visit('/unlimited')
    cy.wait('@authUser')

    cy.location('pathname').should('eq', '/')
  })
})
