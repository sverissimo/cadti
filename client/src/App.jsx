import React from 'react';
import { BrowserRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core'
import { Header, Footer } from './Layouts'
import { Grid } from '@material-ui/core';
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

      <Grid
        container spacing={2}
        justify="center"
        alignItems="center"
        style={{
          margin: 0,
          top: 0,
          width: '100%',
        }}
      >
        <BrowserRouter>
          <Header />
          <Routes />
        </BrowserRouter>
        <Footer />

      </Grid>
    </div>
  )
}

export default App;
