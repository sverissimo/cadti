import React, { useState, useEffect, useCallback, Fragment } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'

import LaudosTemplate from './LaudosTemplate'
import ShowDetails from '../Reusable Components/ShowDetails'
import FormDialog from '../Utils/FormDialog'

const Laudos = props => {

    const
        { veiculos, empresas } = props.redux

    const
        [razaoSocial, empresaInput] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(),
        [oldVehicles, setOldVehicles] = useState(),
        [filteredVehicles, setfilteredVehicles] = useState([]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(),
        [anchorEl, setAnchorEl] = useState(null),
        [dialogOpen, openDialog] = useState(false),
        [laudoExpiresOn, setLaudoDate] = useState(),
        [dropDisplay, setDropDisplay] = useState('Clique ou arraste o arquivo para anexar o laudo'),
        [laudoDoc, setlaudoDoc] = useState()

    useEffect(() => {
        const escFunction = e => { if (e.keyCode === 27) setDetails(false); setAnchorEl(null) }
        document.addEventListener('keydown', escFunction)
    }, [])

    const openMenu = (event) => {
        event.persist()
        const { id } = event.currentTarget
        let vehicle
        if (id) vehicle = veiculos.find(v => v.veiculoId.toString() === id)

        selectVehicle(vehicle)
        setAnchorEl(event.target);
    }

    const closeMenu = () => setAnchorEl(null)

    const handleInput = useCallback(e => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'razaoSocial') {
            empresaInput(value)
            const selectedEmpresa = empresas.find(e => e.razaoSocial === value)
            setEmpresa(selectedEmpresa)
        }
        if (name === 'placa' && oldVehicles[0]) {
            if (typeof value === 'string') value = value.toLocaleUpperCase()
            if (!value || value === '') setfilteredVehicles(oldVehicles)
            else {
                const filtered = oldVehicles.filter(v => v.placa.match(value))
                setfilteredVehicles(filtered)
            }
        }
        if (name === 'laudo') setLaudoDate(value)
    }, [empresaInput, empresas, oldVehicles, laudoExpiresOn])

    useEffect(() => {
        if (selectedEmpresa && selectedEmpresa !== '') {
            const
                currentYear = new Date().getFullYear(),
                frota = veiculos.filter(v => v.empresa === selectedEmpresa.razaoSocial),
                oldVehicles = frota.filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null)

            setOldVehicles(oldVehicles)
            setfilteredVehicles(oldVehicles)
        } else {
            setOldVehicles()
            setfilteredVehicles([])
            setEmpresa()
        }
    }, [selectedEmpresa, veiculos])

    const showDetails = () => {

        if (selectedVehicle) {
            setDetails(!details)
            setAnchorEl(null)
        } else {
            setDetails(false)
            selectVehicle(undefined)
            setAnchorEl(null)
        }
    }

    const insertLaudo = e => {
        console.log(e, laudoExpiresOn)
    }

    const handleFiles = (files, name) => {

        if (files && files[0]) {
            let formData = new FormData()
            formData.append('fieldName', 'laudoDoc')
            formData.append('veiculoId', selectedVehicle.veiculoId)
            formData.append(name, files[0])
            setlaudoDoc(formData)
            setDropDisplay(files[0].name)
        }
    }

    const submitFiles = () => {
        axios.post('/api/vehicleUpload', laudoDoc)
            .then(() => closeDialog)
    }

    const closeDialog = () => {
        setLaudoDate()
        setAnchorEl(null)
        openDialog(false)
    }
    return (
        <Fragment>

            <LaudosTemplate
                empresas={empresas} razaoSocial={razaoSocial} selectedEmpresa={selectedEmpresa} filteredVehicles={filteredVehicles}
                handleInput={handleInput} anchorEl={anchorEl} openMenu={openMenu} closeMenu={closeMenu}
                showDetails={showDetails} openDialog={openDialog}
            />
            {details && <ShowDetails
                close={showDetails}
                data={{ ...selectedVehicle, tableData: '' }}
                tab={3}
                title={'Veículo'}
                header={'- informações'}
            />}
            {dialogOpen && <FormDialog
                open={dialogOpen}
                close={closeDialog}
                title={`Placa ${selectedVehicle ? selectedVehicle.placa : ''}  Certificado de Segurança Veicular`}
                header='Para inserir o certificado, informe a data de vencimento e anexe o documento referente ao laudo.'
                type='date'
                inputName='laudo'
                inputLabel='Informe a data de validade do certificado'
                fileInputName='laudoDoc'
                value={laudoExpiresOn}
                handleInput={handleInput}
                handleFiles={handleFiles}
                confirm={submitFiles}
                dropDisplay={dropDisplay}
                formData={[]}
            />}
        </Fragment >
    )
}

const collections = ['veiculos', 'empresas']
export default StoreHOC(collections, Laudos)

//'getFiles/vehicleDocs'