import React from 'react';
import formatDate from './formatDate'
import formatFileSize from './formatFileSize'
//import { fileLabel } from '../config/configLabels'
import download from './downloadFile'
import PopUp from './PopUp'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'

const divRow = {
    marginBottom: 0,
    display: 'grid',
    grid: '50px / 4% 40% 25% 25%',
    width: '99%',
    margin: 'auto',
    padding: '10px 0 0 0',
    justifyItems: 'auto'
}

const ShowFiles = ({ veiculoId, filesCollection, close, format }) => {

    let tempFiles = []
    let files = []
    let fileLabels = cadVehicleFiles
    if (fileLabels.filter(f => f.name === 'transferenciaDoc').length === 0) fileLabels.push({ title: 'Documento de Transferência', name: 'transferenciaDoc' })
    if (fileLabels.filter(f => f.name === 'newPlateDoc').length === 0) fileLabels.push({ title: 'CRLV com nova placa', name: 'newPlateDoc' })
    
    if (filesCollection && filesCollection[0]) {
        tempFiles = filesCollection.filter(el => el.metadata.veiculoId.match(veiculoId))
        tempFiles.forEach(obj => {
            fileLabels.forEach(o => {
                if (o.name === obj.metadata.fieldName) files.push({ ...obj, label: o.title })
            })
        })
    }

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
                    <div>
                        <span style={{ fontSize: '1.2em', fontWeight: 500 }}>Arquivo</span>
                    </div>
                    <div >
                        <span style={{ fontSize: '1.2em', fontWeight: 500 }}>Data de Upload</span>
                    </div>
                    <div >
                        <span style={{ fontSize: '1.2em', fontWeight: 500 }}>Tamanho</span>
                    </div>
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
                                        onClick={() => download(file._id, file.filename)}>
                                        {file.label}
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
}

export default ShowFiles;