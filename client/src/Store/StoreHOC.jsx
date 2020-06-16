import React from 'react'
import humps from 'humps'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData, insertData, updateData, updateCollection, deleteOne } from './dataActions'

import { withRouter } from 'react-router-dom'

import Loading from '../Layouts/Loading'
import { configVehicleForm } from '../Forms/configVehicleForm'

const socketIO = require('socket.io-client')
let socket

export default function (requestArray, WrappedComponent) {

    let collections = []
    collections = requestArray.map(req => req.replace('getFiles/', '').replace('lookUpTable/', '').replace('/logs/', ''))

    class With extends React.Component {

        async componentDidMount() {
            const { redux } = this.props
            let request = []

            requestArray.forEach(req => {
                const colName = req.replace('getFiles/', '').replace('lookUpTable/', '').replace('/logs/', '')
                if (!redux[colName] || !redux[colName][0]) {                    
                    request.push(req)
                }
            })
            
            if (request[0]) await this.props.getData(request)

            if (!socket) socket = socketIO()
            socket.on('insertVehicle', insertedObjects => {
                this.props.insertData(insertedObjects, 'veiculos')
            })
            socket.on('insertInsurance', insertedObjects => {
                this.props.insertData(insertedObjects, 'seguros')
            })
            socket.on('insertEmpresa', insertedObjects => {
                this.props.insertData(insertedObjects, 'empresas')
            })
            socket.on('insertSocios', insertedObjects => {
                this.props.insertData(insertedObjects, 'socios')
            })
            socket.on('insertProcuradores', insertedObjects => {
                this.props.insertData(insertedObjects, 'procuradores')
            })
            socket.on('addElements', ({ insertedObjects, table }) => {
                const { collection } = configVehicleForm.find(el => el.table === table)
                this.props.insertData(insertedObjects, collection)
            })

            socket.on('updateElements', ({ collection, updatedCollection }) => {
                this.props.updateCollection(updatedCollection, collection)
            })

            socket.on('updateVehicle', updatedObjects => {
                this.props.updateData(updatedObjects, 'veiculos', 'veiculoId')
            })
            socket.on('updateInsurance', updatedObjects => {
                this.props.updateCollection(updatedObjects, 'seguros')
            })
            socket.on('updateSocios', updatedObjects => {
                this.props.updateCollection(updatedObjects, 'socios')
            })

            socket.on('deleteOne', object => {
                const { id, tablePK, collection } = object
                this.props.deleteOne(id, tablePK, collection)
            })

            socket.on('insertFiles', object => {
                const { insertedObjects, collection } = object
                console.log(object)
                this.props.insertData(insertedObjects, collection)
            })
        }
        componentWillUnmount() {
            if (!socket) socket = socketIO(':3001')
            const clearAll = ['insertVehicle', 'insertInsurance', 'insertEmpresa', 'insertSocios', 'insertFiles',
                'insertProcuradores', 'updateVehicle', 'updateInsurance', 'updateSocios', 'deleteOne']

            clearAll.forEach(el => socket.off(el))
        }
        render() {
            const
                { redux, location } = this.props,
                { historyState } = location

            collections = collections.map(c => humps.camelize(c))
            //console.log(this.props.location, this.props.redux, collections)

            let globalState = redux
            if (historyState) globalState = Object.assign(globalState, historyState)
console.log(collections, this.props)
            if (collections.length === 0 || !collections.every(col => globalState.hasOwnProperty(col))) {
                return <Loading />
            }
            else {
                return <WrappedComponent {...this.props} />
            }
        }
    }

    function mapStateToProps(state) {
        return {
            redux: {
                ...state.data,
            }
        }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({ getData, insertData, updateData, updateCollection, deleteOne }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}
