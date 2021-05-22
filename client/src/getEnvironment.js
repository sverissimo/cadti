//@ts-check
export const getEnvironment = () => {

    if (!window.navigator.userAgent.match('Windows NT 6.2')) {
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