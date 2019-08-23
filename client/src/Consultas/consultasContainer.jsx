import React, { Component } from 'react'
import axios from 'axios'
import ConsultasTemplate from './consultasTemplate'
import { TabMenu } from '../Layouts'
import { Container } from '@material-ui/core'
import humps from 'humps'

export default class extends Component {

    state = {
        tab: 0,
        items: ['Veículos', 'Delegatários',
            'Procuradores', 'Outros'],
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
        await axios.get('/api/veiculosInit')
            .then(res => {
                const veiculos = humps.camelizeKeys(res.data)            
                this.setState({ veiculos })            
            })
        console.log(this.state)
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
                .then(res => console.log(res.data))


            /*  axios.get(`/api/veiculo/${selectedEmpresa.delegatarioId}?column=modelocarroceria_id&filter=veiculo_id`)
                .then(r => console.log(r.data)) */
        }


    }

    render() {
        const { tab, items, empresas, veiculos, selectedEmpresa, razaoSocial } = this.state
        return <Container>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                razaoSocial={razaoSocial}
                empresas={empresas}
                veiculos={veiculos}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />
        </Container>
    }
}