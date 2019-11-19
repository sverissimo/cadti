import React from 'react'
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
        margin: '1%',
        padding: '1%',
        textAlign: 'center'
    },
    title: {
        margin: theme.spacing(1),                      
        fontColor: '#000',
        fontWeight: 500        
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
    table: {
        marginBottom: theme.spacing(2)
    }
}))

export default function Revisao({ data }) {
    
    const classes = useStyles(),
        { title, paper, root, table } = classes,
        { socios, procuradores } = data

    return (
        <>
            <Paper className={paper}>
                <Grid container
                    direction="row"
                    className={root}>
                    <Typography className={title}> Sócios </Typography>
                    <br />
                    <Table className={table}>
                        <TableHead>
                            <TableRow>
                                {sociosForm.map(s => <TableCell>{s.label}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        {
                            socios.map((s, i) =>
                                <TableBody>
                                    <TableRow>
                                        {
                                            sociosForm.map((r, k) =>
                                                <TableCell>
                                                    {s[r.field]}
                                                </TableCell>
                                            )
                                        }
                                    </TableRow>
                                </TableBody>
                            )
                        }
                    </Table>
                    <Typography className={title}> Procuradores </Typography>
                    <Table className={table}>
                        <TableHead>
                            <TableRow>
                                {procuradorForm.map(s => <TableCell>{s.label}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        {
                            procuradores.map((s, i) =>
                                <TableBody>
                                    <TableRow>
                                        {
                                            procuradorForm.map((r, k) =>
                                                <TableCell>
                                                    {s[r.field]}
                                                </TableCell>
                                            )
                                        }
                                    </TableRow>
                                </TableBody>
                            )
                        }
                    </Table>
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