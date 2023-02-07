//@ts-check
/// <reference types="cypress" />

import seguro from '../fixtures/seguro.json'
const { apolice, seguradora, data_emissao, vencimento, razaoSocial } = seguro

xdescribe('Seguros transactions', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully save insurance approval request', () => {
        cy.visit('/')
        cy.get('.MuiToolbar-dense > [href="/veiculos"]').click()
        cy.get('[href="/veiculos/seguros"] > .veiculosHome_card__image___Ethh').click()
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputBase-input').type(seguradora, { delay: 0 })
        cy.get(':nth-child(3) > .MuiInputBase-root > .MuiInputBase-input').type(apolice)
        cy.get(':nth-child(5) > .MuiInputBase-root > .MuiInputBase-input').type(data_emissao)
        cy.get(':nth-child(6) > .MuiInputBase-root > .MuiInputBase-input').type(vencimento)
        cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type('AAA-0000')
        cy.get('.spaceBetween > :nth-child(1) > .MuiButtonBase-root > .MuiButton-label').click()
        cy.get('[style="min-height: 60px;"] > .MuiButtonBase-root > .MuiButton-label')
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

describe('When a user updates data and vehicles from a specific insurance', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should save the demand for later approval', () => {
        cy.visit('/')
        cy.get('.MuiToolbar-dense > [href="/veiculos"]').click()
        cy.get('[href="/veiculos/seguros"] > .veiculosHome_card__image___Ethh').click()
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputBase-input').type(apolice)
        cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type('RUJ-1D82')
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