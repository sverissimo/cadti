import React, { Fragment } from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import PrintTwoToneIcon from '@material-ui/icons/PrintTwoTone';

import './certificate.scss'

const useStyles = makeStyles(theme => ({

    textField: {
        paddingRight: '25px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))

const CertificateTemplate = ({ names, checkMulti, redirect, carac, delega, seg, peso, info, obs }) => {

    const
        classes = useStyles(),
        { textField } = classes,
        { secretaria, subsecretaria, superintendencia } = names

    const ultimateForm = [
        { title: 'Delegatário', form: delega },
        { title: 'Características do Veículo', form: carac },
        { title: 'Seguro', form: seg },
        { title: 'Pesagem', form: peso },
        { title: 'Informações gerais', form: info },
        { title: 'Outras informações', form: obs }
    ]
    return (
        <Fragment>
            <div id='pdfPage' className='A4'>
                <div className='header'>
                    <img src='/images/certficateHeader.png' height='100%' width='100%' alt="header" />
                </div>
                {ultimateForm.map(({ title, form }, y) =>
                    <div className={title !== 'Delegatário' ? 'box' : 'firstBox'} key={y}>
                        {title !== 'Delegatário' && <span className='boxTitle'>{title}</span>}
                        {form.map((line, i) =>
                            <div key={i} className={title !== 'Delegatário' ? 'divLine' : 'firstDivLine'} style={{ marginTop: i === 0 && '11mm' }}>
                                {line.map((el, k) =>
                                    <TextField
                                        disabled
                                        key={k}
                                        name={el.field}
                                        label={el.label}
                                        className={textField}
                                        multiline={el.field === 'equipamentosId' || (el.field === 'observacoes' && el.value && el.value.length > 50) ? true : false}
                                        rows={
                                            el.value && el.value.length < 86 ? '2' :
                                                el.value && el.value.length < 140 ? '3' : '4'
                                        }
                                        variant={el.field === 'equipamentosId' || (el.field === 'observacoes' && el.value && el.value.length > 50) ? 'outlined' : 'standard'}
                                        value={
                                            el.type === 'date' ? moment(el.value).format('DD-MM-YYYY') :
                                                el.field === 'dataExpedicao' ? moment().format('DD-MM-YYYY') :
                                                    el.value || ''
                                        }
                                        inputProps={{
                                            className: checkMulti(el.field),
                                            style: {
                                                width: el.width || '18mm',
                                                fontSize: '2.7mm',
                                                padding: '1px 0',
                                                margin: '0',
                                                flex: '1',
                                                color: '#000'
                                            }
                                        }}
                                        InputProps={{ style: { padding: el.field === 'equipamentosId' || (el.field === 'observacoes' && el.value && el.value.length > 50) ? '1mm' : '' } }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: {
                                                fontSize: '13px',
                                                textAlign: 'center !important',
                                                left: el.left || '0',
                                                color: '#000'
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className='porteObrigatorio'>
                    <img src="/images/porteObrigatorio.png" height='100%' width='100%' alt="porte obrigatório" />
                    <br />
                Este certificado pode ser verificado em <span className='link' onClick={() => redirect()}> http://www.sismob.mg.gov.br </span>
                </div>
            </div>
            <br />
            <button title='Imprimir / salvar PDF' className='noprint printButton' onClick={() => window.print()}>
                <PrintTwoToneIcon style={{
                    cursor: 'pointer',
                    color: 'rgb(161, 161, 180)',
                    fontSize: '40pt',
                }} /></button>
        </Fragment>
    )
}

export default CertificateTemplate
