Cypress.Commands.add('login', () => {
    const USER = Cypress.env('user')
    const PASSWORD = Cypress.env('password')
    cy.visit('/')
    cy.get('#email').type(USER)
    cy.get('#password').type(PASSWORD)
    cy.get('.MuiButtonBase-root').click()
})
