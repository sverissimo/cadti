//@ts-check
export const getEnvironment = () => {

    if (window.location.hostname === 'localhost') {
        return {
            env: 'development',
            webSocketHost: 'ws://localhost:3001'
        }
    }
    else {
        return {
            env: 'production',
            webSocketHost: 'ws://200.198.42.167'
        }
    }
}