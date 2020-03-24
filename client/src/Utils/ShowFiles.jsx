import React from 'react';
import formatDate from './formatDate'
import formatFileSize from './formatFileSize'
//import { fileLabel } from '../config/configLabels'
import download from './downloadFile'
import PopUp from './PopUp'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { empresaFiles } from '../Forms/empresaFiles'

const divRow = {
    marginBottom: 0,
    display: 'grid',
    grid: '50px / 4% 40% 25% 25%',
    width: '99%',
    margin: 'auto',
    padding: '10px 0 0 0',
    justifyItems: 'auto'
}

const ShowFiles = ({ filesCollection, close, format, typeId, empresas }) => {

    let files = [],
        collection = 'empresaDocs', fileLabels = [...empresaFiles]

    switch (typeId) {
        case 'veiculoId':
            collection = 'vehicleDocs'
            fileLabels = [...cadVehicleFiles]
            if (!fileLabels.find(f => f.name === 'transferenciaDoc')) fileLabels.push({ title: 'Documento de Transferência', name: 'transferenciaDoc' })
            if (!fileLabels.find(f => f.name === 'newPlateDoc')) fileLabels.push({ title: 'CRLV com nova placa', name: 'newPlateDoc' })
            if (!fileLabels.find(f => f.name === 'apoliceDoc')) fileLabels.push({ title: 'Apólice de seguro', name: 'apoliceDoc' })
            break;
        default: void 0
    }
    console.log('ShowFilesComp, filesCollection', filesCollection)
    if (filesCollection && filesCollection[0]) {
        filesCollection.forEach(obj => {
            fileLabels.forEach(o => {
                if (obj.metadata && o.name === obj.metadata.fieldName) files.push({ ...obj, label: o.title })
            })
        })
    }

    const getMoreInfo = file => {
        const { metadata } = file

        switch (metadata.fieldName) {
            case 'procuracao':
                const emp = empresas.find(e => e.delegatarioId === Number(metadata.empresaId))
                return ' - ' + emp.razaoSocial
            case 'apoliceDoc':
                if (metadata.apolice) return ' número ' + metadata.apolice
                else return ' '
            default:
                return ''
        }
    }
    const header = ['Arquivo', 'Data de Upload', 'Tamanho']
    //console.log(filesCollection)

    if (files[0]) {
        return <PopUp title='Arquivos' close={close} format={format}>
            <div className="row">
                <div className="row">
                    <h5>
                        <img alt="" src="/images/folderIcon2.jpg" style={{ paddingLeft: '20px', marginRight: '20px' }} />
                    </h5>
                </div>
                <hr style={{ marginBottom: '5px' }} />
                <div style={divRow}>
                    <div>
                        <img alt="" src="/images/multipleFiles2.png" height='50%' />
                    </div>
                    {header.map((title, i) =>
                        <div key={i}>
                            <span style={{ fontSize: '1.2em', fontWeight: 500 }}>{title}</span>
                        </div>
                    )}
                </div>
                <hr style={{ margin: '0 0 20px 0' }} />
                {
                    files.map((file, index) =>
                        <div key={index}>
                            <div style={divRow}>
                                <div className="col s1">
                                    <img alt="" src="/images/genericFile.png" />
                                </div>
                                <div className="col s11">
                                    <span
                                        style={{ textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                                        onClick={() => download(file.id, file.filename, collection, file.metadata.fieldName)}>
                                        {file.label + getMoreInfo(file)}
                                    </span>
                                </div>

                                <div className="col s3">
                                    {formatDate(file.uploadDate, true)}
                                </div>
                                <div className="col s3">
                                    {formatFileSize(file.length)}
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </PopUp>
    }
    else return null
}

export default ShowFiles;