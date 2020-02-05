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

export const insertData = (dataFromServer, collection) => dispatch => {
    const
        data = humps.camelizeKeys(dataFromServer),
        payload = { collection, data }
    dispatch({ type: 'INSERT_DATA', payload })
}

export const updateData = (dataFromServer, collection, id) => (dispatch, getState) => {
    const
        data = humps.camelizeKeys(dataFromServer),
        payload = { collection, data, id }
    dispatch({ type: 'UPDATE_DATA', payload })
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