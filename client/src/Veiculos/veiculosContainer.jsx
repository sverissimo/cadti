import React, { Component } from 'react'
import axios from 'axios'
import VeiculosTemplate from './VeiculosTemplate'
import { TabMenu } from '../Layouts'
import { Container } from '@material-ui/core'
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

    selectEmpresa = (e) => this.setState({ selectedEmpresa: e.target.value })

    handleInput = e => {
        const { name, value } = e.target
        this.setState({ [name]: value })
    }

    handleBlur = async  e => {
        const { empresas } = this.state
        const { value } = e.target
        
        const selectedEmpresa = empresas.filter(e => e.razaoSocial.match(value))[0]
        if (selectedEmpresa) {
            await this.setState({ selectedEmpresa })
            axios.get(`/api/veiculo/${selectedEmpresa.delegatarioId}?column=modelocarroceria_id&filter=veiculo_id`)
            .then(r=> console.log(r.data))
        
        }
            
        
    }

    render() {
        const { tab, items, empresas, selectedEmpresa, razaoSocial } = this.state
        return <Container>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <VeiculosTemplate
                tab={tab}
                items={items}
                razaoSocial={razaoSocial}
                empresas={empresas}
                selectEmpresa={this.selectEmpresa}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />
        </Container>
    }
}