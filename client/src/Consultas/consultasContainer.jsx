import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ConsultasTemplate from './consultasTemplate'
import { TabMenu } from '../Layouts'
import PopUp from '../Utils/PopUp'
import VehicleDetails from '../Veiculos/VehicleDetails'

const format = {
    top: '5%',
    left: '10%',
    right: '10%'
}

export default class extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.showDetails) this.showDetails()
            }
        }
    }

    state = {
        tab: 0,
        items: ['Veículos', 'Delegatários', 'Sócios', 'Seguros'],
        tablePKs: ['veiculo_id', 'delegatario_id', 'procurador_id', 'apolice'],
        dbTables: ['veiculo', 'delegatario', 'procurador', 'seguro'],
        empresas: [],
        seguros: [],
        selectedEmpresa: '',
        razaoSocial: '',
        showDetails: false,
        vehicleInfo: ''
    }

    async componentDidMount() {
        const vehicles = axios.get('/api/veiculosInit'),
            insurances = axios.get('/api/seguros'),
            delega = axios.get('/api/empresas'),
            proc = axios.get('/api/socios')

        Promise.all([vehicles, insurances, delega, proc])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, seguros, empresas, procuradores]) => {
                this.setState({ veiculos, seguros, empresas, procuradores, collection: veiculos })
            })
        document.addEventListener('keydown', this.escFunction, false)

    }
    componentWillUnmount() {
        this.setState({})
    }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        const options = ['veiculos', 'empresas', 'procuradores', 'seguros'],
            collection = this.state[options[value]]
        this.setState({ collection })
    }

    handleEdit = (data) => {
        this.setState({ data })
    }

    showDetails = (e, vehicleInfo) => {

        if (vehicleInfo !== undefined) this.setState({ showDetails: !this.state.showDetails, vehicleInfo })
        else this.setState({ showDetails: !this.state.showDetails, vehicleInfo: undefined })
    }

    deleteHandler = data => {
        const { dbTables, tablePKs, tab } = this.state,
            table = dbTables[tab],
            tablePK = tablePKs[tab],
            itemId = humps.camelize(tablePK)

        axios.delete(`/api/delete?table=${table}&tablePK=${tablePK}&id=${data[itemId]}`)
            .then(r => console.log(r.data))
    }

    render() {
        const { tab, items, collection, showDetails, vehicleInfo } = this.state
        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                collection={collection}
                showDetails={this.showDetails}
                handleEdit={this.handleEdit}
                del={this.deleteHandler}
            />
            {showDetails && <PopUp
                close={this.showDetails}
                title='Informações sobre o veículo'
                format={format}
            >
                <VehicleDetails
                    data={vehicleInfo}
                    tab={tab}
                />
            </PopUp>}
        </Fragment>
    }
}