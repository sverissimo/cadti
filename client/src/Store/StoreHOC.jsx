import React from 'react'
import humps from 'humps'
import Axios from 'axios'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData, insertData, updateData, updateCollection, deleteOne, updateDocs } from './dataActions'

import Loading from '../Layouts/Loading'
import { configVehicleForm } from '../Forms/configVehicleForm'
import ReactToast from '../Reusable Components/ReactToast'
import { getCookie } from '../Utils/documentCookies'
import { logUser, editUser, logUserOut } from './userActions'
import { getEnvironment } from '../getEnvironment'
import checkBlankInputs from '../Utils/checkBlankInputs'
import { checkInputErrors } from '../Utils/checkInputErrors'

const socketIO = require('socket.io-client')
const { webSocketHost, options } = getEnvironment()

let socket

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

            if (request[0])
                await this.props.getData(request)

            //**************************Socket management*****************************

            if (!socket)
                socket = socketIO({ url: webSocketHost, options })

            //Conecta o usuário em um socket, passando suas informações   
            socket.on('connect', () => socket.emit('userDetails', this.props?.user))

            //********************Listen to socket events and call dataActions*********************** */
            socket.on('insertVehicle', insertedObjects => this.props.insertData(insertedObjects, 'veiculos'))
            socket.on('insertInsurance', insertedObjects => this.props.insertData(insertedObjects, 'seguros'))
            //socket.on('insertEmpresa', insertedObjects => this.props.insertData(insertedObjects, 'empresas'))
            //socket.on('insertSocios', insertedObjects => this.props.insertData(insertedObjects, 'socios'))
            socket.on('insertProcuradores', insertedObjects => this.props.insertData(insertedObjects, 'procuradores'))
            socket.on('insertElements', ({ insertedObjects, collection }) => this.props.insertData(insertedObjects, collection))

            socket.on('addElements', ({ insertedObjects, table }) => {
                const { collection } = configVehicleForm.find(el => el.table === table)
                this.props.insertData(insertedObjects, collection)
            })

            socket.on('updateVehicle', updatedObjects => this.props.updateData(updatedObjects, 'veiculos', 'veiculoId'))
            socket.on('updateInsurance', updatedObjects => this.props.updateCollection(updatedObjects, 'seguros'))
            socket.on('updateSocios', updatedObjects => this.props.updateCollection(updatedObjects, 'socios'))
            socket.on('updateProcuradores', ({ collection, data, primaryKey }) => this.props.updateData(data, collection, primaryKey))
            socket.on('updateLogs', updatedObjects => this.props.updateData(updatedObjects, 'logs', 'id'))
            socket.on('updateAny', ({ data, collection, primaryKey }) => this.props.updateData(data, collection, primaryKey))
            socket.on('updateDocs', ({ ids, metadata, collection, primaryKey }) => this.props.updateDocs(ids, metadata, collection, primaryKey))
            socket.on('updateElements', ({ collection, updatedCollection }) => this.props.updateCollection(updatedCollection, collection))
            socket.on('updateUser', updatedUser => this.props.editUser(updatedUser))

            socket.on('deleteOne', ({ id, tablePK, collection }) => {
                //console.log({ id, tablePK, collection })
                this.props.deleteOne(id, tablePK, collection)
            })

            socket.on('insertFiles', object => {
                const { insertedObjects, collection } = object
                this.props.insertData(insertedObjects, collection)
            })
        }

        componentWillUnmount() {
            document.removeEventListener('keypress', this.quitFn)
            /* if (!socket)
                socket = socketIO({ url: webSocketHost, options }) */

            if (socket?.connected) {
                socket.off()
                socket.disconnect()
                socket = undefined
            }
        }

        getUser = async () => {
            const
                request = await Axios.get('/api/users/getUser'),
                user = request?.data

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