import React, { useState, useEffect, useCallback, Fragment } from 'react'
import axios from 'axios'
import StoreHOC from '../Store/StoreHOC'

import AlertDialog from '../Utils/AlertDialog'
import ReactToast from '../Utils/ReactToast'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'

import { checkInputErrors } from '../Utils/checkInputErrors'
import LaudosTemplate from './LaudosTemplate'
import ShowDetails from '../Reusable Components/ShowDetails'
import { laudoForm } from '../Forms/laudoForm'
import { laudosTable } from '../Forms/laudosTable'

const Laudos = props => {

    const
        { veiculos, empresas, empresasLaudo, laudos, vehicleDocs } = props.redux

    const initState = Object.freeze({
        dropDisplay: 'Clique ou arraste o arquivo para anexar o laudo',
        stateInputs: {
            id: undefined,
            validade: '',
            empresaLaudo: ''
        }
    })

    const
        [razaoSocial, empresaInput] = useState(''),
        [selectedEmpresa, setEmpresa] = useState(),
        [oldVehicles, setOldVehicles] = useState(),
        [filteredVehicles, setFilteredVehicles] = useState([]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(),
        [anchorEl, setAnchorEl] = useState(null),
        [dropDisplay, setDropDisplay] = useState(initState.dropDisplay),
        [laudoDoc, setLaudoDoc] = useState(),
        [toast, setToast] = useState(false),
        [stateInputs, changeInputs] = useState({ ...initState.stateInputs }),
        [table, setTableData] = useState(),
        [alertDialog, setAlertDialog] = useState({
            open: false,
            type: 'inputError',
            msg: '',
        }),
        [confirmDialogProps, setConfirmDialog] = useState({
            open: false,
            type: 'delete',
            element: undefined,
        })

    useEffect(() => {
        const escFunction = e => { if (e.keyCode === 27) setDetails(false); setAnchorEl(null) }
        document.addEventListener('keydown', escFunction)
    }, [])

    useEffect(() => {
        async function insertLaudos() {
            if (selectedEmpresa && selectedEmpresa !== '') {
                const
                    currentYear = new Date().getFullYear(),
                    frota = veiculos.filter(v => v.empresa === selectedEmpresa.razaoSocial),
                    oldVehicles = frota.filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null).sort((a, b) => a.placa.localeCompare(b.placa))

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
                await setOldVehicles(vehiclesLaudo)
                await setFilteredVehicles(vehiclesLaudo)

                if (selectedVehicle && vehiclesLaudo?.length > 0) {
                    const updatedVehicle = vehiclesLaudo.find(v => v.veiculoId === selectedVehicle.veiculoId)
                    if (updatedVehicle?.laudos?.length !== selectedVehicle?.laudos?.length) {
                        selectVehicle(updatedVehicle)
                    } else return
                }
            } else {
                setOldVehicles()
                setFilteredVehicles([])
                setEmpresa()
            }
        }

        insertLaudos()
    }, [selectedEmpresa, veiculos, laudos, selectedVehicle])


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

    const clickOnPlate = async event => {

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

    useEffect(() => {
        if (selectedVehicle) {
            if (selectedVehicle.laudos && selectedVehicle.laudos[0]) {

                const { laudos } = selectedVehicle,
                    laudoDocs = vehicleDocs.filter(d => d.metadata.fieldName === 'laudoDoc')

                let laudosArray = [], tableHeaders = [], tempArray = [], table2 = [...laudosTable]

                laudos.forEach(l => {
                    table2.forEach(t => {
                        let laudoDocId
                        const laudoDoc = laudoDocs.find(d => d.metadata.laudoId === l.id)

                        if (laudoDoc) laudoDocId = laudoDoc.id
                        if (!tableHeaders.includes(t.title)) tableHeaders.push(t.title)
                        const { title, ...tableData } = t

                        if (t.field === 'laudoDoc') tempArray.push({ ...tableData, value: l[t.field], laudoDocId })
                        else tempArray.push({ ...tableData, value: l[t.field] })
                    })

                    if (tempArray[4].laudoDocId) tempArray[4].value = 'Clique para visualizar o laudo'
                    else tempArray[4].value = 'Nenhum arquivo encontrado'
                    laudosArray.push(tempArray)
                    tempArray = []
                })

                table2 = [...laudosTable]
                setTableData({ tableHeaders, laudosArray, laudoDocs })

            } else setTableData(`Nenhum laudo cadastrado para o veículo placa ${selectedVehicle.placa}.`)
        }

    }, [selectedVehicle, laudos, vehicleDocs])

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

    const handleSubmit = async () => {
        let
            { empresaLaudo, ...requestElement } = stateInputs,
            errors = checkInputErrors() || []

        //***************************Check for errors*********************/

        const laudoAlreadyExists = laudos.find(l => l.id === stateInputs.id)
        if (laudoAlreadyExists) {
            setAlertDialog({
                ...alertDialog,
                open: true,
                msg: 'O laudo informado já existe no sistema. Laudo nº ' + laudoAlreadyExists.id.toString()
            })
            clearForm()
            return
        }
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
            clearForm()
            return
        }

        //***************************Prepare the request Object*********************/
        const empresa = empresasLaudo.find(e => e.empresa === empresaLaudo)
        if (empresa) requestElement.empresa_id = empresa.id
        requestElement.veiculo_id = selectedVehicle.veiculoId

        const requestBody = { table: 'laudos', requestElement }

        //*****************************Submit****************************** */
        await axios.post('/api/addElement', requestBody)
            .then(() => toggleToast())
            .catch(err => console.log(err))

        if (laudoDoc) await axios.post('/api/vehicleUpload', laudoDoc)
        clearForm('Clear all Of It!!!')
    }

    const handleFiles = (files, name) => {

        if (files && files[0]) {
            let formData = new FormData()
            formData.append('fieldName', 'laudoDoc')
            formData.append('laudoId', stateInputs.id)
            formData.append('veiculoId', selectedVehicle.veiculoId)
            formData.append(name, files[0])
            setLaudoDoc(formData)
            setDropDisplay(files[0].name)
        }
    }

    function confirmDelete(laudoId) {
        setConfirmDialog({
            ...confirmDialogProps, open: true,
            element: `laudo nº ${laudoId}`,
            laudoId
        })
    }

    function deleteLaudo(laudoId) {
        if (laudoId) {
            closeConfirmDialog()
            const laudoDoc = vehicleDocs.find(d => d.metadata.fieldName === 'laudoDoc' && d.metadata.laudoId === laudoId.toString())
            axios.delete(`/api/delete?table=laudos&tablePK=id&id='${laudoId}'`)
                .then(({ data }) => console.log(data))

            if (laudoDoc) axios.delete(`/api/deleteFile?collection=vehicleDocs&id=${laudoDoc?.id}`)
                .then(({ data }) => console.log(data))
        }
    }

    const
        closeMenu = () => setAnchorEl(null),
        toggleAlert = () => setAlertDialog({ ...alertDialog, open: !alertDialog.open }),
        toggleToast = () => setToast(!toast),
        closeConfirmDialog = () => setConfirmDialog({ ...confirmDialogProps, open: false }),

        clearForm = allFields => {
            if (allFields) changeInputs({ ...initState.stateInputs })
            setLaudoDoc()
            setDropDisplay(initState.dropDisplay)
        }

    const selectOptions = props.redux.empresasLaudo.map(e => e.empresa)

    return (
        <Fragment>

            <LaudosTemplate
                empresas={empresas} razaoSocial={razaoSocial} selectedEmpresa={selectedEmpresa} filteredVehicles={filteredVehicles} selectedVehicle={selectedVehicle}
                anchorEl={anchorEl} stateInputs={stateInputs} selectOptions={selectOptions} dropDisplay={dropDisplay} laudoDoc={laudoDoc} table={table}
                functions={{ handleInput, clickOnPlate, showDetails, handleFiles, handleSubmit, closeMenu, clear, deleteLaudo: confirmDelete }}
            />
            {details && <ShowDetails
                close={showDetails}
                data={{ ...selectedVehicle, tableData: '' }}
                tab={3}
                title={'Veículo'}
                header={'- informações'}
            />}

            {confirmDialogProps.open && <ConfirmDialog {...confirmDialogProps} close={closeConfirmDialog} confirm={deleteLaudo} id={confirmDialogProps.laudoId} />}

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
        [oldVehicles, setOldVehicles] = useState(veiculos[0]),
        [filteredVehicles, setFilteredVehicles] = useState([veiculos[0]]),
        [details, setDetails] = useState(false),
        [selectedVehicle, selectVehicle] = useState(veiculos[0]),



[razaoSocial, empresaInput] = useState(''),
[selectedEmpresa, setEmpresa] = useState(),
[oldVehicles, setOldVehicles] = useState(),
[filteredVehicles, setFilteredVehicles] = useState([]),
[details, setDetails] = useState(false),
[selectedVehicle, selectVehicle] = useState(), */