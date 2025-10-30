/// <reference types="cypress" />

describe('Login Test', () => {
  before(() => {
    cy.visit('localhost:3000')
    cy.contains('Log In').click()
    cy.contains('MetaMask').click()

    cy.visit('/')
  })

  it('is expected to display a sussess message', () => {
    cy.get('[data-cy=title]').should('contain.text', 'MetaMask Detected')
  })

  it('is expected to display the local wallet address', () => {
    cy.get('[data-cy=address').should('contain.text', 'Your address is: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
  })

  it('is expected to display the local wallet  balance', () => {
    cy.get('[data-cy=balance').should('contain.text', 'Balance: 10000000000000000000000')
  })
})
