/// <reference types="cypress" />

describe('Login Test', () => {
  before(() => {
    (cy as any).setupMetamask();
    cy.visit('localhost:3000/lite')
    cy.contains('Connect Wallet').click();
  })

  it('is expected to display a sussess message', () => {
    cy.get('[data-cy=select-wallet]').should('contain.text', 'Select wallet')
  })

  it('is expected to display the local wallet address', () => {
    cy.get('[data-cy=source').should('contain.value', 'Metamask')
  })

  it('is expected to display the connect safe', () => {
    cy.get('[data-cy=connect-safe').should('contain.text', 'Connect safe?')
  })
})
