import React, { Fragment } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './certificate.css'
//import styles from './certificate.module.css'
import { delegatario, caracteristicas } from '../Forms/certificate'

function print() {
    const filename = 'PdfShit.pdf';

    html2canvas(document.querySelector('#pdfPage'), { scale: 2 })
        .then(canvas => {
            let pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'JPEG', 0, -35, 211, 298, 'cert', 'FAST');
            pdf.save(filename);
        });
}

const data = {
    placa: "ZZZ-9999",
    renavam: "65403210654",
    dataRegistro: "2020-03-03T18:14:58.980Z",
    utilizacao: "Convencional",
    dominio: "Veículo próprio",
    apolice: "21120099",
    poltronas: 50,
    eixos: 5,
    pbt: "13650",
    nChassi: "320A65AS4D032ASD654",
    pesoDianteiro: "5000",
    pesoTraseiro: "4000",
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

    let carac = caracteristicas, object = {}
    Object.entries(data).forEach(([key, value]) => {
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

    //const { container, label, lineDiv } = styles

    return (
        <>
            <div id='pdfPage' className='A4'>
                <div>
                    <h2>Title</h2>
                </div>
                <table>
                    <tbody>
                        {carac.map((line, i) =>
                            <Fragment key={i}>
                                <tr >
                                    {line.map((el, k) =>
                                        <th key={k + 100}>{el.label}</th>)}
                                </tr>
                                <tr key={i}>

                                    {line.map((el, j) =>
                                        <td key={j + 1000}>{el.value} </td>
                                    )}
                                </tr>
                            </Fragment>
                        )}
                    </tbody>

                </table>
            </div>
            <br />
            <button onClick={() => print()}> Press this</button>
        </>
    )
}
