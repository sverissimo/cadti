const userReducer = (state = {}, action) => {
    const { type, payload } = action
    switch (type) {
        case ('LOG_USER'):
            return {
                ...state, user: payload
            }
        case ('LOG_USER_OUT'):
            return {
                ...state, user: payload
            }
        default:
            return state
    }
}

export default userReducer