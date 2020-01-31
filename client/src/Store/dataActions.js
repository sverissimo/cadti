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

export const updateData = data => async (dispatch, getState) => {
    const { updatedObject, collection } = data
    const payload = humps.camelizeKeys(updatedObject)
    let type
    console.log(payload)
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

export const updateStateData = updatedCollection => dispatch => {
    const payload = updatedCollection
    dispatch({
        type: 'UPDATE_STATE_DATA',
        payload
    })
}
