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
        cy.get('section.flex.center.paper > div:last > button.MuiButton-textSecondary').click()

        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        cy.approveDemand()
    })
})
