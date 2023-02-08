describe('Remove Procuracao for selected empresa', () => {
    beforeEach(() => {
        //@ts-ignore
        cy.startSession()
    })
    it('Should successfully remove procuracao', () => {
        cy.visit('/empresas/procuradores')
        cy.get('.selectEmpresa').type('EMPRESA GONTIJO DE TRANSPORTES LIMITADA', { delay: 0 })
        cy.contains('Apagar').click()
        //cy.get('.MuiSvgIcon-root.MuiSvgIcon-colorSecondary:first').click()
        //.click()
    })
})

