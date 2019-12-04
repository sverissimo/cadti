import React from 'react'
import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';

const divContainer = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    alignContent: 'center',
    flexWrap: 'wrap'
}

const divFiles = {
    textAlign: 'center',
    alignItems: 'flex-start',
    lineHeight: '40px',
    border: '1px #ccc solid',
    padding: '0 1%',
    margin: '1% 1% 0.5% 1%',
    fontSize: '0.8rem',
    backgroundColor: '#f6f6f6',
    borderRadius: '6px',

}

const icon = {
    verticalAlign: 'middle',
    cursor: 'pointer',
    paddingLeft: '2%'
}

const fileIcon = {
    verticalAlign: 'middle',
    padding: '0 0% 0 2%',

}

export default function ShowLocalFiles({ data }) {

    const { procFiles, contratoSocial, procuradores } = data

    // const filesForm = contratoSocial || new FormData()

    /*     for (let [k, v] of procFiles) {
            filesForm.set(k, v)
        }
     */
    let contrato
    if (contratoSocial) contrato = contratoSocial.get('contratoSocial') || new FormData()

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
        <div style={divContainer}>
            {/* 
            <div style={divFiles}>
                Arquivos
            </div> */}

            {contratoSocial && <div style={divFiles}>
                <InsertDriveFileOutlinedIcon style={fileIcon} />
                {' '} Contrato Social
                <GetAppIcon style={icon} onClick={() => createLink('contratoSocial', contrato.name)} />
            </div>}

            {fileArray.map((f, i) =>
                <div style={divFiles} key={i}>
                    <InsertDriveFileOutlinedIcon style={fileIcon} />
                    <span style={{ verticalAlign: 'middle', }}>
                    {' '} Procuração - {f.nome}
                    </span>
                    <GetAppIcon style={icon} onClick={() => createLink(f.cpf, f.fileName)} />
                </div>
            )}
        </div>
    </React.Fragment >
}