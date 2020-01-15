import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData } from '../Redux/getDataActions'

import Loading from '../Utils/Loading'

export default function (collections = [], WrappedComponent) {

    class With extends React.Component {

        async componentDidMount() {
            const { redux } = this.props

            let request = []
            collections.forEach(c => {
                if (!redux[c] || !redux[c][0]) {                    
                    request.push(c)
                }
            })
            if (request[0]) {
                await this.props.getData(request)
            }         
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
        return bindActionCreators({ getData }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}

