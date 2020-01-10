import React from 'react'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData } from '../Redux/getDataActions'

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

            if (collections[0]) await this.props.getData(request)            
        }

        render() {
            const { redux } = this.props
            if (!redux.veiculos[0]) return <p>Loading...</p>
            else return <WrappedComponent {...this.props} />
        }
    }

    function mapStateToProps(state) {
        return {
            redux: {
                ...state.vehicleData,
                ...state.otherData
            }
        }
    }

    function mapDispatchToProps(dispatch) {
        return bindActionCreators({ getData }, dispatch)
    }

    return connect(mapStateToProps, mapDispatchToProps)(With)
}

