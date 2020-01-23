import axios from 'axios'
import humps from 'humps'

export const updateData = collectionName => async (dispatch, getState) => {
    console.log(collectionName)
    axios.get(`/api/${collectionName}`)
        .then(res => humps.camelizeKeys(res.data))
        .then(response => {
            console.log(response)
            dispatch({
                type: 'UPDATE_SOCIO',
                payload: response
            })
        })





    /* let socios = [...getState().vehicleData.socios]

    const updatedSocio = humps.camelizeKeys(receivedData[0])

    const oldSocio = socios.find(v => v.socioId === updatedSocio.socioId)
    const index = socios.indexOf(oldSocio)

    console.log(updatedSocio)
    socios[index] = updatedSocio

    dispatch({
        type: 'UPDATE_SOCIO',
        payload: socios
    }) */




    /* let veiculos = [...getState().vehicleData.veiculos]

    const updatedVehicle = humps.camelizeKeys(receivedData[0])

    const oldVehicle = veiculos.find(v => v.veiculoId === updatedVehicle.veiculoId)
    const index = veiculos.indexOf(oldVehicle)

    console.log(updatedVehicle)
    veiculos[index] = updatedVehicle

    dispatch({
        type: 'UPDATE_VEHICLE',
        payload: veiculos
    }) */


}
