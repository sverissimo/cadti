//@ts-check
/// <reference types="cypress" />
import socioUpdates from './fixtures/socioUpdatesInput.json'
const { razaoSocial, nomeSocio, cpfSocio, emailSocio, telSocio, share } = socioUpdates[0]
const { nomeSocio: nomeSocio2, cpfSocio: cpfSocio2, emailSocio: emailSocio2, share: share2 } = socioUpdates[1]
const { cpfSocio: cpfSocio3, emailSocio: emailSocio3, share: share3 } = socioUpdates[2]

describe('Adding a new Socio for a existing Empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully create demand and save new socio', () => {
        cy.visit('/altContrato')
        cy.get('.selectEmpresa').type(razaoSocial, { delay: 0 })
        cy.contains('Avançar').click()
        cy.contains('Avançar').click()
        //adds new socio
        cy.get('input[name=nomeSocio]:first').type(nomeSocio)
        cy.get('input[name=cpfSocio]:first').type(cpfSocio)
        cy.get('input[name=telSocio]:first').type(telSocio, { delay: 0 })
        cy.get('input[name=emailSocio]:first').type(emailSocio)
        cy.get('input[name=share]:first').type(share)
        cy.contains('Adicionar sócio').click()
        //adds outsider socio (new to this empresa, but existing in DB)
        cy.get('input[name=nomeSocio]:first').type(nomeSocio2)
        cy.get('input[name=cpfSocio]:first').type(cpfSocio2)
        cy.get('input[name=emailSocio]:first').type(emailSocio2)
        cy.get('input[name=share]:first').type(share2)
        cy.contains('Adicionar sócio').click()
        //delete first socio in the list
        cy.get('section.flex.center.paper > div:first > button.MuiButton-textSecondary').click()
        //updates existing socio
        cy.get(':nth-child(7) > span[title=editar]').click()
        cy.get('input[name=cpfSocio]').eq(6).type(cpfSocio3)
        cy.get('input[name=emailSocio]').eq(6).type(emailSocio3)
        cy.get('input[name=share]').eq(6).type(share3)
        cy.get(':nth-child(7) > span[title=editar]').click()
        //save demand
        cy.contains('Avançar').click()
        cy.contains('Enviar solicitação').click()

        //@ts-ignore
        cy.approveDemand()
    })
})
