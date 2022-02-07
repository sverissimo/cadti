import React, { Fragment } from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import PrintTwoToneIcon from '@material-ui/icons/PrintTwoTone';

import './certificate.scss'
import CertificateHeader from './CertificateHeader';
import TextArea from '../Reusable Components/TextArea';

const useStyles = makeStyles(theme => ({

    textField: {
        paddingRight: '25px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))


const CertificateTemplate = ({ vehicle, nomes, checkMulti, redirect, delega, carac, dadosVeiculo, seg, vistoria, peso, info, }) => {

    const
        classes = useStyles(),
        { textField } = classes,
        { acessibilidade, equipamentos, obs } = vehicle

    const ultimateForm = [
        { title: 'Delegatário', form: delega },
        { title: 'Dados do Veículo', form: dadosVeiculo },
        { title: 'Características do Veículo', form: carac },
        { title: 'Seguro', form: seg },
        { title: 'Vistoria', form: vistoria },
        { title: 'Pesagem', form: peso },
        { title: 'Informações gerais', form: info },
        { title: 'Observações', form: obs }
    ]
    return (
        <Fragment>
            <div id='pdfPage' className='A4'>
                <header className='header'>
                    <CertificateHeader nomes={nomes} />
                </header>

                {
                    ultimateForm.map(({ title, form }, y) =>
                        title !== 'Observações' &&
                        <section className={title !== 'Delegatário' ? 'box' : 'firstBox'} key={y}>
                            {title !== 'Delegatário' && <span className='boxTitle'>{title}</span>}
                            {
                                form.map((line, i) =>
                                    <div
                                        key={i}
                                        className={title !== 'Delegatário' ? 'divLine' : 'firstDivLine'}
                                        style={{ marginTop: i === 0 ? '7mm' : '3mm' }}
                                    >
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
                                                    el.type === 'date' ? !moment(el.value).isValid() ? ''
                                                        :
                                                        moment(el.value).format('DD/MM/YYYY') :
                                                        el.field === 'dataExpedicao' ? moment().format('DD-MM-YYYY')
                                                            :
                                                            el.format ? el.format(el.value)
                                                                :
                                                                el.value || ''
                                                }
                                                inputProps={{
                                                    className: checkMulti(el.field),
                                                    style: {
                                                        width: el.width || '18mm',
                                                        fontSize: '2.7mm',
                                                        padding: '0 0 1px 0',
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
                        </section>
                    )
                }
                <div className="box">
                    <span className='boxTitle'>Equipamentos / Itens de acessibilidade</span>
                    {
                        (equipamentos || acessibilidade) &&
                        <div className="divLine flex" style={{ overflow: 'unset' }}>
                            {
                                equipamentos.map((e, i) => !acessibilidade[0] && i === equipamentos.length - 1 ?
                                    <span className="equipa">{e}.</span>
                                    :
                                    <span className="equipa">{e},&nbsp;</span>
                                )
                            }
                            {
                                acessibilidade.map((e, i) => i !== acessibilidade.length - 1 ?
                                    <span className="equipa" key={i}>{`${e}, `}</span>
                                    :
                                    <span className="equipa" key={i}>{`${e}.`}</span>
                                )
                            }
                        </div>
                    }
                </div>
                {
                    obs &&
                    <div className="flexColumn">
                        <TextArea
                            label='Observações:'
                            name='obs'
                            id='obs'
                            defaultValue={obs}
                            rows='7'
                            style={{ color: '#000', fontSize: '0.55 rem', padding: '5px', overflow: 'hidden' }}
                        />
                    </div>
                }
                <footer className='certFooter'>
                    <h1 className="certFooter__title">
                        PORTE OBRIGATÓRIO
                    </h1>
                    <p className="certFooter__text">
                        Este certificado pode ser verificado em <span className='link' onClick={() => redirect()}> https://www.cadti.mg.gov.br </span>
                    </p>
                </footer>
            </div>
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
