import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'
import Hidden from '@material-ui/core/Hidden'
import './home.css'


const useStyles = makeStyles(theme => ({  
  
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
    footer: {
        backgroundColor: theme.palette.background.paper,
        marginTop: theme.spacing(8),
        padding: theme.spacing(6, 0),
    }
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
        link: '/empresas',
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
            <div
                style={{
                    minHeight: '83vh',
                    width: '100%',
                    height: 'auto',
                }}>
                <main className="homeMainPost">
                    <h1>
                        SisMob - MG
                    </h1>
                    <h2>
                        Sistema de Gestão da Mobilidade do Estado de Minas Gerais
                    </h2>
                </main>
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
            </div >
        </React.Fragment >
    )
}