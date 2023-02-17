//@ts-check
/// <reference types="cypress" />
import empresaInputs from './fixtures/altEmpresaInput.json'
const {
    razaoSocial,
    razaoSocialEdit,
    inscricaoEstadual,
    telefone,
    cidade,
    numero,
    bairro,
} = empresaInputs[0]

describe('Update empresa data', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create updateEmpresa demand with changed data', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.get('input[name=telefone]').clear()
        cy.get('input[name=telefone]').type(telefone)
        /* cy.get('input[name=razaoSocialEdit]').clear()
        cy.get('input[name=razaoSocialEdit]').type(razaoSocialEdit, { delay: 0 }) */
        cy.get('input[name=inscricaoEstadual]').clear()
        cy.get('input[name=inscricaoEstadual]').type(inscricaoEstadual, { delay: 0 })
        cy.get('input[name=cidade]').clear()
        cy.get('input[name=cidade]').type(`{del}${cidade}`, { delay: 0 })
        cy.get('input[name=numero]').clear()
        cy.get('input[name=numero]').type(numero)
        cy.get('input[name=bairro]').clear()
        cy.get('input[name=bairro]').type(bairro, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        cy.approveDemand()
        /* cy.on('window:alert', (str) => {
            expect(str).to.equal(`Nenhuma modificação registrada!`)
        }) */
    })
})
