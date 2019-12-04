import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'
import Hidden from '@material-ui/core/Hidden'
import Container from '@material-ui/core/Container'

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
        fontSize: '0.5rem'
    },
    cardDetails: {
        flex: 1,
        fontSize: '0.5rem'
    },
    cardMedia: {
        width: '120px',
        height: '180px'
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

const featuredPosts = [
    {
        title: 'Veículos',
        date: '07/Nov',
        description:
            'Cadastre e altere os dados do veículo ou solicite sua baixa',
        link: '/veiculos',
        imageUrl: '/images/vehicles.jpg'
    },
    {
        title: 'Empresas',
        date: '07/Nov',
        description:
            'Cadastre e gerencie dados de empresas, sócios e procuradores',
        link: '/empresasHome',
        imageUrl: '/images/empresas12.jpg'
    },
    {
        title: 'Consultas',
        date: '03/Dez',
        description:
            'Consulte e gerencie dados de veículos, seguros e empresas',
        link: '/consultas',
        imageUrl: '/images/consultas2.jpg'
    },
]

export default function () {

    const classes = useStyles();
    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="lg">

                <main>
                    <Paper className={classes.mainFeaturedPost}>
                        <img
                            style={{ position: 'absolute', height: '260px', width: '100%' }}
                            src="/images/bus_wallpaper.jpg"
                            alt="background"
                        />
                        }
                        <div className={classes.overlay} />
                        <Grid container>
                            <Grid item md={6}>
                                <div className={classes.mainFeaturedPostContent}>
                                    <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                                        SisMob - MG
                                    </Typography>
                                    <Typography variant="h5" color="inherit" paragraph>
                                        Sistema de Gestão da Mobilidade do Estado de Minas Gerais
                                    </Typography>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Grid container spacing={4} className={classes.cardGrid}>
                        {featuredPosts.map(post => (
                            <Grid item key={post.title} xs={12} md={4}>
                                <CardActionArea component="span" >
                                    <Link to={post.link} style={{ textDecoration: 'none' }}>
                                        <Card className={classes.card}>
                                            <div className={classes.cardDetails}>
                                                <CardContent>
                                                    <Typography component="h3" variant="h6">
                                                        {post.title}
                                                    </Typography>
                                                    <br />
                                                    <Typography variant='body2' paragraph>
                                                        {post.description}
                                                    </Typography>
                                                    <Typography variant='body2' color="primary">

                                                        Clique aqui para {post.title}

                                                    </Typography>
                                                </CardContent>
                                            </div>
                                            <Hidden xsDown>
                                                <CardMedia
                                                    className={classes.cardMedia}
                                                    component="img"
                                                    src={post.imageUrl}
                                                    title={post.title}
                                                />
                                            </Hidden>
                                        </Card>
                                    </Link>
                                </CardActionArea>
                            </Grid>
                        ))}
                    </Grid>
                </main>
            </Container>
        </React.Fragment>
    )
}