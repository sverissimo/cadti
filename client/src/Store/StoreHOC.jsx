import React from 'react'
import humps from 'humps'
import Axios from 'axios'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData, insertData, updateData, updateCollection, deleteOne, updateDocs } from './dataActions'

import Loading from '../Layouts/Loading'
import ReactToast from '../Reusable Components/ReactToast'
import { getCookie } from '../Utils/documentCookies'
import { logUser, editUser, logUserOut } from './userActions'
import checkBlankInputs from '../Utils/checkBlankInputs'
import { checkInputErrors } from '../Utils/checkInputErrors'
import startSocket from './webSocketsClient'


export default function (requestArray, WrappedComponent) {

    let collections = []

    //Qualquer que seja o componente, essas duas coleções do Mongo devem estar presentes
    const requiredCollections = ['logs', 'parametros', 'avisos']
    requiredCollections.forEach(c => {
        if (!requestArray.includes(c))
            requestArray.push(c)
    })
    collections = requestArray.map(req => req.replace('getFiles/', '').replace('lookUpTable/', ''))

    class With extends React.Component {

        state = { confirmToast: false }
        socket;

        quitFn = e => {
            if (e.ctrlKey && e.keyCode === 17)
                this.props.logUserOut()
        }

        async componentDidMount() {
            document.addEventListener('keypress', e => this.quitFn(e))
            const { redux } = this.props
            let request = []

            requestArray.forEach(req => {
                const colName = req.replace('getFiles/', '').replace('lookUpTable/', '').replace('logs/', '')
                if (!redux[colName] || !redux[colName][0]) {
                    request.push(req)
                }
            })

            if (request[0]) {
                await this.props.getData(request)
            }

            const { user, editUser, ...dataActions } = this.props
            this.socket = startSocket({ ...dataActions, user, editUser })
        }

        componentWillUnmount() {
            document.removeEventListener('keypress', this.quitFn)
            if (this.socket?.connected) {
                this.socket.off()
                this.socket.disconnect()
                this.socket = undefined
            }
        }

        getUser = async () => {
            const request = await Axios.get('/api/users/getUser')
            const user = request?.data
            if (user) {
                this.props.logUser(user)
            }
        }

        toast = () => this.setState({ confirmToast: !this.state.confirmToast })

        render() {
            //Todo novo render verifica o localCookie. Se tiver expirado, faz o logout do usuário.
            const validSession = getCookie('loggedIn').length > 0;

            if (!validSession || this.props.redux.sessionExpired) {
                setTimeout(() => {
                    this.props.history instanceof Array && this.props.history.push('/')
                    this.props.logUserOut()
                }, 1200)
                return <ReactToast open={true} close={this.toast} msg='Sessão expirada.' status='error' />
            }
            else if (!this.props.user.name) {
                this.getUser()
            }

            //Enquanto não tiver carregado todas as collections de um determinado componente, renderiza Loading...
            collections = collections.map(c => humps.camelize(c))
            if (collections.length === 0 || !collections.every(col => this.props.redux.hasOwnProperty(col))) {
                return <Loading />
            }
            //Carregadas as collections com a devida autenticação, renderiza o componente e passa as funções de validação de campos de formulários
            else
                return <WrappedComponent {...this.props}
                    checkBlankInputs={checkBlankInputs}
                    checkInputErrors={checkInputErrors}
                />
        }
    }

    function mapStateToProps(state) {
        return {
            redux: {
                ...state.data,
            },
            user: state.user
        }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({ getData, insertData, updateData, updateCollection, deleteOne, updateDocs, logUser, editUser, logUserOut }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}