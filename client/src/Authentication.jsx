import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Routes from './Routes'
import { connect } from 'react-redux'
import UserAuth from './Auth/UserAuth'

import { Header, Footer } from './Layouts'
import Container from '@material-ui/core/Container';

import { getCookie } from './Utils/documentCookies'

const Authentication = (props) => {

    const
        user = props?.redux?.user,
        loggedIn = getCookie('loggedIn').length > 0 // Se deixar como estado inicial do store.user desse jeito, será q n atualiza o componente qdo apagar??

    useEffect(() => {
        if (user)
            console.log(loggedIn)            
    }, [user, loggedIn])

    if (!loggedIn)
        return <UserAuth />
    else
        return (
            <div className='app'>
                <Container maxWidth="lg" style={{ minHeight: '100vh' }}>
                    <BrowserRouter>
                        <Header />
                        <Routes />
                    </BrowserRouter>
                    <Footer />
                </Container>
            </div>
        )
}

function mapStateToProps(state) {
    return {
        redux: {
            ...state.user
        }
    }
}

export default connect(mapStateToProps)(Authentication)