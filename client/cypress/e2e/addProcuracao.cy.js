import { razaoSocial, nomeProcurador, cpfProcurador, emailProcurador, telProcurador, vencimento } from '../fixtures/addProcuracaoInput.json'

describe('Remove Procuracao for selected empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully add procuracao', () => {
        cy.visit('/empresas/procuradores')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('input[name=nomeProcurador0]').type(nomeProcurador)
        cy.get('input[name=cpfProcurador0]').type(cpfProcurador)
        cy.get('input[type=checkbox]').click()
        //cy.get('input[name=vencimento]').type(vencimento)
        /* cy.get('input[name=telProcurador0]').type(telProcurador)
        cy.get('input[name=emailProcurador0]').type(emailProcurador) */
        cy.get('[style="display: flex; justify-content: flex-end; width: 100%;"] > .MuiButtonBase-root > .MuiButton-label')
            .click()
        cy.approveDemand()
    })
})

