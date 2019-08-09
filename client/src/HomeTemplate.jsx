import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Typography, Grid, Container, Paper, Card, CardContent, CardActionArea, 
    Hidden, CardMedia } from '@material-ui/core'

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

const featuredPosts = [
    {
        title: 'Featured post',
        date: 'Nov 12',
        description:
            'This is a wider card with supporting text below as a natural lead-in to additional content.',
    },
    {
        title: 'Post title',
        date: 'Nov 11',
        description:
            'This is a wider card with supporting text below as a natural lead-in to additional content.',
    },
];


export default function () {

    const classes = useStyles();
    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="lg">
            
                <main>
                    {/* Main featured post */}
                    <Paper className={classes.mainFeaturedPost}>
                        {/* Increase the priority of the hero background image */}
                        {
                            <img
                                style={{ position: 'absolute', height:'240px', width:'1215px'  }}
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
                    {/* End main featured post */}
                    {/* Sub featured posts */}
                    <Grid container spacing={4} className={classes.cardGrid}>
                        {featuredPosts.map(post => (
                            <Grid item key={post.title} xs={12} md={6}>
                                <CardActionArea component="a" href="#">
                                    <Card className={classes.card}>
                                        <div className={classes.cardDetails}>
                                            <CardContent>
                                                <Typography component="h2" variant="h5">
                                                    {post.title}
                                                </Typography>
                                                <Typography variant="subtitle1" color="textSecondary">
                                                    {post.date}
                                                </Typography>
                                                <Typography variant="subtitle1" paragraph>
                                                    {post.description}
                                                </Typography>
                                                <Typography variant="subtitle1" color="primary">
                                                    Continue reading...
                                                </Typography>
                                            </CardContent>
                                        </div>
                                        <Hidden xsDown>
                                            <CardMedia
                                                className={classes.cardMedia}
                                                image="https://source.unsplash.com/random"
                                                title="Image title"
                                            />
                                        </Hidden>
                                    </Card>
                                </CardActionArea>
                            </Grid>
                        ))}
                    </Grid>
                </main>
            </Container>
        </React.Fragment>
    )
}
