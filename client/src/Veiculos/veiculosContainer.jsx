import React, { Component, Fragment } from 'react'
import axios from 'axios'
import VeiculosTemplate from './VeiculosTemplate'
import { TabMenu } from '../Layouts'
import humps from 'humps'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        empresas: [],
        selectedEmpresa: '',
        razaoSocial: ''
    }

    async componentDidMount() {
        await axios.get('/api/empresas')
            .then(res => {
                const empresas = humps.camelizeKeys(res.data)
                this.setState({ empresas })
            })
    }

    changeTab = (e, value) => this.setState({ tab: value })

    handleInput = e => {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    handleBlur = async  e => {
        const { empresas } = this.state
        const { value, name } = e.target

        const selectedEmpresa = empresas.filter(e => e.razaoSocial.toLowerCase().match(value.toLowerCase()))[0]
        console.log()
        if (selectedEmpresa) {
            await this.setState({ selectedEmpresa, [name]: selectedEmpresa.razaoSocial })            
           axios.get(`/api/veiculos?razaoSocial=${selectedEmpresa.razaoSocial}`)
           .then(res=> console.log(res.data))
                      
            /*  axios.get(`/api/veiculo/${selectedEmpresa.delegatarioId}?column=modelocarroceria_id&filter=veiculo_id`)
                .then(r => console.log(r.data)) */
        }
    }

    render() {
        const { tab, items, empresas, selectedEmpresa, razaoSocial } = this.state
        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <VeiculosTemplate
                tab={tab}
                items={items}
                razaoSocial={razaoSocial}
                empresas={empresas}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />
        </Fragment>
    }
}