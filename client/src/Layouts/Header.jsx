import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { connect } from 'react-redux';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Toolbar, Typography, Button, Link } from '@material-ui/core'
import Badge from '@material-ui/core/Badge';
import { withRouter } from 'react-router'
import './stylez.css'

const useStyles = makeStyles(theme => ({
    toolbarTitle: {
        flex: 1,
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
        backgroundColor: '#0398c1',
        color: 'white'
    },

    toolbarLink: {
        padding: '12px 55px 13px 55px',
        flexShrink: 0,
    }
}));

const sections = [
    { title: 'Página Inicial', link: '/' },
    { title: 'Consultas', link: '/consultas' },
    { title: 'Veículos', link: '/veiculos' },
    { title: 'Empresas', link: '/empresas' },
    { title: 'Relatórios', link: '/relatorios' },
    { title: 'Solicitações ', link: '/solicitacoes' },
    //{ title: 'Fale Conosco', link: '/faleConosco' },
];

const StyledBadge = withStyles((theme) => ({
    badge: {
        right: -8,
        top: -1,
        padding: '0 4px',
    },
}))(Badge);

const Header = props => {

    const
        logs = props?.logs,
        { parametros } = props,
        { pathname } = props.location,
        demand = localStorage.getItem('demand'),
        classes = useStyles(),
        { toolbarTitle, toolbarSecondary, toolbarLink } = classes

    const
        [path, setSelected] = useState(document.location.pathname),
        [logCounter, setLogCounter] = useState()

    useEffect(() => {
        if (logs && Array.isArray(logs)) {
            const count = logs
                .filter(l => l?.completed === false)
                .length

            setLogCounter(count)
        }
        setSelected(pathname)
    }, [pathname, logCounter, logs])

    const selected = link => {
        let
            style = document.querySelector("a[href='/solicitacoes']")?.style,
            bgColor = '',
            borderB = '',
            borderT = '',
            fontW = '400'

        if (path === '/solicitacoes' || demand) {
            if (style) {
                style['background-color'] = '#11a7d2'
                style['border-bottom'] = '1.5px solid #ccc'
            }
        }

        else if (path.match(link) && link !== '/') {
            bgColor = '#11a7d2'
            borderB = '1.5px solid #ccc'
            if (style) {
                style['background-color'] = ''
                style['border-bottom'] = ''
            }
        }
        return { bgColor, borderB, borderT, fontW }
    }
    //Pega o nome e a sigla da Secretaria do DB, editáveis na opção "Parâmetros" do sistema.
    let
        nomeSecretaria = '',
        siglaSecretaria = ''

    if (parametros && parametros[0]) {
        const { nomes } = parametros[0]
        nomeSecretaria = nomes.secretaria
        siglaSecretaria = nomes.siglaSecretaria
    }

    //console.log("🚀 ", nomeSecretaria, siglaSecretaria)
    return (
        <React.Fragment>
            <CssBaseline />

            <Toolbar>
                <Button size="small">Criar usuário</Button>
                <Typography
                    component="h2"
                    variant="h6"
                    color="inherit"
                    align="center"
                    noWrap
                    className={toolbarTitle}
                >
                    {siglaSecretaria} - {nomeSecretaria}
                </Typography>
                <Button variant="outlined" size="small">
                    Fazer login
                    </Button>
            </Toolbar>
            <Toolbar component="nav" variant="dense" className={toolbarSecondary}>
                {sections.map(({ link, title }, i) => (
                    <Link
                        component={RouterLink}
                        to={link}
                        key={i}
                        color="inherit"
                        noWrap
                        variant="body2"
                        href=""
                        style={{
                            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            fontSize: '15px',
                            backgroundColor: selected(link).bgColor,
                            borderBottom: selected(link).borderB,
                            fontWeight: selected(link).fontW,
                            borderTop: selected(link).borderT
                        }}
                        className={toolbarLink}
                        onClick={() => setSelected(link)}
                    >
                        {
                            title === 'Solicitações ' ?

                                <StyledBadge badgeContent={logCounter} color='secondary'>
                                    <span>
                                        {title}
                                    </span>
                                </StyledBadge>
                                :
                                title
                        }
                    </Link>
                ))}
                <Link
                    component={RouterLink}
                    to='/parametros'
                >
                    <span
                        className="material-icons"
                        style={{ color: 'white', cursor: 'pointer' }}
                        title='Alterar parâmetros do sistema'
                    >
                        settings
                    </span>
                </Link>
            </Toolbar>
        </React.Fragment >
    )
}

function mapStateToProps(state) {
    return {
        logs: state.data?.logs,
        parametros: state.data?.parametros
    }
}

export default connect(mapStateToProps)(withRouter(Header))