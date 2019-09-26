import React, { Component, Fragment } from 'react'
import axios from 'axios'
import ConsultasTemplate from './consultasTemplate'
import { TabMenu } from '../Layouts'
import humps from 'humps'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Veículos', 'Delegatários',
            'Sócios', 'Seguros'],
        selectedOption: ['veiculos', 'empresas',
            'procuradores', 'seguros'],
        empresas: [],
        seguros: [],
        selectedEmpresa: '',
        razaoSocial: ''
    }

    async componentDidMount() {
        const vehicles = axios.get('/api/veiculosInit'),
            insurances = axios.get('/api/seguros'),
            delega = axios.get('/api/empresas'),
            proc = axios.get('/api/procuradores')

        Promise.all([vehicles, insurances, delega, proc])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, seguros, empresas, procuradores]) => {
                this.setState({ veiculos, seguros, empresas, procuradores, collection: veiculos })
            })
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
        console.log(this.state)
    }

    render() {
        const { tab, items, collection } = this.state
        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                collection={collection}
                handleEdit={this.handleEdit}
            />
        </Fragment>
    }
}