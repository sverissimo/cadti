//@ts-check
/// <reference types="cypress" />
import { razaoSocial, telefone, numero, bairro } from './fixtures/altEmpresaInput.json'

describe('Update empresa data', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create updateEmpresa demand with changed data', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('input[name=telefone]:first').type(telefone)
        cy.get('input[name=numero]:first').type(numero)
        cy.get('input[name=bairro]:first').type(bairro)
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação')
            .click()
        //@ts-ignore
        //cy.approveDemand()
    })
})
