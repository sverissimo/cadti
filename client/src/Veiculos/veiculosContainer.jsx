import React, { Component } from 'react'
import VeiculosTemplate from './VeiculosTemplate'
import { TabMenu } from '../Layouts'
import { Container } from '@material-ui/core'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Cadastro de Veículo', 'Atualização de Seguro',
            'Alteração de dados', 'Baixa de Veículo'],
        empresas: ['Gontijo', 'Saritur', 'Cometa', 'Util'],
        selectedEmpresa: ''
    }

    changeTab = (e, value) => this.setState({ tab: value })

    selectEmpresa = (e) => this.setState({ selectedEmpresa: e.target.value })
    

    render() {
        const { tab, items, empresas, selectedEmpresa } = this.state
        return <Container>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <VeiculosTemplate
                tab={tab}
                items={items}
                empresas={empresas}
                selectEmpresa={this.selectEmpresa}
                selectedEmpresa={selectedEmpresa}

            />
        </Container>
    }
}