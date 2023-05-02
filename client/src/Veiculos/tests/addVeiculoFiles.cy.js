//@ts-check
/// <reference types="cypress" />
import addVeiculoInput from './fixtures/addVeiculoInput2.json'
const { razaoSocial, utilizacao, dominio } = addVeiculoInput
const filesFolder = './src/Empresas/AltContrato/tests/fixtures'
const randomPlate = 'AAA' + Math.round(Math.random() * 10000)

describe('Adding a new Vehicle and uploading files', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create demand and save new socio', () => {
        cy.visit('/veiculos/cadastro')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 10 })
        cy.get('input[name=placa]:first').type(randomPlate)
        selectOption('Utilização', utilizacao)
        selectOption('Situação da Propriedade', dominio)
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.get('input[type=file]').eq(1).selectFile(`${filesFolder}/addSocioInput.json`, { force: true })
        cy.get('input[type=file]').eq(2).selectFile(`${filesFolder}/altEmpresaInput.json`, { force: true })
        cy.contains('Avançar').click()
        cy.get('textarea:first').type('teste')

        cy.contains('Enviar solicitação').click()
        /* cy.wait(2000)
        //@ts-ignore
        cy.approveDemand() */
    })
})

function selectOption(name, value) {
    cy.contains(name)
        .next().click()
        .get(`li[data-value=${value}]`).click()
}
