import React, { Fragment } from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { cadForm } from '../Forms/cadForm'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1)
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
    },
    input: {
        textAlign: 'center'
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        margin: theme.spacing(1)
    }
}));


export default function Revisao({ data }) {
    let review = []
    const classes = makeStyles(),
        { textField, paper, container } = classes

    cadForm.forEach(form => {
        form.forEach(obj => {
            for (let k in data) {
                if (k.match(obj.field)) review.push({ label: obj.label, field: k, value: data[k] })
            }

        })
    })
    console.log(review)

    return (
        <Fragment>
            <Grid container
                direction="row"
                className={container}>
            <Paper className={paper}>
                {review.map((r, k) =>
                    <Grid item xs={6} key={k}>
                        <TextField
                            className={textField}
                            lable={r.label}
                            value={r.value}
                            disabled={true}
                        />
                    </Grid>
                )}
                </Paper>
            </Grid>

        </Fragment >
    )
}
