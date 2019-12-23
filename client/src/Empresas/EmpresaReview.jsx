import React, { Fragment } from 'react'

import ShowLocalFiles from '../Utils/ShowLocalFiles'
import { empresasForm } from '../Forms/empresasForm'
import { sociosForm } from '../Forms/sociosForm'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
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
        fontSize: 12,

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
        { socios } = data
    let empresaDetails = {}
    empresasForm.forEach(e => {
        if (data.hasOwnProperty([e.field])) {
            Object.assign(empresaDetails, { [e.field]: data[e.field] })
        }
    })
    empresaDetails = [empresaDetails]

    const ultimateData = [
        { subtitle: 'Detalhes da Empresa', form: empresasForm, data: empresaDetails },
        { subtitle: 'Sócios', form: sociosForm, data: socios }        
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
                                <div style={{ width: '100%', align: 'left' }}>
                                    <Typography className={title}> {subtitle} </Typography>
                                </div>
                                <br />
                                <Table className={table}>
                                    <TableHead>
                                        <StyledTableRow>
                                            {form.map((s, i) => <StyledTableCell key={i}>{s.label}</StyledTableCell>)}
                                        </StyledTableRow>
                                    </TableHead>
                                    {
                                        data.map((d, j) =>
                                            <TableBody key={j}>
                                                <TableRow>
                                                    {
                                                        form.map((obj, l) =>
                                                            <StyledCell key={l}>
                                                                {d[obj.field]}
                                                            </StyledCell>
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
                    <h3> <FileCopyOutlinedIcon style={{verticalAlign: 'middle',padding: '0 0 0 4%'}}/> Documentos </h3>
                    <ShowLocalFiles data={data} />
                </Grid>
            </Paper >
        </>
    )
}