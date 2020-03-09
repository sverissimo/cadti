import React, { Fragment } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import moment from 'moment'

import './certificate.css'
import TextField from '@material-ui/core/TextField'
//import styles from './certificate.module.css'
import { delegatario, caracteristicas, seguro, pesagem, informacoesGerais } from '../Forms/certificate'
import { makeStyles } from '@material-ui/core/styles'


const useStyles = makeStyles(theme => ({

    textField: {
        paddingRight: '25px',
        fontSize: '0.8rem',
        fontColor: '#bbb',
        textAlign: 'center',
    }
}))


const print = () => {
    const filename = 'PdfShit.pdf';

    html2canvas(document.querySelector('#pdfPage'), { scale: 2 })
        .then(canvas => {

            canvas.style.letterSpacing = '0.2pt'
            console.log(canvas)
            /* let screen = document.querySelector(canvas)            
            screen.style = 'letter-spacing: 0.2em' */
            let pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -35, 211, 298, 'whatever', 'FAST');
            pdf.save(filename);
        });
}

const print2 = () => {
    var divToPrint = document.getElementById('pdfPage');
    var newWin = window.open('', 'Print-Window', 'width=400,height=400,top=100,left=100');
    newWin.document.open();
    newWin.document.write('<html><head><style>#in {display:none}</style><body onload="window.print()">' + divToPrint.innerHTML + '</body></html>');
    newWin.document.close();
    setTimeout(function () { newWin.close(); }, 10);
}


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
    equipamentosId: "Ar condicionado,Monitor DVD,Vídeo cassete",
    delegatarioCompartilhado: null,
    marcaChassi: "Mercedes-Benz",
    modeloChassi: "O-400 RSD PL",
    marcaCarroceria: "BUSSCAR",
    modeloCarroceria: "INTERBUS R",
    empresa: "EMPRESA GONTIJO DE TRANSPORTES LIMITADA",
    seguradora: "PRUDENTIAL do Brasil Vida em Grupo S.A.",
    dataEmissao: "2019-10-16T03:00:00.000Z",
}

export default function PdfCertificate() {
    //const { A4 } = styles
    const classes = useStyles(),
        { textField } = classes

    let carac = caracteristicas,
        delega = delegatario,
        seg = seguro,
        peso = pesagem,
        info = informacoesGerais,
        object = {}

    const formArray = [carac, delega, seg, peso, info]

    formArray.forEach(form => {
        Object.entries(data).forEach(([key, value]) => {
            form.forEach((line, i) => {
                line.forEach((obj, k) => {
                    if (obj.field === key) {
                        object = Object.assign(obj, { value })
                        form[i][k] = object
                        object = {}
                    }
                })
            })
        });

    })

    const ultimateForm = [
        { title: 'Delegatário', form: delega },
        { title: 'Características do Veículo', form: carac },
        { title: 'Seguro', form: seg },
        { title: 'Pesagem', form: peso },
        { title: 'Informações gerais', form: info }
    ]

    /*     Object.entries(data).forEach(([key, value]) => {
            carac.forEach((line, i) => {
                line.forEach((obj, k) => {
                    if (obj.field === key) {
                        object = Object.assign(obj, { value })
                        carac[i][k] = object
                        object = {}
                    }
                })
            })
        });
     */
    //const { container, label, lineDiv } = styles

    return (
        <>
            <div id='pdfPage' className='A4'>
                <div className='header'>
                    <img src='/images/certficateHeader.png' height='100%' width='100%' />
                </div>
                {ultimateForm.map(({ title, form }, y) =>
                    <div className='box' key={y}>
                        <span className='boxTitle'>{title}</span>
                        {form.map((line, i) =>
                            <div key={i} className='divLine' style={{ marginTop: i === 0 && '11mm' }}>
                                {line.map((el, k) =>
                                    <TextField
                                        key={k}
                                        name={el.field}
                                        value={
                                            el.type === 'date' ? moment(el.value).format('DD-MM-YYYY') :
                                                el.field === 'dataExpedicao' ? moment().format('DD-MM-YYYY') :
                                                    el.value
                                        }
                                        label={el.label}
                                        className={textField}
                                        inputProps={{
                                            className: 'certificate',
                                            style: {
                                                width: el.width || '18mm',
                                                borderCollapse: 'collapse',
                                                fontSize: '3mm',
                                                margin: '0',
                                                flex: '1'
                                            }
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                            style: {
                                                fontSize: '13px',
                                                textAlign: 'center !important',
                                                left: el.left || '0',
                                            }
                                        }}
                                    />
                                )}

                            </div>
                        )}
                    </div>
                )}
            </div>
            <br />
            <button className='noprint' onClick={() => window.print()}> Press this</button>
        </>
    )
}
