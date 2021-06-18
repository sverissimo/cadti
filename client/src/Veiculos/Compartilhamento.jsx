import axios from 'axios'
import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'

import CompartilhamentoTemplate from './CompartilhamentoTemplate'
import { compartilhamentoFiles } from '../Forms/compatilhamentoFiles'
import { handleFiles as globalHandleFiles, removeFile as deleteFiles } from '../Utils/handleFiles'
import { logGenerator } from '../Utils/logGenerator'
import ReactToast from '../Reusable Components/ReactToast'
import compartilhamentoForm from '../Forms/compartilhamentoForm'


const Compartilhamento = props => {

    const
        { empresas, compartilhados, veiculos, vehicleDocs } = props.redux
        , [state, setState] = useState({ confirmToast: false, compartilhadoAtual: null })
        , demand = props?.location?.state?.demand

    useEffect(() => {
        if (empresas && empresas.length === 1)
            setState({ ...state, selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos })

        if (demand?.history) {
            const
                { empresaId, veiculoId } = demand
                , { motivoCompartilhamento, compartilhado, compartilhadoId, files, compartilhamentoRemoved } = demand.history.length && demand.history[0]
                , selectedEmpresa = empresas.find(e => e.codigoEmpresa === empresaId)
                , frota = veiculos.filter(v => v.codigoEmpresa === empresaId)
                , vehicle = frota.find(v => v.veiculoId === veiculoId)

            let demandFiles
            if (files)
                demandFiles = vehicleDocs.filter(doc => files.includes(doc.id))
            setState({
                ...state, ...vehicle, selectedEmpresa, demand, demandFiles, razaoSocial: selectedEmpresa.razaoSocial,
                motivoCompartilhamento, compartilhado, compartilhadoId, compartilhamentoRemoved
            })
        }
        return () => void 0
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresas, demand])

    const handleInput = e => {
        const { name, value } = e.target

        switch (name) {
            case 'razaoSocial':
                const selectedEmpresa = empresas.find(e => e.razaoSocial === value)
                if (selectedEmpresa) {
                    const frota = veiculos.filter(v => v.codigoEmpresa === selectedEmpresa.codigoEmpresa)
                    setState({ ...state, selectedEmpresa, frota, razaoSocial: selectedEmpresa.razaoSocial, [name]: value })
                }
                else
                    setState({ ...state, [name]: value })
                break

            case 'placa':
                const
                    vehicle = veiculos.find(v => v.placa === value)
                    , compartilhadoAtual = vehicle?.compartilhado || ''

                if (vehicle)
                    setState({ ...state, ...vehicle, compartilhadoAtual, [name]: value })
                else
                    setState({ ...state, compartilhadoAtual: undefined, [name]: value })
                break

            case 'compartilhado':
                const compartilhado = compartilhados.find(dc => dc.razaoSocial === value && value !== '')
                if (compartilhado) {
                    const { codigoEmpresa, razaoSocial } = compartilhado
                    setState({ ...state, compartilhadoId: codigoEmpresa, compartilhado: razaoSocial, compartilhamentoRemoved: false, [name]: value })
                }
                else if (!value) {
                    const compartilhamentoRemoved = state.compartilhadoAtual && !value
                    setState({ ...state, compartilhadoId: undefined, compartilhado: undefined, compartilhamentoRemoved, [name]: value })
                }
                else
                    setState({ ...state, [name]: value })
                break
            default:
                setState({ ...state, [name]: value })
        }
    }

    const handleFiles = (files, name) => {
        if (files && files[0]) {
            const
                fileObj = { ...state, [name]: files[0] },
                newState = globalHandleFiles(files, fileObj, compartilhamentoFiles)
            setState({ ...state, ...newState, [name]: files[0], fileToRemove: null })
        }
    }

    const removeFile = async (name) => {
        const
            { form } = state,
            newState = deleteFiles(name, form)
        setState({ ...state, ...newState })
    }
    const createLog = ({ demand, approved }) => {
        const
            { selectedEmpresa, compartilhadoId, compartilhado, motivoCompartilhamento, info, form, veiculoId, compartilhamentoRemoved } = state,
            { codigoEmpresa } = selectedEmpresa
        let log

        //Se não houver demanda, criar demanda/log
        if (!demand) {
            const infoKey = compartilhamentoRemoved ? 'Motivo do término do compartilhamento' : 'Motivo do compartilhamento'
            log = {
                history: {
                    info: `${infoKey}: ${motivoCompartilhamento}`,
                    motivoCompartilhamento,
                    files: form,
                    compartilhadoId,
                    compartilhado,
                    compartilhamentoRemoved
                },
                metadata: { veiculoId },
                empresaId: codigoEmpresa,
                veiculoId,
                historyLength: 0,
                approved
            }
            if (approved === false)
                log.declined = true
        }


        //Se houver demand, mas for rejeitada, indeferir demanda
        if (demand && approved === false) {
            const { id, empresaId } = demand
            log = {
                id,
                empresaId,
                history: {
                    info
                },
                declined: true
            }
        }
        //Se aprovado
        if (demand && approved === true) {
            const
                { id } = demand,
                { demandFiles } = state
            log = {
                id,
                veiculoId,
                demandFiles,
                history: {},
                approved
            }
        }
        return log
    }

    const handleSubmit = approved => {

        const log = createLog({ demand, approved })
        logGenerator(log)
            .then(r => console.log(r?.data))
            .catch(err => console.log(err))

        let toastMsg

        if (approved) {
            //A string 'NULL' é interpretada no backEnd como a inteção de remover o compartilhamento
            let compartilhado_id = state.compartilhadoId
            if (!compartilhado_id)
                compartilhado_id = 'NULL'

            const
                request = axios.create({
                    baseURL: '/api',
                })
                , requestObj = {
                    table: 'veiculos',
                    tablePK: 'veiculo_id',
                    id: demand.veiculoId,
                    requestObject: { veiculo_id: demand.veiculoId, compartilhado_id }
                }
            request.put('/updateVehicle', requestObj)
                .catch(e => console.log(e))
                .then(r => console.log(r))
            toastMsg = 'Compartilhamento de veículo aprovado.'
        }
        else if (approved === false)
            toastMsg = 'Solicitação indeferida.'
        else if (!approved)
            toastMsg = 'Solicitação enviada.'

        //Refresh do state ou volta para a página de solicitações
        if (demand)
            setTimeout(() => {
                props.history.push('/solicitacoes')
            }, 1500);
        else
            setTimeout(() => { resetState() }, 900);
        toast(toastMsg)

    }
    const resetState = () => {
        const resetForm = {}
        let clearedState = {}

        compartilhamentoForm.forEach(({ field }) => {
            Object.assign(resetForm, { [field]: undefined })
        })

        //Se for só uma empresa, volta para o estado inicial (componentDidMount) para procuradores de apenas uma empresa
        if (empresas && empresas.length === 1)
            clearedState = { ...empresas[0], selectedEmpresa: empresas[0] }

        setState({
            ...resetForm, razaoSocial: '', selectedEmpresa: undefined, form: undefined,
            fileToRemove: undefined, ...clearedState, motivoCompartilhamento: ''
        })
    }

    const toast = toastMsg => setState({ ...state, confirmToast: !state.confirmToast, toastMsg })

    return (
        <>
            <div>
                <CompartilhamentoTemplate
                    redux={props.redux}
                    data={state}
                    handleInput={handleInput}
                    handleFiles={handleFiles}
                    removeFile={removeFile}
                    handleSubmit={handleSubmit}
                />
                <ReactToast open={state.confirmToast} close={toast} msg={state.toastMsg} />
            </div>
        </>
    )
}

const collections = ['veiculos', 'empresas', 'compartilhados', 'getFiles/vehicleDocs'];

export default StoreHOC(collections, Compartilhamento)
