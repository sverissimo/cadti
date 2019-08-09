import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '10vh',
        maxHeight: '15vh',
    },
    main: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(2),
    },
    footer: {

        marginTop: 'auto',
        backgroundColor: 'white',
        bottom: '0%'
    },
}));

export default () => {
    const classes = useStyles()
    return (

        <div className={classes.root}>
            <CssBaseline />
            <footer className={classes.footer}>
                <Container >
                    <Typography variant="body1">

                        GOVERNO DO ESTADO DE MINAS GERAIS
                    </Typography>
                </Container>
            </footer>
        </div>
    )
}