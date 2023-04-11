import React from 'react'

import { procuradorForm } from './forms/procuradorForm'
import Typography from '@material-ui/core/Typography'

import { withStyles, makeStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const StyledTableCell = withStyles(theme => ({
    head: {
        backgroundColor: '#e1f5fe',
        color: '#00000',
        fontWeight: 600,
        fontSize: 14,
    },
    body: {
        fontSize: 14,

    },
}))(TableCell);

const StyledCell = withStyles(theme => ({
    head: {
        backgroundColor: '#e1f5fe',
        color: '#00000',
    },
    body: {
        fontSize: 13,

    },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: '1',
        padding: '1%',
        textAlign: 'center'
    },
    title: {
        marginTop: '2%',
        fontColor: '#000',
        fontSize: '0.9rem',
        backgroundColor: '#B2DCEA',
        textAlign: 'center'
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


export default function Procurador({ procuracao, procuradores }) {

    const classes = useStyles(),
        { title, table } = classes

    let procArray = []

    procuracao.procuradores.forEach(id => {
        const pro = procuradores.find(p => p.procuradorId === id)
        procArray.push(pro)
    })

    return (
        <React.Fragment>
            <div style={{ width: '100%', align: 'left' }}>
                <Typography className={title}> Procuradores cadastrados </Typography>
            </div>
            <Table className={table}>
                <TableHead>
                    <StyledTableRow>
                        {procuradorForm.map((s, i) => <StyledTableCell key={i}>{s.label}</StyledTableCell>)}
                    </StyledTableRow>
                </TableHead>
                {procArray.map((d, j) =>
                    d ?
                        <TableBody key={j}>
                            <TableRow>
                                {
                                    procuradorForm.map((obj, l) =>
                                        <StyledCell key={l}>
                                            {d[obj.field]}
                                        </StyledCell>
                                    )
                                }
                            </TableRow>
                        </TableBody>
                        :
                        null
                )}
            </Table>
        </ React.Fragment>
    )
}