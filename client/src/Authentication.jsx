import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import Routes from './Routes'
import { connect } from 'react-redux'
import UserAuth from './Auth/UserAuth'

import { Header, Footer } from './Layouts'
import Container from '@material-ui/core/Container';

import { getCookie } from './Utils/documentCookies'

const Authentication = props => {
    const
        loggedIn = getCookie('loggedIn').length > 0,
        { user } = props

    if (!loggedIn)
        return <UserAuth />
    else
        return (
            <div className='app'>
                <Container maxWidth="lg" style={{ minHeight: '100vh' }}>
                    <BrowserRouter>
                        <Header />
                        <Routes user={user} />
                    </BrowserRouter>
                    <Footer />
                </Container>
            </div>
        )
}

function mapStateToProps(state) {
    return {
        ...state
    }
}

export default connect(mapStateToProps)(Authentication)