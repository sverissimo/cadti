import axios from 'axios'
import humps from 'humps'
import { batch } from 'react-redux'
import { idsToString } from '../Utils/idsToString'

export const getData = (collectionsArray = []) => {
    return async (dispatch, getState) => {

        let
            promiseArray = [],
            globalState = {}

        if (collectionsArray.length > 0) {
            collectionsArray.forEach(collectionName => {
                promiseArray.push(axios.get(`/api/${collectionName}`))
            })

            await Promise.all(promiseArray)
                .then(res => res.map(r => humps.camelizeKeys(r.data)))
                .then(responseArray => {
                    responseArray.forEach((el, i) => {
                        let key = collectionsArray[i]
                            .replace('getFiles/', '')
                            .replace('lookUpTable/', '')
                            .replace('logs/', '')
                        key = humps.camelize(key)

                        Object.assign(globalState, { [key]: el })
                    })
                })
                .catch(err => {
                    console.log(err?.response?.data)
                    globalState = { ...globalState, sessionExpired: true }
                })
        }
        //Pega os nomes dos equipamentos e itens de acessibilidade a partir do ID
        if (['acessibilidade', 'equipamentos'].every(p => globalState.hasOwnProperty(p))) {
            const { acessibilidade, equipamentos } = globalState

            let veiculos = globalState.veiculos || getState().data?.veiculos
            const updatedData = idsToString(veiculos, equipamentos, acessibilidade)
            globalState.veiculos = updatedData
        }

        //Add Laudos e empresasLaudo na tabela de veículos (para desonerar o servidor backEnd)
        //Se houver mais de um laudo para o mesmo veículo, pega o com maior data de validade, pois o order da query laudos é por validade DESC
        if (globalState.veiculos && globalState.veiculos.length && collectionsArray.includes('laudos')) {

            const laudos = globalState.laudos || []

            for (let v of globalState.veiculos) {
                for (let l of laudos) {
                    if (v.veiculoId === l.veiculoId) {
                        v.numeroLaudo = l.id
                        v.empresaLaudo = l.empresaLaudo
                        v.vencimentoLaudo = l.validade
                    }
                }
            }
        }

        dispatch({
            type: 'GET_DATA',
            payload: globalState
        })
    }
}

export const insertData = (dataFromServer, collection) => (dispatch, getState) => {

    const data = humps.camelizeKeys(dataFromServer)
    const payload = { collection, data }
    const seguradoras = getState().data.seguradoras

    console.log("🚀 ~ file: dataActions.js:72 ~ insertData ~ data:", data)

    if (!seguradoras) {
        dispatch({ type: 'INSERT_DATA', payload })
        return
    }

    if (collection === 'veiculos' && data[0]) {

        const { acessibilidade, equipamentos } = getState().data
        let
            eqNames = [],
            acNames = []

        if (data[0]?.equipamentosId) {
            data[0].equipamentosId.forEach(eqId => {
                equipamentos.forEach(({ id, item }) => {
                    if (eqId.toString() === id.toString()) eqNames.push(item)
                })
            })
        }
        if (data[0]?.acessibilidadeId) {
            data[0].acessibilidadeId.forEach(acId => {
                acessibilidade.forEach(({ id, item }) => {
                    if (acId.toString() === id.toString()) {
                        acNames.push(item)
                    }
                })
            })
        }
        data[0].equipamentos = eqNames
        data[0].acessibilidade = acNames
    }

    if (collection === 'seguros' && data[0] && data[0].placas && data[0].placas.length === 1) {

        const seguradora = seguradoras.find(sg => sg.id === data[0].seguradoraId)
        let
            seguro = data[0],
            plates = [], vehicles = [],
            veiculos = getState().data.veiculos,

            updatedCollection = veiculos.map(v => {
                if (v.apolice === seguro.apolice) {
                    v.seguradora = seguradora.seguradora
                    v.dataEmissao = seguro.dataEmissao
                    v.vencimento = seguro.vencimento
                }
                return v
            })

        veiculos.forEach(v => {
            if (v.apolice === seguro.apolice) {
                plates.push(v.placa)
                vehicles.push(v.veiculoId)
            }
        })
        seguro.placas = plates
        seguro.veiculos = vehicles
        seguro = [seguro]

        const collectionPayload = { data: updatedCollection, collection: 'veiculos' }
        batch(() => {
            dispatch({ type: 'INSERT_DATA', payload: { data: seguro, collection: 'seguros' } })
            dispatch({ type: 'UPDATE_COLLECTION', payload: collectionPayload })
        })
    }
    else dispatch({ type: 'INSERT_DATA', payload })
}

export const updateData = (dataFromServer, collection, id) => (dispatch, getState) => {

    //Se a collection for vehicleDocs, o que vem do servidor são os ids
    let data = humps.camelizeKeys(dataFromServer)
    id = humps.camelize(id)

    const { equipamentos, acessibilidade } = getState().data
    if (collection === 'veiculos' && equipamentos && acessibilidade) {
        data = idsToString(data, equipamentos, acessibilidade)
    }

    const payload = { collection, data, id }

    dispatch({ type: 'UPDATE_DATA', payload })
    return
}

export const updateDocs = (data, collection, primaryKey = 'id') => (dispatch, getState) => {
    const { ids, metadata } = data
    const stateCollection = getState().data[collection]

    if (ids && ids[0] && metadata) {
        const selectedDocs = stateCollection.filter(doc => ids.includes(doc[primaryKey]))

        selectedDocs.forEach(doc => {
            const meta = Object.assign({}, doc?.metadata, metadata)
            doc.metadata = meta
        })

        const payload = { collection, data: selectedDocs, id: primaryKey }
        dispatch({ type: 'UPDATE_DATA', payload })
    }
}

export const updateInsurance = ({ value, ids }) => (dispatch, getState) => {
    const
        apolice = value,
        seguros = getState().data.seguros,
        veiculos = getState().data.veiculos

    if (!seguros || !veiculos) return

    let seguro = seguros.find(s => s.apolice === apolice),
        placas = seguro.placas || [], vehicleIDs = seguro.veiculos || []

    veiculos.forEach(v => {
        ids.forEach(id => {
            if (v.veiculoId === id) {
                placas.push(v.placa)
                vehicleIDs.push(v.veiculoId)
            }
        })
    })

    seguro.placas = placas
    seguro.veiculos = vehicleIDs
    seguro = [seguro]

    const payload = { collection: 'seguros', data: seguro, id: 'apolice' }
    dispatch({ type: 'UPDATE_DATA', payload })
}

export const removeInsurance = (apolice, placaIndex, vehicleIndex) => dispatch => {

    dispatch({
        type: 'REMOVE_FROM_INSURANCE',
        payload: { apolice, placaIndex, vehicleIndex }
    })
}

export const deleteOne = (id, tablePK, collection) => dispatch => {
    tablePK = humps.camelize(tablePK)
    const payload = { id, tablePK, collection }

    dispatch({
        type: 'DELETE_ONE',
        payload
    })
}
