import React from 'react'
import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import downloadFile from './downloadFile';

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
    height: '40px',
    border: '1px #ccc solid',
    padding: '7px 8px 0 8px',
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

export default function ShowLocalFiles({ form, files, demand, demandFiles, collection }) {


    const createLink = (key, fileName) => {

        const file = files.get(key)

        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;

        if (file && (file.type === 'application/pdf' || file.type.match('image/'))) {
            link.setAttribute('rel', "noopener")
            link.setAttribute('target', "_blank")
            link.setAttribute('title', fileName)
        }
        else link.setAttribute('download', fileName)
        document.body.appendChild(link);
        link.click();
    }

    let fileArray = []

    if (demand) {
        demandFiles.forEach(file => {
            form.forEach(({ name, title }) => {
                if (file.metadata.fieldName === name)
                    fileArray.push({ id: file.id, label: title, fieldName: name, fileName: file.filename, storage: 'server' })
            })
        })
    }

    //******LÓGICA PARA Q O PUSH() DO FILEARRAY SOBRESCREVA QQ OUTRO OBJETO COM MESMO FIELDNAME [criada] AGORA FALTA NOVOS FIELDS ANEXADOS NO VEHICLEdOC SEREM RENDERIZADOS AQUI */
    if (files) for (let pair of files.entries()) {
        form.forEach(({ name, title }) => {
            if (name === pair[0]) {
                if (pair[1] && pair[1].name) {
                    const index = fileArray.findIndex(obj => obj?.fieldName === name)
                    if (index || index === 0) {
                        fileArray[index] = { label: title, fieldName: name, fileName: pair[1].name, storage: 'local' }
                        console.log(fileArray, index, fileArray[index])
                    }
                    else fileArray.push({ label: title, fieldName: name, fileName: pair[1].name, storage: 'local' })
                }
            }
        })
    }

    console.log(fileArray)
    return <React.Fragment>
        <div style={divContainer}>
            {fileArray.map((f, i) =>
                <div style={divFiles} key={i}>
                    <InsertDriveFileOutlinedIcon style={fileIcon} />
                    <span style={{ verticalAlign: 'middle', }}>
                        {' '} {f.label}
                    </span>
                    <GetAppIcon style={icon}
                        onClick={() => f.storage === 'local' ? createLink(f.fieldName, f.fileName) : downloadFile(f.id, f.fileName, collection, f.fieldName)} />
                </div>
            )}
        </div>
    </React.Fragment >
}