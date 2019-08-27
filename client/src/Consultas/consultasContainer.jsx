import React, { Component, Fragment } from 'react'
import axios from 'axios'
import ConsultasTemplate from './consultasTemplate'
import { TabMenu } from '../Layouts'
import humps from 'humps'
//import formatDate from '../Utils/formatDate'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Veículos', 'Delegatários',
            'Procuradores', 'Outros'],
        selectedOption: ['veiculos', 'empresas',
            'procuradores', 'outros'],
        empresas: [],
        selectedEmpresa: '',
        razaoSocial: ''
    }

    async componentDidMount() {
        await axios.get('/api/delegatarios')
            .then(res => {
                const empresas = humps.camelizeKeys(res.data)
                this.setState({ empresas })                
            })
        await axios.get('/api/veiculosInit')
            .then(res => {
                const veiculos = humps.camelizeKeys(res.data)
                this.setState({ veiculos, collection: veiculos })
            })
        axios.get('/api/procuradores')
            .then(res => {
                const procuradores = humps.camelizeKeys(res.data)                
                this.setState({ procuradores })
            })            
    }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        const options = ['veiculos', 'empresas', 'procuradores', 'outros']
        let collection = this.state[options[value]]
        this.setState({ collection })
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
            />
        </Fragment>
    }
}