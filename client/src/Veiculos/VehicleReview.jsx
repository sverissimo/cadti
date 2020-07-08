import React, { Fragment } from 'react'

import ShowLocalFiles from '../Utils/ShowLocalFiles'
import StandardTable from '../Reusable Components/StandardTable'

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
    const
        classes = useStyles(),
        { paper } = classes,
        { acessibilidade, equipamentos, alteracoes, demand, demandFiles } = data,
        originalVehicle = data?.originalVehicle
    
    let vehicleDetails = [],
        obj = {},
        newForm = [],
        filledForm = [],
        ultimateData,
        alteredElements = []

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

    if (alteracoes && typeof alteracoes === 'object') alteredElements = Object.keys(alteracoes)

    if (originalVehicle) {
        Object.keys(originalVehicle).forEach(key => {
            if (data[key] && originalVehicle[key]) {
                if (data[key] !== originalVehicle[key] && !alteredElements.includes(key)) {
                    alteredElements.push(key)
                }
            }
        })
    }

    return (
        <>
            <Paper className={paper}>
                <main className='divTable'>
                    {
                        ultimateData.map(({ subtitle, form, data }, y) =>
                            <Fragment key={y}>
                                <StandardTable
                                    length={form.length}
                                    title={subtitle}
                                    labels={form.map(s => s.label)}
                                    fields={form.map(el => el.field)}
                                    values={Object.values(data)}
                                    alteredElements={alteredElements}
                                />
                            </Fragment>
                        )}
                </main>
                {
                    equipamentos[0] &&
                    <section style={{ margin: '30px 0 0 25px' }}>
                        <h3> Equipamentos </h3>
                        <p>
                            {
                                equipamentos && equipamentos.map((e, i) =>
                                    <span style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana', fontSize: '12px' }} key={i}>
                                        {i !== equipamentos.length - 1 ? e + ', ' : e}
                                    </span>
                                )
                            }
                        </p>
                    </section>
                }
                {
                    acessibilidade[0] &&
                    <section style={{ margin: '30px 0 0 25px' }}>
                        <h3> Itens de acessibilidade </h3>
                        <p>
                            {
                                acessibilidade.map((e, i) =>
                                    <span style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana', fontSize: '12px' }} key={i}>
                                        {i !== acessibilidade.length - 1 ? e + ', ' : e}
                                    </span>
                                )
                            }
                        </p>
                    </section>
                }

                <h3 style={{ margin: '30px 0 0 25px' }}> <FileCopyOutlinedIcon style={{ verticalAlign: 'middle', padding: '0 0 0 8px' }} /> Documentos </h3>
                {(files || demandFiles) &&
                    <ShowLocalFiles
                        demand={demand}
                        collection='vehicleDocs'
                        demandFiles={demandFiles}
                        form={filesForm}
                        files={files}
                    />}
            </Paper >
        </>
    )
}