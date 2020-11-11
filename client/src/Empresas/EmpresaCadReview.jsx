import React, { Fragment } from 'react'

import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'

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

export default function EmpresaCadReview({ data, empresasForm, sociosForm, filesForm, files }) {

    const { socios } = data,
        classes = useStyles(),
        { paper } = classes

    let empresaDetails = [], obj = {}, filledForm = [], ultimateData

    empresasForm.forEach(e => {
        if (data.hasOwnProperty([e.field])) {
            Object.assign(obj, { [e.field]: data[e.field] })
            filledForm.push(e)
        }
    })
    empresaDetails.push(obj)

    ultimateData = [
        { subtitle: 'Detalhes da empresa', form: filledForm, data: empresaDetails },
        { subtitle: 'Informações sobre os sócios', form: sociosForm, data: socios }
    ]

    return (
        <>
            <Paper className={paper}>
                <div className='divTable'>
                    {
                        ultimateData.map(({ subtitle, form, data }, y) =>
                            <Fragment key={y}>
                                <table style={y === 1 ? { tableLayout: 'fixed' } : {}}>
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
                                        {y === 0 && <tr>
                                            {data.map((obj, j) =>
                                                Object.values(obj).map((el, k) =>
                                                    <td className='review' key={k}>
                                                        {el}
                                                    </td>
                                                )
                                            )}
                                        </tr>}
                                        {y !== 0 && data.map((obj, j) =>
                                            <tr key={j}>
                                                {Object.values(obj).map((el, k) =>
                                                    <td className='review' key={k}>
                                                        {el}
                                                    </td>
                                                )}
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Fragment>
                        )}
                </div>

                <h3 style={{ margin: '30px 0 0 25px' }}> <FileCopyOutlinedIcon style={{ verticalAlign: 'middle', padding: '0 0 0 8px' }} /> Documentos </h3>
                {files && <ShowLocalFiles form={filesForm} files={files} />}
            </Paper >
        </>
    )
}