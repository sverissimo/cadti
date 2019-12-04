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
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.common.white,
        marginBottom: theme.spacing(4),
        backgroundImage: '/images/empresaBg2.jpg',
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
        backgroundColor: 'rgba(0,0,0,.1)',
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
        title: 'Cadastrar',
        date: '07/Nov',
        description:
            'Cadastrar uma nova empresa no sistema.',
        imageUrl: '/images/addCompany21.png',
        link: '/empresas',
        tab: 0
    },
    {
        title: 'Sócios',
        date: '07/Nov',
        description:
            'Gerenciar sócios e alterações de contrato social',
        link: '/empresas',
        imageUrl: '/images/socios3.png',
        tab: 2
    },
    {
        title: 'Procuradores',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/empresas',
        imageUrl: '/images/procuradores31.png',
        tab: 3
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
                            style={{ position: 'absolute', height: '100%', width: '100%' }}
                            src="/images/empresasBg2.jpg"
                            alt="background"
                        />
                        <div className={classes.overlay} />
                        <Grid container>
                            <Grid item md={4}>
                                <div className={classes.mainFeaturedPostContent}>
                                    <Typography component="h1" variant="h4" gutterBottom>
                                        Empresas
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        Selecione uma das opções abaixo.
                                    </Typography>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Grid container spacing={4} className={classes.cardGrid}>
                        {featuredPosts.map(post => (
                            <Grid item key={post.title} xs={12} md={4}>
                                <Link to={{ pathname: post.link, tab: post.tab }} style={{ textDecoration: 'none' }}>
                                    <CardActionArea component="span" >
                                        <Card className={classes.card}>
                                            <div className={classes.cardDetails}>
                                                <CardContent>
                                                    <Typography component="h2" variant="h6">
                                                        {post.title}
                                                    </Typography>
                                                    <br />
                                                    <Typography variant="body2" paragraph>
                                                        {post.description}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary">

                                                        {post.title}

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
                                    </CardActionArea>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </main>
            </Container>
        </React.Fragment>
    )
}