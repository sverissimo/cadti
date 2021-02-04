import { deleteCookie } from "../Utils/documentCookies"

export const logUser = user => {
    return dispatch => {
        dispatch({
            type: 'LOG_USER',
            payload: user
        })
    }
}

export const logUserOut = b => {
    return async (dispatch, getState) => {
        /* const socketId = getState()?.user.socketId
        console.log(socketId, b)
        let socket
        if (!socket)
            socket = socketIO()
        console.log("🚀 ~ file: userActions.js ~ line 20 ~ return ~ socket", socket)

        socket.emit('forceDisconnect', socketId) */
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
