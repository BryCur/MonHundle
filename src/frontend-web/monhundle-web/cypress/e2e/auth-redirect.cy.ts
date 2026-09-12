
describe('Auth guard redirects on failed authentication', () => {
  it('redirects to /about when authentication fails and the target is not /about', () => {
    cy.intercept('GET', '**/user/authenticate', { statusCode: 500 }).as('authUser')

    cy.visit('/settings')

    cy.location('pathname').should('eq', '/about')
    cy.get('h1').should('have.text', 'About')
  })

  it('still allows navigation to /about when authentication fails', () => {
    cy.intercept('GET', '**/user/authenticate', { statusCode: 500 }).as('authUser')

    cy.visit('/about')

    cy.location('pathname').should('eq', '/about')
    cy.get('h1').should('have.text', 'About')
  })
})
