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

export const updateData = collectionName => async (dispatch, getState) => {
    console.log(collectionName)
    axios.get(`/api/${collectionName}`)
        .then(res => humps.camelizeKeys(res.data))
        .then(response => {
            dispatch({
                type: 'UPDATE_VEHICLE',
                payload: response
            })
        })
}
