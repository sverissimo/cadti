import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import { seguroForm } from '../Forms/seguroForm'

import VehicleHOC from './VeiculosHOC'
import AltSeguroTemplate from './AltSeguroTemplate'


class AltSeguro extends Component {

    state = {
        addedPlaca: '',
        insuranceExists: '',
        razaoSocial: '',
    }

    componentDidMount() {
        if (this.props.redux) {
            this.setState({
                ...this.props.redux,
                allInsurances: this.props.redux['seguros']
            })
        }
    }

    handleInput = async e => {
        const { name } = e.target
        let { value } = e.target
        const { veiculos } = this.props.redux
        const { allInsurances, frota, addedPlaca } = this.state

        this.setState({ [name]: value })

        switch (name) {
            case 'razaoSocial':
                let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

                if (selectedEmpresa) {
                    await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                    if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                    const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)
                    const filteredInsurances = allInsurances.filter(seguro => seguro.empresa === this.state.razaoSocial)

                    this.setState({ frota, seguros: filteredInsurances })

                } else this.setState({ selectedEmpresa: undefined })
                break

            case 'addedPlaca':
                const plate = frota.filter(p => p.placa.match(addedPlaca))
                if (plate && plate[0] && plate[0].length > 0) this.setState({ addedPlaca: plate[0].placa })
                break;
            default:
                void 0
        }
    }

    handleBlur = e => {
        const { name } = e.target, { seguradora, allInsurances, seguros, insuranceExists } = this.state

        console.log(seguros)

        switch (name) {
            case 'apolice':
                let insuranceExists = this.state.seguros.find(s => s.apolice === this.state.apolice)
                if (insuranceExists && insuranceExists.dataEmissao && insuranceExists.vencimento) {
                    const dataEmissao = insuranceExists.dataEmissao.toString().slice(0, 10),
                        vencimento = insuranceExists.vencimento.toString().slice(0, 10),
                        seguradora = insuranceExists.seguradora

                    this.setState({ seguradora, dataEmissao, vencimento, insuranceExists })
                } else {
                    insuranceExists = false
                    this.setState({ insuranceExists: false })
                }
                break

            case 'seguradora':

                let filteredInsurances = []
                const empresa = this.state.selectedEmpresa

                if (empresa && seguradora === '') {
                    filteredInsurances = allInsurances.filter(seguro => seguro.razaoSocial === empresa.delegatarioId)
                    this.setState({ seguros: filteredInsurances })
                }
                if (!empresa && seguradora !== '') {
                    filteredInsurances = allInsurances.filter(s => s.seguradora === seguradora)
                    this.setState({ seguros: filteredInsurances })
                }
                if (empresa && seguradora !== '') {
                    filteredInsurances = allInsurances
                        .filter(seg => seg.empresa === empresa.razaoSocial)
                        .filter(seg => seg.seguradora === seguradora)
                    this.setState({ seguros: filteredInsurances })
                }
                break
        }
    }

    deleteInsurance = async placaInput => {

        await this.setState({ vehicleFound: this.state.frota.filter(v => v.placa === placaInput)[0] })
        const { vehicleFound } = this.state

        let { insuranceExists } = this.state,
            { placas, veiculos } = insuranceExists

        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: 'Seguro não cadastrado',
            tablePK: 'veiculo_id',
            id: vehicleFound.veiculoId
        }

        const i = placas.indexOf(placaInput)
        placas.splice(i, 1)
        const k = veiculos.indexOf(vehicleFound.veiculoId)
        veiculos.splice(k, 1)

        await axios.put('/api/UpdateInsurance', body)
            .catch(err => console.log(err))
        insuranceExists.placas = placas
        insuranceExists.veiculos = veiculos
        this.setState({ insuranceExists })

        return null
    }

    updateInsurance = async (placaInput, seguroId) => {

        await this.setState({ vehicleFound: this.state.frota.filter(v => v.placa === placaInput)[0] })
        const { vehicleFound } = this.state

        let { insuranceExists } = this.state,
            { placas, veiculos } = insuranceExists

        // Validate plate

        if (!placaInput.match('[a-zA-Z]{3}[-]?\\d{4}')) {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa inválida',
                message: `Certifique-se de que a placa informada é uma placa válida, com três letras seguidas de 4 números (ex: AAA-0000)`,
            })
            return null
        }

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice

        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({
                openDialog: true,
                dialogTitle: 'Placa não encontrada',
                message: `A placa informada não corresponde a nenhum veículo da frota da viação selecionada. Para cadastrar um novo veículo, selecione a opção "Cadastro de Veículo" no menu acima.`,
            })
            return null
        } else if (insuranceExists !== undefined && insuranceExists.hasOwnProperty('placas') && vehicleFound.hasOwnProperty('placa')) {
            const check = insuranceExists.placas.find(p => p === vehicleFound.placa)
            if (check !== undefined) {
                this.setState({
                    openDialog: true,
                    dialogTitle: 'Placa já cadastrada',
                    message: `A placa informada já está cadastrada na apólice. Para pesquisar as placas cadastradas, utilize o campo "filtrar" abaixo.`,
                })
                return null
            }
        }

        //Define body to post

        const body = {
            table: 'veiculo',
            column: 'apolice',
            value: seguroId,
            tablePK: 'veiculo_id', id: vehicleFound.veiculoId
        }

        // Add plates to rendered list
        if (seguroId) {
            if (!placas) placas = []
            placas.push(placaInput)
            if (!veiculos) veiculos = []
            veiculos.push(vehicleFound.veiculoId)

            if (insuranceExists.hasOwnProperty('placas') && insuranceExists.hasOwnProperty('veiculos')) {
                let obj = insuranceExists
                obj.placas = placas
                obj.veiculos = veiculos
                this.setState({ insuranceExists: obj })
            }
        }

        // Verify if all fields are filled before add new plate/insurance
        const enableSubmit = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        if (!enableSubmit) {
            alert('Favor preencher todos os campos referentes ao seguro.')
            return null
        }

        //Create a new insurance
        if (!insuranceExists.hasOwnProperty('apolice')) {
            const { seguradoraId, apolice, dataEmissao, vencimento } = this.state,
                cadSeguro = { seguradora_id: seguradoraId, apolice, data_emissao: dataEmissao, vencimento }

            await axios.post('/api/cadSeguro', cadSeguro)
        }

        //Delete placa from old array
        if (vehicleFound.apolice !== 'Seguro não cadastrado') {

            let { seguros } = this.state
            const index = seguros.findIndex(s => s.apolice === vehicleFound.apolice)
            if (seguros[index]) {

                let pl = seguros[index].placas,
                    v = seguros[index].veiculos
                const i = pl.indexOf(vehicleFound.placa),
                    k = pl.indexOf(vehicleFound.veiculoId)

                pl.splice(i, 1)
                v.splice(k, 1)

                seguros[index].placas = pl
                seguros[index].veiculos = v
                this.setState({ seguros })
            }
        }

        //Update data to/from DataBase
        await axios.put('/api/UpdateInsurance', body)
            .catch(err => console.log(err))
        await axios.get('/api/seguros')
            .then(r => humps.camelizeKeys(r.data))
            .then(seguros => {
                this.setState({ seguros })
                return seguros
            })
            .then(res => this.setState({ insuranceExists: res.filter(s => s.apolice === seguroId)[0] }))
            .catch(err => console.log(err))

        let updateFrota = this.state.frota
        const vIndex = this.state.frota.findIndex(v => v.veiculoId === vehicleFound.veiculoId)
        updateFrota[vIndex].apolice = seguroId
        await this.setState({ frota: updateFrota })

        if (document.getElementsByName('razaoSocial')[0]) document.getElementsByName('razaoSocial')[0].focus()
        if (document.getElementsByName('seguradora')[0]) document.getElementsByName('seguradora')[0].focus()
        if (document.getElementsByName('apolice')[0]) document.getElementsByName('apolice')[0].focus()
        if (document.getElementsByName('addedPlaca')[0]) document.getElementsByName('addedPlaca')[0].focus()

        this.setState({ addedPlaca: '' })
    }

    render() {
        const enableAddPlaca = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')

        return (
            <Fragment>
                <AltSeguroTemplate
                    data={this.state}
                    insuranceExists={this.state.insuranceExists}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlateInsurance={this.updateInsurance}
                    deleteInsurance={this.deleteInsurance}
                />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros']

export default VehicleHOC(collections, AltSeguro)