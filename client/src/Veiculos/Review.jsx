import React from 'react'

import { cadForm } from '../Forms/cadForm'
import { altForm } from '../Forms/altForm'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab';
import { FileCopy } from '@material-ui/icons'
import Tooltip from '@material-ui/core/Tooltip';

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
    },
    equipa: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: '9%',
        width: 600,
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center'
    }
}))

export default function Revisao({ data, parentComponent }) {
    let review = [], formArray
    const classes = useStyles(),
        { textField, paper, root, equipa, icon } = classes,
        { justificativa } = data

    if (parentComponent === 'cadastro') formArray = cadForm
    if (parentComponent === 'altDados') formArray = altForm
    

    formArray.forEach(form => {
        form.forEach(obj => {
            for (let k in data) {
                if (k === obj.field) review.push({ label: obj.label, field: k, value: data[k] })
            }

        })
    })

    let eq
    if (parentComponent === 'cadastro' && data.hasOwnProperty('equipamentos_id')) eq = data.equipamentos_id.toString().replace(/,/g, ', ')

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
                <Grid container justify="flex-end">

                    <Tooltip title='Ver arquivos'>
                        <Fab color="default" aria-label="files" className={icon}>
                            <FileCopy />

                        </Fab>
                    </Tooltip>
                </Grid>
                {parentComponent === 'altDados' && <Grid item xs={12} style={{ margin: '2% 0' }}>
                    <TextField
                        name='justificativa'
                        value={justificativa}
                        label='Justificativa'
                        type='text'
                        disabled={true}
                        InputLabelProps={{ shrink: true, style: { fontWeight: 600 } }}
                        inputProps={{ style: { height: '60px', width: '900px' } }}
                        multiline
                        rows={4}
                        variant='outlined'
                    />
                </Grid>
                }
                {parentComponent === 'cadastro' && <Grid item xs={12} style={{ display: eq ? undefined : 'none' }}>
                    <TextField
                        id='equipamentos'
                        className={equipa}
                        value={eq}
                        label='Acessórios'
                        disabled={true}
                        type='text'
                        InputLabelProps={{
                            shrink: true,
                            style: { fontSize: '0.9rem', fontWeight: 600, color: '#000', marginBottom: '5%' }
                        }}
                        inputProps={{
                            style: {
                                textAlign: 'center', color: '#000', backgroundColor: '#f7f7ff', paddingBottom: '2%',
                                height: '40px', fontSize: '0.7rem'
                            }
                        }}
                        multiline
                        variant='outlined'
                    />
                </Grid>}

            </Grid>
        </Paper>
    )
}