//@ts-check
import seguro from '../fixtures/seguro.json'
describe('Seguros transactions', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.login()
    })
    it('Should successfully save insurance approval request', () => {
        const { apolice, seguradora, data_emissao, vencimento } = seguro
        cy.get('.MuiToolbar-dense > [href="/veiculos"]').click()
        cy.get('[href="/veiculos/seguros"] > .veiculosHome_card__image___Ethh').click()
        cy.get('.selectEmpresa').type('EMPRESA GONTIJO DE TRANSPORTES LIMITADA')
        cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputBase-input').type(seguradora)
        cy.get(':nth-child(3) > .MuiInputBase-root > .MuiInputBase-input').type(apolice)
        cy.get(':nth-child(5) > .MuiInputBase-root > .MuiInputBase-input').type(data_emissao)
        cy.get(':nth-child(6) > .MuiInputBase-root > .MuiInputBase-input').type(vencimento)
        cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type('AAA-0000')
        cy.get('.spaceBetween > :nth-child(1) > .MuiButtonBase-root > .MuiButton-label').click()
        cy.get('[style="min-height: 60px;"] > .MuiButtonBase-root > .MuiButton-label')
        cy.contains('Salvar').click()
    })
})