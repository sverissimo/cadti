import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core'
import { Header, Footer } from './Layouts'
import { Container } from '@material-ui/core';
import Routes from './Routes'

function App() {

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }))

  const { root } = useStyles()
  return (
    <div className={root}>

      <Container maxWidth="lg">
        <BrowserRouter>
          <Header />
          <Routes />
        </BrowserRouter>
        <Footer />
      </Container>
    </div>
  )
}

export default App;
