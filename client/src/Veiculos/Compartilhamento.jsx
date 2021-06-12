import React, { useEffect, useState } from 'react'
import { compartilhamentoFiles } from '../Forms/compatilhamentoFiles'
import StoreHOC from '../Store/StoreHOC'
import { handleFiles as globalHandleFiles, removeFile as deleteFiles } from '../Utils/handleFiles'
import { logGenerator } from '../Utils/logGenerator'
import CompartilhamentoTemplate from './CompartilhamentoTemplate'


const Compartilhamento = props => {

    const
        { empresas, compartilhados, veiculos } = props.redux
        , [state, setState] = useState({})
        , { demand } = state

    useEffect(() => {
        if (empresas && empresas.length === 1)
            setState({ ...state, selectedEmpresa: empresas[0], razaoSocial: empresas[0]?.razaoSocial, frota: veiculos })
        return () => void 0
    }, [empresas])

    const handleInput = async e => {
        const { name, value } = e.target

        await setState({ ...state, [name]: value })

        switch (name) {

            case 'razaoSocial':
                const selectedEmpresa = empresas.find(e => e.razaoSocial === value)
                if (selectedEmpresa) {
                    const frota = veiculos.filter(v => v.codigoEmpresa === selectedEmpresa.codigoEmpresa)
                    setState({ ...state, selectedEmpresa, frota, razaoSocial: selectedEmpresa.razaoSocial })
                }
                break

            case 'placa':
                const vehicle = veiculos.find(v => v.placa === value)
                if (vehicle)
                    setState({ ...state, ...vehicle })
                break
            case 'compartilhado':
                const compartilhado = compartilhados.find(dc => dc.razaoSocial === value)
                if (compartilhado) {
                    const { codigoEmpresa, razaoSocial } = compartilhado
                    setState({ ...state, compartilhadoId: codigoEmpresa, compartilhado: razaoSocial })
                }
                break
            default: void 0
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
            { selectedEmpresa, compartilhadoId, compartilhado, motivoCompartilhamento, info, form, veiculoId } = state,
            { codigoEmpresa } = selectedEmpresa
        let log

        //Se não houver demanda, criar demanda/log
        if (!demand) {
            log = {
                history: {
                    info: `Motivo do compartilhamento: ${motivoCompartilhamento}`,
                    motivoCompartilhamento,
                    files: form,
                    compartilhadoId,
                    compartilhado
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

    }

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
            </div>
        </>
    )
}

const collections = ['veiculos', 'empresas', 'compartilhados', 'getFiles/vehicleDocs'];

export default StoreHOC(collections, Compartilhamento)
