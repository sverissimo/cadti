Cypress.Commands.add('login', () => {
    const USER = Cypress.env('user')
    const PASSWORD = Cypress.env('password')
    cy.visit('/')
    cy.get('#email').type(USER)
    cy.get('#password').type(PASSWORD)
    cy.get('.MuiButtonBase-root').click()
})

Cypress.Commands.add('startSession', () => {
    cy.session('adminSession', () => {
        cy.intercept('**/**', (req) => {
            req.headers['authorization'] = Cypress.env('headerAuth')
        })
        cy.setCookie('aToken', Cypress.env('token'))
        cy.setCookie('loggedIn', Cypress.env('loggedInToken'))
    })
})

