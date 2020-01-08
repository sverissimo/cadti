import axios from 'axios';
import humps from 'humps'

export const getData = async (collectionsArray = []) => {

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
    
    const { empresas, seguros, seguradoras, ...veic} = returnObj
    console.log(veic)
    
    return {
        type: 'GET_DATA',
        payload: returnObj
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