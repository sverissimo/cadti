import React, { Fragment } from 'react'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import moment from 'moment'

export default function Revisao({ data, forms, filesForm, files, demandFiles }) {

    //Para cada formulário, roda o State do componente(container) e atribui a propriedade value em cada campo 
    forms.forEach(form => {
        form.forEach(objField => {
            Object.entries(data).forEach(([k, v]) => {
                if (objField.field === k)
                    objField.value = v
            })
        })
    })

    //Consertando a data - (campo 'Vencimento do contrato')
    const i = forms[0].findIndex(el => el.field === 'vencimentoContrato')
    if (i !== -1) {
        let venc = forms[0][i].value
        if (venc && moment(venc).isValid()) {
            venc = moment(venc).format('DD/MM/YYYY')
            forms[0][i].value = venc
        }
    }

    const tablesSubtitles = ['Dados da empresa', 'Informações sobre a alteração do contrato social']

    return (
        <>
            <section className='flex'>
                <div className='divTable'>
                    {
                        forms.map((form, y) =>
                            <Fragment key={y}>
                                <table style={y === 1 ? { tableLayout: 'fixed' } : {}}>
                                    <thead>
                                        <tr>
                                            <th className='tHeader'
                                                colSpan={form.length}>{tablesSubtitles[y]}
                                            </th>
                                        </tr>
                                        <tr>
                                            {form.map(({ label }, i) => <th key={i}>{label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {form.map(({ value }, k) =>
                                                <td className='review' key={k}>
                                                    {value}
                                                </td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </Fragment>
                        )}
                </div>

                <h3 style={{ margin: '30px 0 0 25px' }}> <FileCopyOutlinedIcon style={{ verticalAlign: 'middle', padding: '0 0 0 8px' }} /> Documentos </h3>
                {(files || demandFiles) &&
                    <ShowLocalFiles
                        demandFiles={demandFiles}
                        form={filesForm}
                        files={files}
                        collection='empresaDocs'
                    />
                }
            </section >
        </>
    )
}