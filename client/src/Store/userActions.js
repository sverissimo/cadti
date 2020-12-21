import { deleteCookie } from "../Utils/documentCookies"

export const logUser = user => {
    return dispatch => {
        dispatch({
            type: 'LOG_USER',
            payload: user
        })
    }
}

export const logUserOut = () => {
    return async dispatch => {
        await fetch('/auth/logout', { method: 'GET', credentials: 'same-origin' })            
            .then(r => {                
                deleteCookie('loggedIn')
                return
            })
            .catch(err => console.log(err))

        dispatch({
            type: 'LOG_USER_OUT'
        })
    }
}