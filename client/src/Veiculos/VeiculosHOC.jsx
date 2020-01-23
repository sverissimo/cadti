import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData } from '../Redux/getDataActions'
import { updateData } from '../Redux/updateDataActions'

import Loading from '../Utils/Loading'


const socketIO = require('socket.io-client')
let socket


export default function (collections = [], WrappedComponent) {

    class With extends React.Component {

        async componentDidMount() {
            const { redux } = this.props
            let request = []
            collections.forEach(c => { if (!redux[c] || !redux[c][0]) request.push(c) })
            if (request[0]) await this.props.getData(request)

            if (!socket) socket = socketIO(':3001')
            socket.on('updateVehicle', updatedVehicle => {
                this.props.updateData(updatedVehicle)
            })
        }

        render() {
            if (!collections.every(col => this.props.redux.hasOwnProperty(col))) return <Loading />
            else return <WrappedComponent {...this.props} />
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

