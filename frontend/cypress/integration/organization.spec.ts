/// <reference types="cypress" />
import { TOKEN } from './constants'

describe('Organization Test', () => {
  beforeEach(() => {
    window.localStorage.setItem('id_token', TOKEN)
  })

  it('Visit page organization', () => {
    cy.visit('localhost:3000/organization')
  })

  it('Can click create organization', () => {
    cy.contains('ADD ORGANIZATION').should('exist')
    cy.contains('ADD ORGANIZATION').click()
  })

  it('Should be disabled CREATE button when name or type organization have empty value', () => {
    cy.get('input[data-test-id="organization-name"]').clear()
    cy.get('button[data-test-id="create-save-button"]').should('be.disabled')
  })

  it('Should be show error message "The organization name must not exceed 200 characters." when oganization name length great 200', () => {
    cy.get('input[data-test-id="organization-name"]').type(
      'NFFMNnPTJhhslzKP7xWztCVgrkk0ylmOgsbrLXmesV3LrAUNyASJi6DP0jzTT9AseUfTgIliriMrPVORDzKTlgNxIWfx9AWTrU5eS5jf0oYR9LWM1baNF0nVR5PPk684reD3XOSECOET5KdvLP1ahSnpOj7E1g86CL0WVXWCgymr3LPvr9kO8n359YRoI8heVKSjZwoQ'
    )
    cy.get('p[data-test-id="error-name-message"]').should('be.visible')
    cy.get('input[data-test-id="organization-name"]').clear()
  })

  it('Should be non disbled CREATE button when name or type organization have value', () => {
    cy.get('input[data-test-id="organization-name"]').type('name test')
    cy.get('button[data-test-id="button-dao-type"]').click()
    // cy.get('button[data-test-id]="button-company-type"').click()

    cy.get('button[data-test-id="create-save-button"]').should('not.be.disabled')

    cy.get('input[data-test-id="organization-name"]').clear()
  })

  it('Can add new organization', () => {
    cy.get('input[data-test-id="organization-name"]').type('name test')
    cy.get('button[data-test-id="button-dao-type"]').click()
    // cy.get('button[data-test-id]="button-company-type"').click()

    cy.get('button[data-test-id="create-save-button"]').click()
  })
})
