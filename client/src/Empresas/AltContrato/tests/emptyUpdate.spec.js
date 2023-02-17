//@ts-check
/// <reference types="cypress" />
import { razaoSocial, razaoSocialEdit, inscricaoEstadual, telefone, cidade, numero, bairro } from './fixtures/altEmpresaInput.json'

describe('Update empresa data', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create updateEmpresa demand with changed data', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('input[name=razaoSocialEdit]').clear()
        cy.get('input[name=razaoSocialEdit]').type(razaoSocial, { delay: 0 })
        cy.get('input[name=inscricaoEstadual]').clear()
        cy.get('input[name=inscricaoEstadual]').type(inscricaoEstadual, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()

        cy.on('window:alert', (str) => {
            expect(str).to.equal(`Nenhuma modificação registrada!`)
        })
    })
})
