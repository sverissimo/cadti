//@ts-check
/// <reference types="cypress" />
import { razaoSocial, nomeSocio, cpfSocio, emailSocio, telSocio, share } from '../fixtures/addAltContratoInput.json'

describe('Remove Procuracao for selected empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully add procuracao', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.get('input[name=nomeSocio]:first').type(nomeSocio)
        cy.get('input[name=cpfSocio]:first').type(cpfSocio)
        cy.get('input[name=telSocio]:first').type(telSocio)
        cy.get('input[name=emailSocio]:first').type(emailSocio)
        cy.get('input[name=share]:first').type(share)
        cy.contains('Adicionar sócio').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        cy.approveDemand()
    })
})
