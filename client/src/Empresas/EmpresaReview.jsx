import React, { Fragment } from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { empresasForm } from '../Forms/empresasForm'
import { procuradorForm } from '../Forms/procuradorForm'
import { sociosForm } from '../Forms/sociosForm'
import Fab from '@material-ui/core/Fab';
import { FileCopy } from '@material-ui/icons'
import Tooltip from '@material-ui/core/Tooltip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: '1',
        padding: '1%',
        textAlign: 'center'
    },
    title: {
        margin: theme.spacing(1),
        fontColor: '#000',
        fontWeight: 500,
        backgroundColor: '#B2DCEA'
    },
    input: {
        textAlign: 'center'
    },
    paper: {
        color: theme.palette.text.secondary,
        margin: theme.spacing(2),
        width: "100%",
        padding: '2% 0 1% 0',
        height: 'auto'
    },
    table: {
        marginBottom: theme.spacing(2),        
        overflowX: 'auto'
    }
}))

export default function Revisao({ data }) {

    const classes = useStyles(),
        { title, paper, root, table } = classes,
        { socios, procuradores } = data
    let empresaDetails = {}
    empresasForm.forEach(e => {
        if (data.hasOwnProperty([e.field])) {
            Object.assign(empresaDetails, { [e.field]: data[e.field] })
        }
    })
    empresaDetails = [empresaDetails]

    const ultimateData = [
        { subtitle: 'Detalhes da Empresa', form: empresasForm, data: empresaDetails },
        { subtitle: 'Sócios', form: sociosForm, data: socios },
        { subtitle: 'Procuradores', form: procuradorForm, data: procuradores }
    ]    
    return (
        <>
            <Paper className={paper}>
                <Grid container
                    direction="row"
                    className={root}>
                    {
                        ultimateData.map(({ subtitle, form, data }, y) =>
                            <Fragment key={y}>
                                <div style={{ width: '100%', align:'left' }}>
                                    <Typography className={title}> {subtitle} </Typography>
                                </div>
                                <br />
                                <Table className={table}>
                                    <TableHead>
                                        <TableRow>
                                            {form.map((s, i) => <TableCell key={i}>{s.label}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    {
                                        data.map((d, j) =>
                                            <TableBody key={j}>
                                                <TableRow>
                                                    {
                                                        form.map((obj, l) =>
                                                            <TableCell key={l}>
                                                                {d[obj.field]}
                                                            </TableCell>
                                                        )
                                                    }
                                                </TableRow>
                                            </TableBody>
                                        )
                                    }
                                </Table>
                            </Fragment>
                        )
                    }
                    <Grid container justify="flex-end">
                        <Tooltip title='Ver arquivos'>
                            <Fab color="default" aria-label="files">
                                <FileCopy />
                            </Fab>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper >
        </>
    )
}