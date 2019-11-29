import React from 'react'

export default function ShowLocalFiles({ close, data }) {

    const { procFiles, contratoSocial, procuradores } = data

    // const filesForm = contratoSocial || new FormData()

    /*     for (let [k, v] of procFiles) {
            filesForm.set(k, v)
        }
     */
    const contrato = contratoSocial.get('contratoSocial')
    
    const createLink = (key, fileName) => {
        let file

        if (key === 'contratoSocial') file = contrato
        else file = procFiles.get(key)

        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    }

    let fileArray = []

    for (let pair of procFiles.entries()) {
        procuradores.forEach(p => {
            if (p.cpfProcurador === pair[0]) {
                fileArray.push({ nome: p.nomeProcurador, cpf: p.cpfProcurador, fileName: pair[1].name })
            }
        })
    }

    return <React.Fragment>
        <p>
            And click here to download the fking
            <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => createLink('contratoSocial', contrato.name)}> >
                Contrato Social
            </span>
        </p>


        {fileArray.map(f => (
            <span>
                {'Procuração - ' + f.nome + ', ' + f.fileName}
                <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => createLink(f.cpf, f.fileName)}> Clique aqui para baixar</span>
            </span>
        )
        )}
    </React.Fragment>
}