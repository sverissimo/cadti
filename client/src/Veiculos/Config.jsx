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
        const { value } = e.target,
            { veiculos } = this.props.redux

        let
            staticData = configVehicleForm.find(el => el.label === value),
            data = this.props.redux[staticData.collection]

        data.forEach(el => {
            const { name, field, label } = staticData
            const vehicles = veiculos.filter(v => {
                if (label === 'Equipamentos' && v[name]) return v[name].toLowerCase().match(el[field].toLowerCase())
                return v[name] === el[field]
            }),
                count = vehicles.length
            Object.assign(el, { count })
        })
        console.log(data)
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
    'carrocerias', 'equipamentos', 'veiculos']

export default StoreHOC(collections, VehicleConfig)