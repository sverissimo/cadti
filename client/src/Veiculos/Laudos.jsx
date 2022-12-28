import React, { useState, useEffect, useCallback, Fragment } from 'react'
import axios from 'axios'

import StoreHOC from '../Store/StoreHOC'

import AlertDialog from '../Reusable Components/AlertDialog'
import ReactToast from '../Reusable Components/ReactToast'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'

import { checkInputErrors } from '../Utils/checkInputErrors'
import LaudosTemplate from './LaudosTemplate'
import ShowDetails from '../Reusable Components/ShowDetails'
import { laudoForm } from '../Forms/laudoForm'
import { laudosTable } from '../Forms/laudosTable'
import { logGenerator } from '../Utils/logGenerator'
import { setDemand } from '../Utils/setDemand'
import { sizeExceedsLimit } from '../Utils/handleFiles'
import { checkDemand } from '../Utils/checkDemand'

let i = 1 //prevent more than 1 re-render in specific functions/conditions

const Laudos = props => {
    const
        { user } = props,
        { veiculos, empresas, empresasLaudo, laudos, vehicleDocs, logs } = props.redux,
        demand = props?.location?.state?.demand

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
        [stateInputs, changeInputs] = useState({ ...initState.stateInputs }),
        [toast, setToast] = useState(false),
        [toastMsg, setToastMsg] = useState('Laudo enviado para aprovação.'),
        [table, setTableData] = useState(),
        [demandFiles, setDemandFiles] = useState(),
        [fileToRemove, setFileToRemove] = useState(),
        [showPendencias, setShowPendencias] = useState(false),
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

    //Se o usuário representa apenas uma empresa, seleciona a empresa e carrega os dados
    if (empresas && empresas.length === 1 && i === 1) {
        i++
        setEmpresa(empresas[0])
        empresaInput(empresas[0]?.razaoSocial)
    }

    useEffect(() => {                               //Set esc key to close details window
        const escFunction = e => { if (e.keyCode === 27) setDetails(false); setAnchorEl(null) }
        document.addEventListener('keydown', escFunction)
        //, frota: veiculos
    }, [])

    //Se tiver demanda/solicitação, carregar os dados
    if (demand && i === 1) {
        i++
        const
            { history } = demand,
            state = {},
            fullDemand = setDemand(demand, props.redux),
            empresa = fullDemand.selectedEmpresa,
            dFiles = fullDemand.demandFiles,
            { originalVehicle } = fullDemand

        Object.entries(history[0]).forEach(([k, v]) => {            // Set state with demandState
            if (stateInputs.hasOwnProperty(k))
                state[k] = v
        })

        setEmpresa(empresa)
        empresaInput(empresa.razaoSocial)
        changeInputs(state)
        setDemandFiles(dFiles)
        selectVehicle(originalVehicle)
    }

    useEffect(() => {

        const insertLaudos = () => {
            if (selectedEmpresa && selectedEmpresa !== '') {
                // Estabelece quais são os veículos 15+anos (oldVehicles)
                const
                    currentYear = new Date().getFullYear(),
                    frota = veiculos.filter(v => v.empresa === selectedEmpresa.razaoSocial),
                    oldVehicles = frota.filter(v => currentYear - v.anoCarroceria > 15 && v.anoCarroceria !== null).sort((a, b) => a.placa.localeCompare(b.placa))

                //Acrescenta os laudos atualizados para cada veículo 15+anos (oldVehicles)
                let vehiclesLaudo = []
                oldVehicles.forEach(v => {
                    const vehicleLaudos = laudos.filter(l => l.veiculoId === v.veiculoId)
                    vehiclesLaudo.push({ ...v, laudos: vehicleLaudos })
                })

                setOldVehicles(vehiclesLaudo)
                setFilteredVehicles(vehiclesLaudo)

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
        const
            { id } = event.currentTarget,
            demandExists = checkDemand(id, logs)

        if (demandExists) {
            alert('Solicitação de cadastro do laudo já realizada para este veículo.')
            return
        }

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

    //Cria os cabeçalhos, linhas e células da tabela que exibe os laudos
    useEffect(() => {
        if (selectedVehicle && !demand) {
            if (selectedVehicle.laudos && selectedVehicle.laudos[0]) {

                const
                    vehicleLaudos = selectedVehicle?.laudos,
                    laudoDocs = vehicleDocs.filter(d => d.metadata.fieldName === 'laudoDoc')


                let laudosArray = [], tableHeaders = [], tempArray = [], table2 = [...laudosTable]

                //Remove a opção de apagar se o usuário não for admin (é o último objeto de laudosTable, de onde veio)
                if (user.role === 'empresa')
                    table2.pop()

                vehicleLaudos.forEach(l => {
                    table2.forEach(t => {
                        let fileId

                        // eslint-disable-next-line eqeqeq
                        const laudoDoc = laudoDocs.find(d => d?.metadata?.laudoId == l?.id)
                        if (laudoDoc)
                            fileId = laudoDoc.id

                        if (!tableHeaders.includes(t.title))
                            tableHeaders.push(t.title)

                        const { title, ...tableData } = t

                        if (t.field === 'laudoDoc')
                            tempArray.push({ ...tableData, value: l[t.field], fileId })
                        else
                            tempArray.push({ ...tableData, value: l[t.field] })
                    })

                    if (tempArray[4].fileId) tempArray[4].value = 'Clique para visualizar o laudo'
                    else tempArray[4].value = 'Nenhum arquivo encontrado'
                    laudosArray.push(tempArray)
                    tempArray = []
                })

                table2 = [...laudosTable]
                setTableData({ tableHeaders, arrayOfRows: laudosArray, docs: laudoDocs })

            } else setTableData(`Nenhum laudo cadastrado para o veículo placa ${selectedVehicle.placa}.`)
        }
    }, [selectedVehicle, laudos, vehicleDocs, demand, user.role])

    useEffect(() => {
        i = 1
        void 0
    }, [])

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

    const handleSubmit = async approved => {
        const
            empresaId = selectedEmpresa?.codigoEmpresa,
            veiculoId = selectedVehicle?.veiculoId
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
                let errorLabel = laudoForm.find(obj => obj.field === k)?.label
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

        //***************************Prepare the Log *********************/
        if (approved === undefined) {

            const history = {
                ...stateInputs
            },
                log = {
                    empresaId,
                    veiculoId,
                    history,
                    historyLength: 0,
                    metadata: {
                        fieldName: 'laudoDoc',
                        veiculoId
                    },
                }

            if (laudoDoc)
                log.history.files = laudoDoc

            logGenerator(log)
                .then(r => console.log(r?.data))
            clearForm('all fields, reset state please!')
            removeFile('laudoDoc')
            toggleToast()

            setTimeout(() => { clear() }, 1200);
            return
        }

        if (approved === false) {
            const log = {
                id: demand.id,
                empresaId,
                history: {
                    info: stateInputs?.info
                },
                declined: true
            }
            logGenerator(log)
                .then(r => console.log(r))
            setToastMsg('Solicitação indeferida!')
            toggleToast()

            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        }

        if (approved === true) {
            //Prepare the request Object
            const
                empresa = empresasLaudo.find(e => e.empresa === empresaLaudo)

            let laudoId
            if (empresa)
                requestElement.empresa_id = empresa.id  //Esse é id da empresa que emite o laudo
            requestElement.veiculo_id = veiculoId
            requestElement.codigo_empresa = empresaId    // Esse é o código da empresa/delegatário

            await axios.post('/api/laudos', requestElement)
                .then(r => {
                    laudoId = r?.data[0]?.id
                    console.log(r.data)
                })
                .catch(err => console.log(err))

            //Record the log
            const log = {
                id: demand.id,
                veiculoId,
                demandFiles,
                history: {},
                metadata: {
                    laudoId,
                    tempFile: 'false'
                },
                approved
            }
            logGenerator(log)
                .then(r => console.log(r.data))

            //Toast cofirmation, clear State and redirect to Solicitacoes
            setTimeout(() => { props.history.push('/solicitacoes') }, 1500);
            setToastMsg('Laudo aprovado!')
            toggleToast()
            clearForm('Clear all Of It!!!')
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

        const
            { veiculoId } = selectedVehicle,
            { codigoEmpresa } = selectedEmpresa

        if (laudoId) {
            closeConfirmDialog()

            axios.delete(`/api/delete?table=laudos&tablePK=id&id=${laudoId}&veiculoId=${veiculoId}&codigoEmpresa=${codigoEmpresa}`)
                .then(({ data }) => console.log(data))

            const laudoDoc = vehicleDocs.find(d => d.metadata.fieldName === 'laudoDoc' && d.metadata.laudoId === laudoId.toString())
            if (laudoDoc) axios.delete(`/api/deleteFile?collection=vehicleDocs&id=${laudoDoc?.id}&codigoEmpresa=${codigoEmpresa}`)
                .then(({ data }) => console.log(data))
        }
    }

    const handleFiles = (files, name) => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        if (files && files[0]) {
            let formData = new FormData()
            formData.append('fieldName', 'laudoDoc')
            formData.append('laudoId', stateInputs.id)
            formData.append('veiculoId', selectedVehicle.veiculoId)
            formData.append(name, files[0])
            setLaudoDoc(formData)
            setFileToRemove(undefined)
            //  setDropDisplay(files[0].name)
        }
    }

    const removeFile = async name => {
        setFileToRemove(name)
        setLaudoDoc(undefined)
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
            /*    setOldVehicles()
               setFilteredVehicles() */
        }

    const selectOptions = props.redux.empresasLaudo.map(e => e.empresa)

    return (
        <Fragment>
            <LaudosTemplate
                empresas={empresas} razaoSocial={razaoSocial} selectedEmpresa={selectedEmpresa} filteredVehicles={filteredVehicles} selectedVehicle={selectedVehicle}
                anchorEl={anchorEl} stateInputs={stateInputs} selectOptions={selectOptions} dropDisplay={dropDisplay} laudoDoc={laudoDoc} table={table}
                demand={demand} demandFiles={demandFiles} showPendencias={showPendencias} fileToRemove={fileToRemove}
                functions={{
                    handleInput, clickOnPlate, showDetails, handleFiles, handleSubmit, closeMenu, clear, removeFile,
                    setShowPendencias, deleteLaudo: confirmDelete
                }}
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
            <ReactToast open={toast} close={toggleToast} msg={toastMsg} />
        </Fragment >
    )
}

const collections = ['veiculos', 'empresas', 'empresasLaudo', 'laudos', 'getFiles/vehicleDocs']
export default StoreHOC(collections, Laudos)
