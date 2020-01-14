import axios from 'axios';
import humps from 'humps'
import { batch } from 'react-redux'

export const getData = async (collectionsArray = []) => {
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
        
        batch(() => {
            dispatch({
                type: 'GET_DATA',
                payload: returnObj
            })
           /*  dispatch({
                type: 'VEHICLE_DATA',
                payload: veic
            }) */
        })
    }


}

/*
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