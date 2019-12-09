import React from 'react'
import { Link } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import HomeIcon from '@material-ui/icons/Home';

export default function Crumbs({links, text}) {
    return (
        <Grid style={{ marginTop: '1%', paddingLeft: '1%' }}>
            <Breadcrumbs separator="›" aria-label="breadcrumb" >
                <Link
                    to='/' style={{}}
                >
                    <HomeIcon style={{ verticalAlign: 'middle', marginRight: '5px', paddingBottom: '3px' }} />
                    <span style={{ fontSize: '0.8rem', }}>
                        Página inicial
                    </span>

                </Link>
                <Link color="primary" to={links[1]} style={{ fontSize: '0.8rem' }}>
                    {links[0]}
            </Link>
                <span style={{ fontSize: '0.8rem' }} >{text}</span>
            </Breadcrumbs>
        </Grid>
    )
}
