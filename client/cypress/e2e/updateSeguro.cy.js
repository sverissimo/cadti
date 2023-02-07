//@ts-check
/// <reference types="cypress" />

import seguroUpdate from '../fixtures/seguroUpdate.json'
const { apolice, seguradora, razaoSocial, data_emissao, vencimento } = seguroUpdate

describe('When a user updates data and vehicles from a specific insurance', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })

    it('Should save the demand for later approval', () => {
        cy.visit('/veiculos/seguros')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('[name=apolice]').type(apolice)
        cy.get('[name=dataEmissao]').type(data_emissao)
        cy.get('[name=vencimento]').type(vencimento)
        cy.get('[name=addedPlaca]').type('RUJ-1D82')
        cy.contains('Adicionar').click()
        cy.get(':nth-child(1) > .MuiChip-root > .MuiChip-deleteIcon').click()
        cy.contains('Salvar').click()
    })

    it('Should select the right demand and approve the insurance', () => {
        cy.visit('/solicitacoes')
        cy.get('.MuiTableCell-paddingNone > div > :nth-child(2) > .MuiIconButton-label > .material-icons')
            .last()
            .click()
        cy.get('[style="display: flex; width: 100%;"] > div > .MuiButton-containedPrimary > .MuiButton-label')
            .click()
    })
})