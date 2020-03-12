import React, { PureComponent } from 'react'

import StoreHOC from '../Store/StoreHOC'
import ConfigTemplate from './ConfigTemplate'
import { configVehicleForm } from '../Forms/configVehicleForm'

class VehicleConfig extends PureComponent {

    state = { collection: '', options: [] }
    componentDidMount() {
        let options = []
        configVehicleForm.forEach(col => { options.push(col.label) })
        this.setState({ options })
    }

    selectCollection = e => {
        const { value } = e.target

        let staticData = configVehicleForm.find(el => el.label === value)

        const data = this.props.redux[staticData.collection]
        
        this.setState({ collection: value, data, staticData })
    }

    handleChange = e => {
        const { name, value } = e.target
        this.setState({ [name]: value })
        console.log(this.state)
    }

    render() {
        
        const { options, collection, data, staticData } = this.state
        return (
            <ConfigTemplate
                collections={options}
                collection={collection}                
                data={data}
                staticData={staticData}
                selectCollection={this.selectCollection}
                handleChange={this.handleChange}
            />
        )
    }
}


const collections = ['seguradoras', 'lookUpTable/marca_chassi', 'modelosChassi', 'lookUpTable/marca_carroceria',
    'carrocerias', 'equipamentos']

export default StoreHOC(collections, VehicleConfig)