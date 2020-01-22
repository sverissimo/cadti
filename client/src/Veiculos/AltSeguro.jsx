import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import moment from 'moment'
import ReactToast from '../Utils/ReactToast'

import VehicleHOC from './VeiculosHOC'

import AltSeguroTemplate from './AltSeguroTemplate'
import AlertDialog from '../Utils/AlertDialog'
import { seguroForm } from '../Forms/seguroForm'

class AltSeguro extends Component {

    state = {
        addedPlaca: '',
        insuranceExists: '',
        razaoSocial: '',
        toastMsg: 'Seguro atualizado!',
        confirmToast: false,
        dropDisplay: 'Clique ou arraste para anexar a apólice'
    }

    componentDidMount() {

        this.setState({
            ...this.props.redux,
            allInsurances: this.props.redux['seguros']
        })
    }

    checkExistance = async (name, inputValue) => {
        let insuranceExists,
            testApolice = this.state.seguros.find(s => s[name] === inputValue),
            testSeguradora = this.state.seguros.find(s => s[name] === inputValue && s.apolice === this.state.apolice)

        if (name === 'apolice') insuranceExists = testApolice
        if (name === 'seguradora') insuranceExists = testSeguradora

        if (insuranceExists && insuranceExists.dataEmissao && insuranceExists.vencimento) {
            const dataEmissao = moment(insuranceExists.dataEmissao).format('YYYY-MM-DD'),
                vencimento = insuranceExists.vencimento.toString().slice(0, 10),
                seguradora = insuranceExists.seguradora
            await this.setState({ seguradora, dataEmissao, vencimento, insuranceExists })
            return
        }
        if (!insuranceExists) this.setState({ insuranceExists: false, dataEmissao: '', vencimento: '' })
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

                } else this.clearFields()
                break

            case 'apolice':
                this.checkExistance('apolice', value)
                break

            case 'seguradora':
                this.checkExistance(name, value)
                const selectedSeguradora = this.state.seguradoras.find(sg => sg.seguradora === value)
                if (selectedSeguradora) {
                    this.setState({ seguradoraId: selectedSeguradora.id })
                }
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
        const { seguradora, allInsurances, selectedEmpresa } = this.state

        if (e.target.name === 'seguradora') {
            let filteredInsurances = []

            if (selectedEmpresa && !seguradora) {
                filteredInsurances = allInsurances.filter(seguro => seguro.empresa === selectedEmpresa.razaoSocial)
                this.setState({ seguros: filteredInsurances })
            }
            else if (!selectedEmpresa && seguradora !== '') {
                filteredInsurances = allInsurances.filter(s => s.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
            else if (selectedEmpresa && seguradora !== '') {
                filteredInsurances = allInsurances
                    .filter(seg => seg.empresa === selectedEmpresa.razaoSocial)
                    .filter(seg => seg.seguradora === seguradora)
                this.setState({ seguros: filteredInsurances })
            }
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

        //Check if vehicle belongs to frota before add to insurance and  if plate already belongs to apolice

        if (vehicleFound === undefined || vehicleFound.hasOwnProperty('veiculoId') === false) {
            this.setState({ openAlertDialog: true, alertType: 'plateNotFound' })
            return null
        } else if (insuranceExists !== undefined && insuranceExists.hasOwnProperty('placas') && vehicleFound.hasOwnProperty('placa')) {
            const check = insuranceExists.placas.find(p => p === vehicleFound.placa)
            if (check !== undefined) {
                this.setState({ openAlertDialog: true, alertType: 'plateExists' })
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
        await this.setState({ frota: updateFrota, toastMsg: 'Seguro atualizado.' })

        if (document.getElementsByName('addedPlaca')[0]) document.getElementsByName('addedPlaca')[0].focus()
        this.setState({ addedPlaca: '' })
        this.toast()
    }

    handleFiles = (file) => {
        let formData = new FormData()
        formData.append('seguro', file[0])
        this.setState({ dropDisplay: file[0].name, seguroFile: formData })
    }

    handleSubmit = () => {
        const { apolice, selectedEmpresa, seguroFile } = this.state

        let seguroFormData = new FormData()

        if (seguroFile) {
            seguroFormData.append('fieldName', 'seguro')
            seguroFormData.append('apolice', apolice)
            seguroFormData.append('empresaId', selectedEmpresa.delegatarioId)
            for (let pair of seguroFile.entries()) {
                seguroFormData.append(pair[0], pair[1])
            }
            axios.post('/api/empresaUpload', seguroFormData)
                .then(r => console.log(r.data))
            this.toast()
        }
    }

    toast = () => this.setState({ confirmToast: !this.state.confirmToast })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    clearFields = () => this.setState({
        selectedEmpresa: null, insuranceExists: false, seguradora: '',
        apolice: '', dataEmissao: '', vencimento: '', seguroFile: null,
        dropDisplay: 'Clique ou arraste para anexar a apólice'
    })

    render() {
        const enableAddPlaca = seguroForm
            .every(k => this.state.hasOwnProperty(k.field) && this.state[k.field] !== '')
        const { openAlertDialog, alertType } = this.state
        return (
            <Fragment>
                <AltSeguroTemplate
                    data={this.state}
                    enableAddPlaca={enableAddPlaca}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addPlateInsurance={this.updateInsurance}
                    deleteInsurance={this.deleteInsurance}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['veiculos', 'empresas', 'seguradoras', 'seguros']

export default VehicleHOC(collections, AltSeguro)