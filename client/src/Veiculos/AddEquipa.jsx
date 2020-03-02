import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    item: {
        color: '#000',
        fontSize: '0.8rem',
        textAlign: 'left'
    },
}))

export default function AddEquipa({ data, equipamentos, handleCheck }) {
    const classes = useStyles(), { item } = classes

    return <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
    >
        {
            equipamentos.map((eq, i) =>
                <Grid item xs={12} md={4} key={i} className={item}>
                    <FormControlLabel                        
                        control={
                            <Checkbox                                
                                checked={data[eq.item]}
                                value={eq.item}
                                onChange={() => handleCheck(eq.item)} />
                        }
                        label={
                            <Typography className={item}>
                                {eq.item}
                            </Typography>
                        }
                    />
                </Grid>
            )
        }
    </Grid>
}
