import React, { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

import './certificate.css'
import TextField from '@material-ui/core/TextField'
import { delegatario, caracteristicas, seguro, pesagem, informacoesGerais, other } from '../Forms/certificate'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({

    textField: {
        paddingRight: '25px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))

const data = {
    placa: "ZZZ-9999",
    renavam: "65403210654",
    dataRegistro: "2020-03-03T18:14:58.980Z",
    utilizacao: "Convencional",
    dominio: "Veículo próprio",
    apolice: "21120099",
    poltronas: 50,
    piquesPoltrona: 5,
    eixos: 5,
    pbt: "13650",
    nChassi: "320A65AS4D032ASD654",
    pesoDianteiro: "5000",
    pesoTraseiro: "4000",
    distanciaMinima: '78',
    distanciaMaxima: '94',
    anoChassi: '2015',
    cores: "SRN",
    equipamentosId: "Ar Condicionado, Assento Preferencial, Banheiro, Bebedouro, Cabine Separada Motorista, Cinto de Segurança, Descanso de Pernas, Monitor DVD",
    observacoes: "",
    delegatarioCompartilhado: null,
    marcaChassi: "Mercedes-Benz",
    modeloChassi: "O-400 RSD PL",
    marcaCarroceria: "BUSSCAR",
    modeloCarroceria: "INTERBUS R",
    empresa: "SARITUR - SANTA RITA TRANSPORTE URBANO E RODOVIARIO LTDA",
    vencimentoContrato: "2019-10-23T03:00:00.000Z",
    seguradora: "PRUDENTIAL do Brasil Vida em Grupo S.A.",
    dataEmissao: "2019-10-16T03:00:00.000Z",
}

export default function PdfCertificate({ vehicle }) {

    useEffect(() => {
        let canvas = document.getElementById('pdfPage')
        setTimeout(() => {
            window.print()
        }, 500);

    }, [vehicle])

    const classes = useStyles(),
        { textField } = classes

    let carac = caracteristicas,
        delega = delegatario,
        seg = seguro,
        peso = pesagem,
        info = informacoesGerais,
        obs = other,
        object = {}
    if (!vehicle) vehicle = data
    const formArray = [carac, delega, seg, peso, info, obs]

    formArray.forEach(form => {
        Object.entries(vehicle).forEach(([key, value]) => {
            form.forEach((line, i) => {
                line.forEach((obj, k) => {
                    if (obj.field === key) {
                        object = Object.assign(obj, { value })
                        form[i][k] = object
                        object = {}
                    }
                })
            })
        })
    })
    const checkMulti = field => {
        if (field === 'equipamentosId' || field === 'equipamentosId') {
            return
        }
        else return 'certificate'
    }

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
                    Este certificado pode ser verificado em <Link to=''>  http://www.sismob.mg.gov.br</Link>
                </div>
            </div>
            <br />
            <button className='noprint' onClick={() => window.print()}> Press this</button>
        </Fragment>
    )
}