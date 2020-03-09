import React, { Fragment } from 'react'

import ShowLocalFiles from '../Utils/ShowLocalFiles2'

import Paper from '@material-ui/core/Paper'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        color: theme.palette.text.secondary,
        width: "100%",
        padding: '8px 0 5px 0',
        height: 'auto'
    }
}))

export default function Revisao({ data, parentComponent, form, filesForm, files }) {

    const classes = useStyles(),
        { paper } = classes

    let vehicleDetails = [], obj = {}, newForm = [], filledForm = [], ultimateData
    form.forEach(f => {
        f.forEach(e => {
            if (data.hasOwnProperty([e.field])) {
                Object.assign(obj, { [e.field]: data[e.field] })
                newForm.push(e)
            }
        })
        vehicleDetails.push(obj)
        filledForm.push(newForm)
        obj = {}
        newForm = []
    })
    if (parentComponent === 'cadastro') ultimateData = [
        { subtitle: 'Detalhes do veículo', form: filledForm[0], data: vehicleDetails[0] },
        { subtitle: 'Detalhes do seguro', form: filledForm[1], data: vehicleDetails[1] },
        { subtitle: 'Informações sobre a vistoria', form: filledForm[2], data: vehicleDetails[2] },
    ]

    if (parentComponent === 'altDados') ultimateData = [
        { subtitle: 'Detalhes do veículo', form: filledForm[0], data: vehicleDetails[0] },
        { subtitle: 'Informações sobre a vistoria', form: filledForm[1], data: vehicleDetails[1] }
    ]

    return (
        <>
            <Paper className={paper}>
                <div className='divTable'>
                    {
                        ultimateData.map(({ subtitle, form, data }, y) =>
                            <Fragment key={y}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th className='tHeader'
                                                colSpan={form.length}>{subtitle}</th>
                                        </tr>
                                        <tr>
                                            {form.map((s, i) => <th key={i}>{s.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {Object.values(data).map((d, j) =>
                                                <td className='review' key={j}>
                                                    {d}
                                                </td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>

                            </Fragment>
                        )}

                </div>
                <div style={{ margin: '30px 0 0 25px' }}>
                    <h3> Equipamentos </h3>
                    <p>
                        {
                            Array.isArray(data.equipamentosId) && data.equipamentosId &&
                            data.equipamentosId.map((e, i) => <span
                                style={{
                                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana',
                                    fontSize: '12px'
                                }}
                                key={i}>
                                {i !== data.equipamentosId.length ? e + ', ' : e
                                }
                            </span>)
                        }
                    </p>
                </div>


                <h3 style={{ margin: '30px 0 0 25px' }}> <FileCopyOutlinedIcon style={{ verticalAlign: 'middle', padding: '0 0 0 8px' }} /> Documentos </h3>
                {files && <ShowLocalFiles form={filesForm} files={files} />}
            </Paper >
        </>
    )
}