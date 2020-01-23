import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData } from '../Redux/getDataActions'
import { updateData } from '../Redux/updateDataActions'

import Loading from '../Utils/Loading'

const socketIO = require('socket.io-client')
let socket

export default function (requestArray = [], WrappedComponent) {

    let collections = []

    class With extends React.Component {

        async componentDidMount() {
            const { redux } = this.props

            let request = []
            requestArray.forEach(req => {
                const colName = req.replace('getFiles/', '')
                if (!redux[colName] || !redux[colName][0]) {
                    request.push(req)
                    collections.push(colName)
                }
            })

            if (request[0]) await this.props.getData(request)

            if (!socket) socket = socketIO(':3001')
           
            socket.on('tst', arg => {
                console.log(arg)
                this.props.updateData(arg)
            }) 
            /* socket.on('updateVehicle', updatedVehicle => {
                this.props.updateData(updatedVehicle)
            }) */
        }

        render() {
            if (collections.length === 0 || !collections.every(col => this.props.redux.hasOwnProperty(col))) return <Loading />
            else {
                return <WrappedComponent {...this.props} />
            }
        }
    }

    function mapStateToProps(state) {
        return {
            redux: {
                ...state.vehicleData,
            }
        }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({ getData, updateData }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}

