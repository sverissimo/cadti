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
        /* cy.get('input[name=razaoSocialEdit]:first').clear()
        cy.get('input[name=razaoSocialEdit]:first').type(razaoSocialEdit, { delay: 0 }) */
        cy.get('input[name=inscricaoEstadual]:first').clear()
        cy.get('input[name=inscricaoEstadual]:first').type(inscricaoEstadual, { delay: 0 })
        cy.get('input[name=telefone]:first').clear()
        cy.get('input[name=telefone]:first').type(telefone)
        cy.get('input[name=cidade]:first').clear()
        cy.get('input[name=cidade]:first').type(`{del}${cidade}`, { delay: 0 })
        /* cy.get('input[name=numero]:first').clear()
        cy.get('input[name=numero]:first').type(numero) */
        cy.get('input[name=bairro]:first').clear()
        cy.get('input[name=bairro]:first').type(bairro, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        cy.approveDemand()
    })
})
