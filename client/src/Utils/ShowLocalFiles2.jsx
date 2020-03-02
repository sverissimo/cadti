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

export default function ShowLocalFiles({ form, files }) {

    /* let doc
    if (files) doc = contratoSocial.get('contratoSocial') || new FormData() */

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

    if (files) for (let pair of files.entries()) {
        form.forEach(({ name, title }) => {
            if (name === pair[0]) {
                fileArray.push({ label: title, fieldName: name, fileName: pair[1].name })
            }
        })
    }

    return <React.Fragment>
        <div style={divContainer}>
            {fileArray.map((f, i) =>
                <div style={divFiles} key={i}>
                    <InsertDriveFileOutlinedIcon style={fileIcon} />
                    <span style={{ verticalAlign: 'middle', }}>
                        {' '} {f.label}
                    </span>
                    <GetAppIcon style={icon} onClick={() => createLink(f.fieldName, f.fileName)} />
                </div>
            )}
        </div>
    </React.Fragment >
}