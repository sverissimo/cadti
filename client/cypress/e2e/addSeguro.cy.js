//@ts-check
/// <reference types="cypress" />

import seguro from '../fixtures/seguro.json'
const { apolice, seguradora, data_emissao, vencimento, razaoSocial } = seguro

describe('Seguros transactions', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully save insurance approval request', () => {
        /* cy.visit('/')
        cy.get('.MuiToolbar-dense > [href="/veiculos"]').click()
        cy.get('[href="/veiculos/seguros"] > .veiculosHome_card__image___Ethh').click() */
        cy.visit('/veiculos/seguros')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('[name=seguradora]').type(seguradora, { delay: 0 })
        cy.get('[name=apolice]').type(apolice)
        cy.get('[name=dataEmissao]').type(data_emissao)
        cy.get('[name=vencimento]').type(vencimento)
        cy.get('[name=addedPlaca]').type('AAA-0000')
        cy.contains('Adicionar').click()
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
