import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Toolbar, Typography, Button, IconButton, Link } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import './stylez.css'

const useStyles = makeStyles(theme => ({
    toolbar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbarTitle: {
        flex: 1,
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
        backgroundColor: '#0398c1',
        color: 'white',
        borderBottom: 'solid 3px #fff',        
    },

    toolbarLink: {
        padding: theme.spacing(1),
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
    { title: 'Certidões', link: '/certidoes' },
    { title: 'Consultas', link: '/consultas' },
    { title: 'Veículos', link: '/veiculos' },    
    { title: 'Empresas', link: '/empresasHome' },
    { title: 'Fale Conosco', link: '/faleConosco' },
];


export default function () {

    const [path, setSelected] = useState(document.location.pathname)

    const classes = useStyles();
    return (
        <React.Fragment>
            <CssBaseline />
            
                <Toolbar className={classes.toolbar}>
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
                    {sections.map((section, i) => (
                        <Link
                            component={RouterLink}
                            to={section.link}
                            key={i}
                            color="inherit"
                            noWrap                            
                            variant="body2"
                            href=""
                            className={classes.toolbarLink}
                            onClick={() => setSelected(section.link)}
                        >
                            {path === section.link ?
                                <strong> {section.title} </strong> : section.title
                            }
                        </Link>
                    ))}
                </Toolbar>            
        </React.Fragment>
    )
}
