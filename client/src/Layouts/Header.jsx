import React, { useState, useEffect, useContext } from 'react'
import { ReactContext } from '../Store/ReactContext'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Toolbar, Typography, Button, IconButton, Link } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
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
    },
    mainFeaturedPost: {
        position: 'relative',
        backgroundColor: theme.palette.grey[800],
        color: theme.palette.common.white,
        marginBottom: theme.spacing(4),
        backgroundImage: '/images/bus_wallpaper.jpg',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.3)',
    },
    mainFeaturedPostContent: {
        position: 'relative',
        padding: theme.spacing(3),
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6),
            paddingRight: 0,
        },
    },
    mainGrid: {
        marginTop: theme.spacing(3),
    },
    card: {
        display: 'flex',
    },
    cardDetails: {
        flex: 1,
    },
    cardMedia: {
        width: 160,
    },
    markdown: {
        ...theme.typography.body2,
        padding: theme.spacing(3, 0),
    },
    sidebarAboutBox: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],
    },
    sidebarSection: {
        marginTop: theme.spacing(3),
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        marginTop: theme.spacing(8),
        padding: theme.spacing(6, 0),
    },
}));

const sections = [
    { title: 'Página Inicial', link: '/' },
    { title: 'Consultas', link: '/consultas' },
    { title: 'Veículos', link: '/veiculos' },
    { title: 'Empresas', link: '/empresas' },
    { title: 'Relatórios', link: '/relatorios' },
    { title: 'Solicitacões', link: '/solicitacoes' },
    //{ title: 'Fale Conosco', link: '/faleConosco' },
];


const Header = props => {
    const
        classes = useStyles(),
        [path, setSelected] = useState(document.location.pathname),
        { pathname } = props.location,
        { context } = useContext(ReactContext),
        demand = context?.demand

    useEffect(() => {
        setSelected(pathname)
    }, [pathname])

    const selected = link => {
        let
            bgColor = '',
            borderB = '',
            borderT = '',
            fontW = '400'

        if (demand) {
            let style = document.querySelector("a[href='/solicitacoes']")?.style
            style['background-color'] = '#11a7d2'
            style['border-bottom'] = '1.5px solid #ccc'
            //style['border-top'] = '2px solid #fff'
          //  style['font-weight'] = '500'
        }
        else if (path.match(link) && link !== '/' && !demand) {
            bgColor = '#11a7d2'            
            borderB = '1.5px solid #ccc'
            //borderT = '2px solid #fff'
            //fontW = '500'
        }        
        return {bgColor, borderB, borderT, fontW}
    }

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
                    className={classes.toolbarTitle}
                >
                    Seinfra - Subsecretaria de Transportes e Mobilidade - MG
                    </Typography>
                <IconButton>
                    <SearchIcon />
                </IconButton>
                <Button variant="outlined" size="small">
                    Fazer login
                    </Button>
            </Toolbar>
            <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
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
                            /* backgroundColor:
                                path === 'solicitacoes' && demand ? '#11a7d2'
                                    : (path.match(link) && link !== '/' && !demand) ? '#11a7d2'
                                        : '', */
                            //borderTop: (path === link && link !== '/' && link !== '/faleConosco') ? '2px solid #fff' : '',
                            //borderBottom: (path.match(link) && link !== '/' && link !== '/faleConosco') ? '1.5px solid #ccc' : '',
                            //fontWeight: (path.match(link) && (link === '/' || link === '/faleConosco')) ? '500' : '400'
                        }}
                        className={classes.toolbarLink}
                        onClick={() => setSelected(link)}
                    >
                        {title}
                    </Link>
                ))}
            </Toolbar>
        </React.Fragment >
    )
}
export default withRouter(Header)