export const logUser = user => {
    return dispatch => {
        dispatch({
            type: 'LOG_USER',
            payload: user
        })
    }
}

export const logUserOut = () => {
    return dispatch => {
        dispatch({
            type: 'LOG_USER_OUT',
            payload: undefined
        })
    }
}