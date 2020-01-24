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

export const updateData = updatedObject => async (dispatch, getState) => {
    const payload = humps.camelizeKeys(updatedObject[0])
    dispatch({
        type: 'UPDATE_VEHICLE',
        payload
    })
}

export const updateStateData = updatedCollection => dispatch => {
    const payload = updatedCollection    
    dispatch({
        type: 'UPDATE_STATE_DATA',
        payload
    })
}
