import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { logUserOut } from '../Store/userActions';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Toolbar, Typography, Button, Link } from '@material-ui/core'
import Badge from '@material-ui/core/Badge';
import { withRouter } from 'react-router'
import './stylez.scss'

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
    { title: 'Editar Conta', link: '/editAccount', icon: 'person' },
]

const adminSections = [
    { title: 'Alterar parâmetros do sistema', link: '/parametros', icon: 'settings' },
    { title: 'Gestão de usuários', link: '/users', icon: 'group' },
]

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
        { user } = props,
        demand = localStorage.getItem('demand'),
        classes = useStyles(),
        { toolbarTitle, toolbarSecondary, toolbarLink } = classes

    const
        [path, setSelected] = useState(document.location.pathname),
        [logCounter, setLogCounter] = useState()

    //Atualiza o menu superior, destacando a aba selecionada e atualizando o número de solicitações em aberto
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

    const logout = async () => props.logUserOut(user?.socketId)

    return (
        <React.Fragment>
            <CssBaseline />

            <Toolbar>
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
                <Button variant="outlined" size="small" onClick={() => logout()}>
                    Sair
                </Button>
            </Toolbar>
            <Toolbar component="nav" variant="dense" className={toolbarSecondary}>
                {sections.map(({ link, title, icon }, i) => (
                    title === 'Editar Conta' ? null
                        :
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
                {
                    user.role === 'admin' ?                     //Apenas usuários admin podem visualizar essas opções
                        adminSections.map(({ title, link, icon }, i) =>
                            <Link component={RouterLink} to={link} key={i}>
                                <span
                                    className="material-icons adminLink"
                                    style={{ color: 'white', cursor: 'pointer' }}
                                    title={title}
                                >
                                    {icon}
                                </span>
                            </Link>
                        )
                        :
                        <Link component={RouterLink} to={sections[6].link}>
                            <span
                                className="material-icons iconHeaderLink"
                                style={{ color: 'white', cursor: 'pointer' }}
                                title={sections[6].title}
                            >
                                {sections[6].icon}
                            </span>
                        </Link>

                }
            </Toolbar>
        </React.Fragment >
    )
}

function mapStateToProps(state) {
    return {
        logs: state.data?.logs,
        parametros: state.data?.parametros,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ logUserOut }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header))