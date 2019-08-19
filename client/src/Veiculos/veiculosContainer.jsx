import React, { Component } from 'react'
import axios from 'axios'
import VeiculosTemplate from './VeiculosTemplate'
import { TabMenu } from '../Layouts'
import { Container } from '@material-ui/core'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        empresas: [],
        selectedEmpresa: '',
        razaoSocial: ''
    }

    componentDidMount() {
        axios.get('/api/empresas')
            .then(res => {
                this.setState({ empresas: res.data.rows })                
            })

    }
    changeTab = (e, value) => this.setState({ tab: value })

    selectEmpresa = (e) => this.setState({ selectedEmpresa: e.target.value })

    handleInput = e => {
        const { name, value } = e.target
        this.setState({ [name]: value })
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

            />
        </Container>
    }
}