//@ts-check
/// <reference types="cypress" />
import altEmpresaInput from './fixtures/altEmpresaInput.json'
const { razaoSocial } = altEmpresaInput[1]

const filesFolder = './src/Empresas/AltContrato/tests/fixtures'

describe('Update empresa data', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create updateEmpresa demand with changed data', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.contains('Avançar').click()
        cy.get('input[name=numeroAlteracao]').type('22')
        cy.get('input[name=vencimentoContrato]').type('2021-10-29')
        cy.get('input[type=file]:first').selectFile(`${filesFolder}/addSocioInput.json`, { force: true })
        cy.get('input[type=file]').eq(1).selectFile(`${filesFolder}/altEmpresaInput.json`, { force: true })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()
        //@ts-ignore
        //cy.approveDemand()
        /* cy.on('window:alert', (str) => {
            expect(str).to.equal(`Nenhuma modificação registrada!`)
        }) */
    })
})
