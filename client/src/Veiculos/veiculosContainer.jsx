import React, { Component } from 'react'
import VeiculosTemplate from './VeiculosTemplate'
import { TabMenu } from '../Layouts'
import { Container } from '@material-ui/core'

export default class extends Component {

    state = {
        tab: 0,
        items:['Cadastro de Veículo', 'Atualização de Seguro',
        'Alteração de dados', 'Baixa de Veículo']
    }

    changeTab = (e, value) => this.setState({ tab: value })

    render() {        
        const { tab, items } = this.state
        return <Container>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <VeiculosTemplate tab={tab} items={items}/>
        </Container>
    }
}