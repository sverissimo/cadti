import React, { Fragment } from 'react'
import moment from 'moment'

import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

import PeopleIcon from '@material-ui/icons/People';
import './empresasReview.scss'

export default function Revisao({ data, forms, filesForm, files, demandFiles }) {

    const { filteredSocios } = data
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
            </section >
            <section className='socios_docs_container'>
                {
                    filteredSocios && filteredSocios[0] && filteredSocios.some(s => s.status) &&
                    <section title='Sócios' className='flexColumn socios__review__container'>
                        <h3 className='review__subtitle'>
                            <PeopleIcon className='socios__review__icon' />
                        Sócios
                        </h3>
                        {filteredSocios.map(({ nomeSocio, status, outsider }) =>
                            <div
                                className='flex socios__review__div'
                                style={{ color: outsider || status === 'new' ? 'green' : status === 'modified' ? 'orange' : status === 'deleted' ? 'red' : '' }}>
                                <span className='socios__review__prop' >
                                    {nomeSocio}
                                    {
                                        outsider || status === 'new' ? '(incluído)' :
                                            status === 'modified' ? '(modificado)' :
                                                status === 'deleted' ? '(excluído)' : ''
                                    }
                                </span>
                            </div>
                        )}
                    </section>
                }
                {
                    (files || demandFiles) &&
                    <section title='Documentos' className='flex docs'>
                        <h3 className='review__subtitle'>
                            <FileCopyOutlinedIcon className='docs__icon' /> Documentos
                        </h3>
                        <ShowLocalFiles
                            demandFiles={demandFiles}
                            form={filesForm}
                            files={files}
                            collection='empresaDocs'
                        />
                    </section>
                }
            </section>
        </>
    )
}

/* {
    filteredSocios && filteredSocios[0] && filteredSocios.some(s => s.status) &&
    <section className='flexColumn'>
        <h3 style={{ margin: '30px 0 0 25px' }}> <FileCopyOutlinedIcon style={{ verticalAlign: 'middle', padding: '0 0 0 8px' }} /> Documentos </h3>
        {filteredSocios.map(socio =>
            <div
                className='flex socio__review__div'
                style={{
                    width: '1000px',
                    justifyContent: 'space-between',
                    color: socio.status === 'new' ? 'green' : socio.status === 'modified' ? 'orange' : socio.status === 'deleted' ? 'red' : ''
                }}>
                <span className='socio__review__prop' >{socio.nomeSocio}</span>
                <span className='socio__review__prop' >{socio.cpfSocio}</span>
                <span className='socio__review__prop' >{socio.telSocio}</span>
                <span className='socio__review__prop' >{socio.emailSocio}</span>
            </div>
        )}
    </section>
} */