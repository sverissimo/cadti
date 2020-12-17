import { deleteCookie } from "../Utils/documentCookies"

const logout = () => {
    fetch('/auth/logout', { method: 'GET', credentials: 'same-origin' })
        .then(r => {
            console.log(r.json())
            deleteCookie('loggedIn')
            return
        })
        .catch(err => console.log(err))
}

export default logout