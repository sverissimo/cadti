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
            webSocketHost: 'ws://www.cadti.mg.gov.br:80'
        }
    }
}