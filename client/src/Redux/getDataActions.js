import axios from 'axios';
import humps from 'humps'

export const getVehicleData = async () => {

    const modelosChassi = axios.get('/api/modelosChassi')
    const carrocerias = axios.get('/api/carrocerias')
    const veiculos = axios.get('/api/veiculos')
    const empresas = axios.get('/api/empresas')
    const seguradoras = axios.get('/api/seguradoras')
    const seguros = axios.get('/api/seguros')
    const equipamentos = axios.get('/api/equipa')

    let returnObj = {}

    await Promise.all([modelosChassi, carrocerias, veiculos, empresas, seguradoras, seguros, equipamentos])
        .then(res => res.map(r => humps.camelizeKeys(r.data)))
        .then(([modelosChassi, carrocerias, veiculos, empresas, seguradoras, seguros, equipamentos]) => {
            Object.assign(returnObj, {
                modelosChassi, carrocerias, veiculos, empresas, seguradoras, equipamentos,
                seguros, allInsurances: seguros
            })
        })
        .catch(err => console.log(err))
    return {
        type: 'VEHICLE_FULL_DATA',
        payload: returnObj
    }
}

export const veiculosInit = async (collectionsArray = []) => {

    let promiseArray = [], returnObj = {}

    if (collectionsArray.length > 0) {
        collectionsArray.forEach(collectionName => {
            promiseArray.push(axios.get(`/api/${collectionName}`))
        })

        await Promise.all(promiseArray)
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(responseArray => {
                responseArray.forEach((el, i) => {
                    Object.assign(returnObj, { [collectionsArray[i]]: el })
                })
            })
    }

    return {
        type: 'VEICULOS_INIT',
        payload: returnObj
    }
}



/* let veiculos

await axios.get('/api/veiculos')
    .then(res => veiculos = humps.camelizeKeys(res.data))
    .catch(err => console.log(err))

return {
    type: 'VEHICLE_INIT',
    payload: veiculos
}
 */
/*
    const request = axios.get('/api/showEmpreend')
        .then(res => {
            return res.data
        })
        .catch(err => {
            console.log(err)
            toastr.error('Erro', err.toString(), 'Erro'); logout(false)
        })
    return {
        type: 'LOAD_EMP_DATA',
        payload: request
    }
}

export function loadFilesData() {

const request = axios.get('/api/files')
    .then(res => res.data)
    .catch(err => {
        console.log(err)
        toastr.error('Erro', err.toString(), 'Erro'); logout(false)
    })
return {
    type: 'LOAD_FILES_DATA',
    payload: request
}
};


export const setColor = () => {

const array = ['rgb(104, 119, 133)', 'rgb(84, 104, 102)', 'rgb(105, 117, 153)',
    'rgb(88, 103, 88)', 'rgb(117, 116, 101)', 'rgb(117, 117, 137)']
let color = array[Math.floor(Math.random() * array.length)]
return {
    type: 'SET_COLOR',
    payload: color
}
}

export const loading = (on) => {
return {
    type: 'LOADING',
    payload: on
}
*/