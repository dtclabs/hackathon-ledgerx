/// <reference types="cypress" />

import { TOKEN, ORGANIZATION_ID } from './constants'

const longText =
  'oQlwSdDs8M80WFANsnYIdRvwXxtnKA2sGYdUlaZGXa88gFa7opBRIWTNUCeOEIBH4ZTGmY1vz19sHPAZ9Y9T7iXsvBn4McctMkMCgyzpOjvMbXOn1Py2JaVztLTVDATRIWMSN0Fofhle1zgBozn5HIB3SVWbYgESiYPcSM0eqYPNF7A8eb6LOUTvTeupCLZ4XygMzpkZA'

describe('Recipient Test', () => {
  beforeEach(() => {
    window.localStorage.setItem('id_token', TOKEN)
  })

  it('Visit page recipient', () => {
    cy.visit(`localhost:3000/${ORGANIZATION_ID}/recipients`)
  })

  describe('Create Group', () => {
    describe('UI Test', () => {
      it('Can click CREATE GROUP button', () => {
        cy.get('button[data-test-id="btn-add-groups"]').should('exist')
        cy.get('button[data-test-id="btn-add-groups"]').click()
      })

      it('Should show create group pop-up', () => {
        cy.contains('GROUPS').should('exist')
      })

      it('Should field text blank', () => {
        cy.get('input[data-test-id="group-name"]').should('have.value', '')
        cy.get('textarea[data-test-id="description"]').should('have.value', '')
      })

      it('Should default button: dimmed', () => {
        cy.get('button[data-test-id="btn-save-create"]').should('be.disabled')
      })
    })

    describe('Validate field', () => {
      it('Show error message: "Name is required"', () => {
        cy.get('input[data-test-id="group-name"]')
          .type('name')
          .clear()
          .then(() => cy.contains('Name is required').should('exist'))
      })

      it('Show error message: "Description is required"', () => {
        cy.get('input[data-test-id="description"]')
          .type('description')
          .clear()
          .then(() => cy.contains('Description is required').should('exist'))
      })

      it('Show error message:"Name dose not exceed 200 characters"', () => {
        cy.get('input[data-test-id="group-name"]').type(longText)
        cy.contains('Name dose not exceed 200 characters').should('exist')
      })

      it('Show error message: "Description dose not exceed 200 characters"', () => {
        cy.get('textarea[data-test-id="description"]').type(longText)
        cy.contains('Description dose not exceed 200 characters').should('exist')
      })
    })

    describe('Add Group Test', () => {
      it('Check "Add Group" successfully when inputting valid value fields', () => {
        cy.get('input[data-test-id="group-name"]').type('{selectAll}{backspace}Name Test new1s')
        cy.get('textarea[data-test-id="description"]').type('{selectAll}{backspace}Description Test1s')

        cy.get('button[data-test-id="btn-save-create"]').click()
        cy.wait(1000)
        cy.contains('Create Group successfully').should('exist')

        cy.contains('Okay').click()
      })
    })
  })

  describe('Create Recipient', () => {
    describe('UI Test', () => {
      it('Should show create recipient pop-up', () => {
        cy.contains('ADD RECIPIENTS').click()
        cy.contains('Add single').click()
        cy.contains('ADD RECIPIENTS').should('exist')
      })

      it('Should field text blank', () => {
        cy.get('input[data-cy="first-name"]').should('have.value', '')
        cy.get('input[data-cy="last-name"]').should('have.value', '')
        cy.get('input[data-cy="wallet-address"]').should('have.value', '')
      })

      it('Should default button: dimmed', () => {
        cy.get('button[data-cy="btn-add-recipient"]').should('be.disabled')
      })
    })

    describe('Validate field', () => {
      it('Should show error message: "The First name is required."', () => {
        cy.get('input[data-cy="first-name"]')
          .type('text')
          .clear()
          .then(() => cy.contains('The First name is required.').should('exist'))
      })

      it('Should show error message: "The Last name is required."', () => {
        cy.get('input[data-cy="last-name"]')
          .type('text')
          .clear()
          .then(() => cy.contains('The Last name is required.').should('exist'))
      })

      it('Should show error message: "Address is required."', () => {
        cy.get('input[data-cy="wallet-address"]')
          .type('text')
          .clear()
          .then(() => cy.contains('Address is required.').should('exist'))
      })

      it('Should show error message:"The First name must not exceed 200 characters"', () => {
        cy.get('input[data-cy="first-name"]').type(longText)
        cy.contains('The First name must not exceed 200 characters').should('exist')
      })

      it('Should show error message:"The Last name must not exceed 200 characters"', () => {
        cy.get('input[data-cy="last-name"]').type(longText)
        cy.contains('The Last name must not exceed 200 characters').should('exist')
      })

      it('Should show error message: "This address is invalid"', () => {
        cy.get('input[data-cy="wallet-address"]').type('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
        cy.contains('This address is invalid').should('exist')
      })
    })

    describe('Add Recipient Test', () => {
      it('Should show "Create recipient successfully" when inputting valid value fields', () => {
        cy.get('input[data-cy="first-name"]').type('{selectAll}{backspace}First name test')
        cy.get('input[data-cy="last-name"]').type('{selectAll}{backspace}Last name test')
        cy.get('input[data-cy="wallet-address"]').type(
          '{selectAll}{backspace}0x217d99F6DDb7848c0cD3F8A2F0d61639F4bbB64B'
        )
        cy.get('#group-button')
          .click()
          .then(() => {
            cy.contains('Select all').click()
          })

        cy.get('button[data-cy="btn-add-recipient"]').click()
        cy.wait(1000)
        cy.contains('Create Recipient successfully').should('exist')
        cy.contains('Okay').click()
      })

      // it('Should show "Address Is Already Exist" when wallet address exited', () => {
      //   cy.get('input[data-cy="first-name"]').type('{selectAll}{backspace}First name test')
      //   cy.get('input[data-cy="last-name"]').type('{selectAll}{backspace}Last name test')
      //   cy.get('input[data-cy="wallet-address"]').type(
      //     '{selectAll}{backspace}0x217d99F6DDb7848c0cD3F8A2F0d61639F4bbB64B'
      //   )

      //   cy.get('button[data-cy="btn-add-recipient"]').click()
      //   cy.wait(1000)
      //   cy.contains('Address Is Already Exist').should('exist')
      // })
    })
  })
})
