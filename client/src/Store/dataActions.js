import axios from 'axios'
import humps from 'humps'

export const getData = (collectionsArray = []) => {
    return async (dispatch, getState) => {

        let promiseArray = [], returnObj = {}
        if (collectionsArray.length > 0) {
            collectionsArray.forEach(collectionName => {
                promiseArray.push(axios.get(`/api/${collectionName}`))
            })

            await Promise.all(promiseArray)
                .then(res => res.map(r => humps.camelizeKeys(r.data)))
                .then(responseArray => {
                    responseArray.forEach((el, i) => {
                        let key = collectionsArray[i]
                        if (key.includes('getFiles')) key = collectionsArray[i].replace('getFiles/', '')
                        Object.assign(returnObj, { [key]: el })
                    })
                })
        }
        dispatch({
            type: 'GET_DATA',
            payload: returnObj
        })
    }
}

export const updateData = (data, collection) => async (dispatch, getState) => {
    
    const payload = humps.camelizeKeys(data)
    console.log(data, collection, payload)
    let type

    switch (collection) {
        case 'veiculos':
            type = 'UPDATE_VEHICLE'
            break
        case 'seguros':
            type = 'UPDATE_INSURANCE'
            break
        default: void 0
    }
    dispatch({ type, payload })
}

export const updateCollection = (data, collection) => dispatch => {
    const payload = { data, collection }
    dispatch({
        type: 'UPDATE_COLLECTION',
        payload
    })
}

export const removeInsurance = (apolice, placaIndex, vehicleIndex) => dispatch => {

    dispatch({
        type: 'REMOVE_FROM_INSURANCE',
        payload: { apolice, placaIndex, vehicleIndex }
    })
}

export const deleteOne = (collection, index) => dispatch => {
    dispatch({
        type: 'DELETE_ONE',
        payload: { collection, index }
    })
}