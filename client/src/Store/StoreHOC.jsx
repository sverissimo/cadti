import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData, updateData } from './dataActions'


import Loading from '../Utils/Loading'

const socketIO = require('socket.io-client')
let socket

export default function (requestArray, WrappedComponent) {

    let collections = []

    class With extends React.Component {
        
        async componentDidMount() {
            const { redux, match } = this.props
        
            let request = []
            requestArray.forEach(req => {
                const colName = req.replace('getFiles/', '')
                if (!redux[colName] || !redux[colName][0]) {
                    request.push(req)
                    collections.push(colName)
                }
            })

            if (request[0]) await this.props.getData(request)
            
            if (match.path === '/consultas') {
                if (!socket) socket = socketIO(':3001')
                console.log('this path should be updated')
                socket.on('updateVehicle', collectionName => {
                    this.props.updateData(collectionName)
                })
            } else console.log('this path should not')
        }

        render() {
            if (!collections.every(col => this.props.redux.hasOwnProperty(col))) return <Loading />
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
        return bindActionCreators({ getData, updateData }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}
