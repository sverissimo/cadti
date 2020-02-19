import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData, insertData, updateData, updateCollection, deleteOne } from './dataActions'

import Loading from '../Utils/Loading'

const socketIO = require('socket.io-client')
let socket

export default function (requestArray, WrappedComponent) {

    let collections = []
    collections = requestArray.map(req => req.replace('getFiles/', ''))

    class With extends React.Component {

        async componentDidMount() {
            const { redux } = this.props
            let request = []
                        
            requestArray.forEach(req => {
                const colName = req.replace('getFiles/', '')
                if (!redux[colName] || !redux[colName][0]) {
                    request.push(req)
                }
            })

            if (request[0]) await this.props.getData(request)

            if (!socket) socket = socketIO(':3001')
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

            if (collections.length === 0 || !collections.every(col => this.props.redux.hasOwnProperty(col))) {
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
