import React from 'react'
import { FormControlLabel, Checkbox, Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    item: {
        color: '#000',        
        fontSize: '0.8rem',
        textAlign: 'center'
    },
}))

export default function AddEquipa({ data, equipamentos, handleCheck }) {
    const classes = useStyles(), { item } = classes

    return <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="baseline"
    >
        {
            equipamentos.map((eq, i) =>
                <Grid key={i}>
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
