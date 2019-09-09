import React from 'react'
import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { cadForm } from '../Forms/cadForm'

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: '1',
        margin: '1%',
        padding: '1%',
        textAlign: 'center'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '9%',
        width: 150,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
    },
    input: {
        textAlign: 'center'
    },
    paper: {
        color: theme.palette.text.secondary,
        margin: theme.spacing(2),
        width: "100%",
        padding: '2% 0 4% 0',
        height: '500px'
    }
}))

export default function Revisao({ data }) {
    let review = []
    const classes = useStyles(),
        { textField, paper, root } = classes

    cadForm.forEach(form => {
        form.forEach(obj => {
            for (let k in data) {
                if (k.match(obj.field)) review.push({ label: obj.label, field: k, value: data[k] })
            }

        })
    })
    
    return (
        <Paper className={paper}>
            <Grid container
                direction="row"
                className={root}>
                {review.map((r, k) =>
                    <Grid item xs={6} md={3} lg={2} key={k}>
                        <TextField
                            id={r.field}
                            className={textField}
                            value={r.value}
                            label={r.label}
                            disabled={true}
                            type='text'
                            InputLabelProps={{ className: textField, shrink: true, style: { fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '5%' } }}
                            inputProps={{
                                style: { textAlign: 'center', color: '#000', backgroundColor: '#f7f7ff', paddingBottom: '2%', height: '40px', fontSize: '0.9rem' }
                            }}
                            variant='outlined'
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    )
}