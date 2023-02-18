//@ts-check
/// <reference types="cypress" />
import { razaoSocial, nomeSocio, cpfSocio, emailSocio, telSocio, share } from './fixtures/addSocioInput.json'

describe('Remove Socio for selected empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully remove socio from empresa', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.get('section.flex.center.paper > div:first > button.MuiButton-textSecondary').click()

        cy.contains('Avançar').click()
        /* cy.contains('Enviar solicitação').click()
         //@ts-ignore
         cy.approveDemand() */
    })
})
