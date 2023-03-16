//@ts-check
/// <reference types="cypress" />
import altEmpresaInput from './fixtures/altEmpresaInput.json'
const { razaoSocial } = altEmpresaInput[1]
const numeroAlteracao = Math.round(Math.random() * 265).toString()

describe('Update empresa data', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create updateEmpresa demand with changed data', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.contains('Avançar').click()
        cy.get('input[name=numeroAlteracao]').type(numeroAlteracao)
        cy.get('input[name=numeroRegistro]').type(numeroAlteracao)
        cy.get('input[name=vencimentoContrato]').type('2025-03-19')
        cy.get('input[name=vencimentoContrato]').type('2023-03-15')
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        cy.approveDemand()
    })
})
