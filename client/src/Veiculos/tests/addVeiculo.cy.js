/// <reference types="cypress" />
import addVeiculoInput from './fixtures/addVeiculoInput.json'
const { placa, razaoSocial, utilizacao, dominio, ...veiculo } = addVeiculoInput

describe('Adding a new Vehicle', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create demand and save new socio', () => {
        cy.visit('/veiculos/cadastro')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 10 })
        cy.get('input[name=placa]:first').type(placa)
        selectOption('Utilização', utilizacao)
        fillInputs(veiculo)
        selectOption('Situação da Propriedade', dominio)
        cy.contains('Avançar').click()
        fillInputs(addVeiculoInput)
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        cy.get('textarea:first').type('teste')
        cy.contains('Enviar solicitação').click()
        cy.wait(2000)
        cy.approveDemand()
    })
})


function fillInputs(obj) {
    for (const k in obj) {
        if (k === 'razaoSocial') continue
        cy.get('body')
            .then(body => {
                const input = `input[name=${k}]`
                const shouldFill = body.find(input).length > 0
                if (shouldFill) {
                    cy.get(input).type(addVeiculoInput[k], { force: true })
                }
            })
    }
}

function selectOption(name, value) {
    cy.contains(name)
        .next().click()
        .get(`li[data-value=${value}]`).click()
}
