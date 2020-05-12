import React, { useState, useEffect, useCallback, Fragment } from 'react'
import axios from 'axios'
import moment from 'moment'
import StoreHOC from '../Store/StoreHOC'

import AlertDialog from '../Utils/AlertDialog'
import ReactToast from '../Utils/ReactToast'

import { checkInputErrors } from '../Utils/checkInputErrors'
import LaudosTemplate from './LaudosTemplate'
import ShowDetails from '../Reusable Components/ShowDetails'
import { laudoForm } from '../Forms/laudoForm'

const Laudos = props => {

    const
        { veiculos, empresas, empresasLaudo, laudos } = props.redux

    const
        [razaoSocial, empresaInput] = useState(empresas[0].razaoSocial),
        [selectedEmpresa, setEmpresa] = useState(empresas[0]),
        [oldVehicles, setOldVehicles] = useState(),
        [filteredVehicles, setFilteredVehicles] = useState([]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(),
        [anchorEl, setAnchorEl] = useState(null),
        [dropDisplay, setDropDisplay] = useState('Clique ou arraste o arquivo para anexar o laudo'),
        [laudoDoc, setlaudoDoc] = useState(),
        [toast, setToast] = useState(false),
        [alertDialog, setAlertDialog] = useState({
            open: false,
            type: 'inputError',
            msg: '',
        }),
        [stateInputs, changeInputs] = useState({
            id: undefined,
            validade: '',
            empresaLaudo: ''
        })

    useEffect(() => {
        const escFunction = e => { if (e.keyCode === 27) setDetails(false); setAnchorEl(null) }
        document.addEventListener('keydown', escFunction)

    }, [])

    useEffect(() => {
        if (selectedEmpresa && selectedEmpresa !== '') {
            const
                currentYear = new Date().getFullYear(),
                frota = veiculos.filter(v => v.empresa === selectedEmpresa.razaoSocial),
                oldVehicles = frota.filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null).sort((a, b) => a.placa.localeCompare(b.placa)),
                gotLaudo = oldVehicles.filter(v => v.validadeLaudo !== null),
                laudoExpired = gotLaudo.filter(v => moment(v.validadeLaudo).isBefore(moment()))

            let vehiclesLaudo = [], laudosTemp = []
            oldVehicles.forEach(v => {
                laudos.forEach(l => {
                    if (v.veiculoId === l.veiculoId) {

                        laudosTemp.push(l)
                    }
                })
                laudosTemp.sort((a, b) => {
                    const dateA = new Date(a.validade)
                    const dateB = new Date(b.validade)
                    return dateB - dateA
                })

                vehiclesLaudo.push({ ...v, laudos: laudosTemp })
                laudosTemp = []
            })

            setOldVehicles(vehiclesLaudo)
            setFilteredVehicles(vehiclesLaudo)

        } else {
            setOldVehicles()
            setFilteredVehicles([])
            setEmpresa()
        }
    }, [selectedEmpresa, veiculos, laudos])


    const handleInput = useCallback(e => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'razaoSocial') {
            empresaInput(value)
            const selectedEmpresa = empresas.find(e => e.razaoSocial === value)
            setEmpresa(selectedEmpresa)
            return
        }
        if (name === 'placa' && oldVehicles[0]) {
            if (typeof value === 'string') value = value.toLocaleUpperCase()
            if (!value || value === '') setFilteredVehicles(oldVehicles)
            else {
                let vehicle
                const filtered = oldVehicles.filter(v => v.placa.match(value))
                if (filtered.length === 1) vehicle = filtered[0]

                setFilteredVehicles(filtered)
                selectVehicle(vehicle)
                return
            }
        }
        changeInputs({
            ...stateInputs, [name]: value
        })

    }, [empresaInput, empresas, oldVehicles, stateInputs])

    const clickOnPlate = event => {

        if (selectedVehicle) {
            event.persist()
            setAnchorEl(event.target);
        } else {
            const { id } = event.currentTarget
            let v
            if (id) v = oldVehicles.find(v => v.veiculoId.toString() === id)
            selectVehicle(v)
            setFilteredVehicles([v])
        }
    }

    const formatTable = () => {

        if (selectedVehicle) {
            if (selectedVehicle.laudos && selectedVehicle.laudos[0]) {

                const
                    { vehicleDocs } = props.redux,
                    { laudos } = selectedVehicle,
                    { createdAt, veiculoId, empresaId, ...lastLaudo } = laudos[0],

                    docs = vehicleDocs.find(d => d.metadata.laudoId === lastLaudo.id)

                
                let labels = [], values = []
                laudoForm.forEach(obj => {
                    labels.push(obj.label)
                    values = Object.values(lastLaudo)
                })

                if (docs) {
                    labels.push('Arquivo')
                    values.push('Clique para baixar o laudo')
                }

                return { labels, values, docs }
            } else return `Nenhum laudo cadastrado para o veículo placa ${selectedVehicle.placa}.`
        }
    }

    const clear = () => {
        document.querySelector('[name = "placa"]').value = ''
        setFilteredVehicles(oldVehicles)
        selectVehicle()
    }

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

    const handleSubmit = e => {
        let
            { empresaLaudo, ...requestElement } = stateInputs,
            errors = checkInputErrors() || []

        //***************************Check for errors*********************/
        Object.keys(stateInputs).forEach(k => {
            if (k !== 'validade' && (!stateInputs[k] || stateInputs[k] === '')) {
                let errorLabel = laudoForm.find(obj => obj.field === k).label
                errors.push(errorLabel)
            }
        })
        if (errors[0]) {
            setAlertDialog({
                ...alertDialog,
                open: true,
                msg: 'Favor verificar o preenchimento dos seguintes campos: ' + errors.toString()
            })
            return
        }

        //***************************Prepare the request Object*********************/        

        const empresa = empresasLaudo.find(e => e.empresa === empresaLaudo)
        if (empresa) requestElement.empresa_id = empresa.id
        requestElement.veiculo_id = selectedVehicle.veiculoId

        const requestBody = { table: 'laudos', requestElement }

        //*****************************Submit****************************** */

        axios.post('/api/addElement', requestBody)
            .then(() => toggleToast())
            .catch(err => console.log(err))

        if (laudoDoc) submitFiles()
    }

    const handleFiles = (files, name) => {

        if (files && files[0]) {
            let formData = new FormData()
            formData.append('fieldName', 'laudoDoc')
            formData.append('laudoId', stateInputs.id)
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
        setlaudoDoc()
        setDropDisplay('Clique ou arraste o arquivo para anexar o laudo')
        setAnchorEl(null)
        //openDialog(false)
    }

    const
        closeMenu = () => setAnchorEl(null),
        toggleAlert = () => setAlertDialog({ ...alertDialog, open: !alertDialog.open }),
        toggleToast = () => setToast(!toast)

    const selectOptions = props.redux.empresasLaudo.map(e => e.empresa)

    return (
        <Fragment>

            <LaudosTemplate
                empresas={empresas} razaoSocial={razaoSocial} selectedEmpresa={selectedEmpresa} filteredVehicles={filteredVehicles} selectedVehicle={selectedVehicle}
                anchorEl={anchorEl} stateInputs={stateInputs} selectOptions={selectOptions} dropDisplay={dropDisplay} laudoDoc={laudoDoc}
                functions={{ handleInput, clickOnPlate, formatTable, showDetails, handleFiles, handleSubmit, closeMenu, clear }}
            />
            {details && <ShowDetails
                close={showDetails}
                data={{ ...selectedVehicle, tableData: '' }}
                tab={3}
                title={'Veículo'}
                header={'- informações'}
            />}

            {alertDialog.open && <AlertDialog open={alertDialog.open} close={toggleAlert} alertType={alertDialog.type} customMessage={alertDialog.msg} />}
            <ReactToast open={toast} close={toggleToast} msg='Laudo inserido com sucesso.' />
        </Fragment >
    )
}

const collections = ['veiculos', 'empresas', 'empresasLaudo', 'laudos', 'getFiles/vehicleDocs']
export default StoreHOC(collections, Laudos)






/*
[razaoSocial, empresaInput] = useState(empresas[0].razaoSocial),
        [selectedEmpresa, setEmpresa] = useState(empresas[0]),
        [oldVehicles, setOldVehicles] = useState(veiculos[1]),
        [filteredVehicles, setFilteredVehicles] = useState([veiculos[1]]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(veiculos[1]),



[razaoSocial, empresaInput] = useState(''),
[selectedEmpresa, setEmpresa] = useState(),
[oldVehicles, setOldVehicles] = useState(),
[filteredVehicles, setFilteredVehicles] = useState([]),
[details, setDetails] = useState(false),
[selectedVehicle, selectVehicle] = useState(), */