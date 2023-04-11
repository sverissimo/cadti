//@ts-check
/// <reference types="cypress" />
import addProcuracaoInput from './fixtures/addProcuracaoInput.json'
const { razaoSocial, vencimento, procuradores } = addProcuracaoInput

describe('Adding a new Socio for a existing Empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create demand and save new socio', () => {
        cy.visit('/empresas/procuracoes')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 10 })
        procuradores.forEach((p, i) => {
            cy.get(`input[name=nomeProcurador${i}]`).type(p.nome_procurador)
            cy.get(`input[name=cpfProcurador${i}]`).type(p.cpf_procurador)
            cy.get(`input[name=telProcurador${i}]`).type(p.tel_procurador)
            p.email_procurador && cy.get(`input[name=emailProcurador${i}]:first`).type(p.email_procurador, { delay: 10 })
            cy.get('div.flex > svg.MuiSvgIcon-root:first').click()
        })

        cy.get('input[type=checkbox]').click()
        cy.get('input[name=vencimento]').type(vencimento)
        cy.contains('Cadastrar procuração').click()
        //@ts-ignore
        //cy.approveDemand()
    })
})
