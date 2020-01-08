import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getData } from '../Redux/getDataActions'
import { updateData } from '../Redux/updateDataActions'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import ReactToast from '../Utils/ReactToast'
import { altDadosFiles } from '../Forms/altDadosFiles'
import { altForm } from '../Forms/altForm'

import VeiculosTemplate from './VeiculosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'
import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'
import FormDialog from '../Utils/FormDialog'

const socketIO = require('socket.io-client')
let socket


class AltDados extends Component {

    state = {
        tab: 2,
        stepTitles: ['Informe a placa para alterar os dados abaixo ou mantenha as informações atuais e clique em avançar',
            'Altere os dados desejados abaixo e clique em avançar', 'Anexe os documentos solicitados',
            'Revisão das informações e deferimento'],
        steps: ['Alterar dados do Veículo', 'Alterar dados adicionais', 'Documentos', 'Revisão'],

        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo', 'Informe os dados para a baixa'],
        form: {},
        empresas: [],
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        activeStep: 0,
        files: [],
        fileNames: [],
        openDialog: false,
        altPlaca: false,
        newPlate: '',
        placa: ''
    }

    async componentDidMount() {

        const collections = ['veiculos', 'empresas'],
            { redux } = this.props
        let request = []

        collections.forEach(c => {

            if (!redux[c] || !redux[c][0]) {
                request.push(c)
            }
        })
        await this.props.getData(request)
        this.setState({ ...this.props.redux })

        if (!socket) {
            socket = socketIO(':3001')
        }

        socket.on('updateVehicle', async updatedVehicle => {            
            await this.props.updateData(humps.camelizeKeys(updatedVehicle))
        })
    }

    componentWillUnmount() { this.setState({}) }

    setActiveStep = action => {
        const prevActiveStep = this.state.activeStep
        if (action === 'next') this.setState({ activeStep: prevActiveStep + 1 });
        if (action === 'back') this.setState({ activeStep: prevActiveStep - 1 });
        if (action === 'reset') this.setState({ activeStep: 0 })
    }

    handleInput = e => {
        const { name, value } = e.target
        if (name === 'newPlate') {
            let newPlate = value
            if (typeof newPlate === 'string') {
                newPlate = newPlate.replace(/[a-z]/g, l => l.toUpperCase())
                if (newPlate.match('[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}')) newPlate = newPlate.replace(/(\w{3})/, '$1-')
                this.setState({ ...this.state, newPlate })
            }
        } else this.setState({ [name]: value })

    }

    getId = async (name, value, collection, stateId, dbName, dbId, alertLabel) => {

        const item = collection.filter(el => el[dbName].toLowerCase().match(value.toLowerCase()))
        if (value === '') this.setState({ [name]: '', [stateId]: '' })
        if (item[0]) {
            const nombre = item[0][dbName]
            const id = item[0][dbId]
            if (value !== '') {
                await this.setState({ [name]: nombre, [stateId]: id })

            }
        } else {
            await this.setState({ [name]: '', [stateId]: '' })
            alert(alertLabel + ' não cadastrado')
            document.getElementsByName(name)[0].focus()
        }
    }

    handleBlur = async  e => {
        const { empresas, frota, veiculos } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'compartilhado':
                this.getId(name, value, empresas, 'delegatarioCompartilhado', 'razaoSocial', 'delegatarioId')
                break;
            case 'delegatario':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
                break;
            case 'razaoSocial':
                await this.getId(name, value, empresas, 'donoDaFrotaId', 'razaoSocial', 'delegatarioId', 'Empresa')
                if (this.state.donoDaFrotaId) {
                    const f = veiculos.filter(v => v.delegatarioId === this.state.donoDaFrotaId)
                    this.setState({ frota: f })
                }
                break;
            default:
                void 0
        }
        if (name === 'placa' && typeof this.state.frota !== 'string') {

            const vehicle = this.state.frota.filter(v => {
                if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                else return v.placa.match(value)
            })[0]
            await this.setState({ ...vehicle, disable: true })

            if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

            let reset = {}
            if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
            if (this.state.placa !== '' && !vehicle) {
                this.props.createAlert('plateNotFound')
                this.setState({ ...reset, disable: false })
            }
        }
    }

    showAltPlaca = () => {
        const title = 'Alteração de placa',
            message = 'Para alterar a placa para o novo padrão Mercosul, informe a nova placa no campo abaixo.'
        this.setState({ altPlaca: true, title, message })
    }

    updatePlate = async () => {

        const table = 'veiculo',
            tablePK = 'veiculo_id',
            requestObject = { placa: this.state.newPlate }

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
        await this.submitFiles()
        this.toggleDialog()
        this.toast()
    }

    handleEdit = async e => {
        const { poltronas, pesoDianteiro, pesoTraseiro, delegatarioId, delegatarioCompartilhado } = this.state

        let tempObj = {}

        altForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field && !obj.disabled) {
                        if(this.state[k]) Object.assign(tempObj, { [k]: this.state[k] })
                    }
                }
            })
        })

        let pbt = Number(poltronas) * 93 + (Number(pesoDianteiro) + Number(pesoTraseiro))
        if (isNaN(pbt)) pbt = undefined

        tempObj = Object.assign(tempObj, { delegatarioId, delegatarioCompartilhado, pbt })
        tempObj = humps.decamelizeKeys(tempObj)

        const { placa, delegatario, compartilhado, ...requestObject } = tempObj

        const table = 'veiculo',
            tablePK = 'veiculo_id'

        await axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
        await this.submitFiles()
        this.toast()
    }




    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData()
            formData.append('veiculoId', this.state.veiculoId)

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                altDadosFiles.forEach(({ name }) => {
                    for (let keys in this.state) {
                        if (keys.match(name)) {
                            formData.append('id', name)
                            formData.append(name, this.state[name])
                        }
                        else void 0
                    }
                })
                this.setState({ form: formData })
            }
        }
    }

    submitFiles = () => {
        const { form } = this.state

        axios.post('/api/mongoUpload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
    }


    toggleDialog = () => this.setState({ altPlaca: !this.state.altPlaca })
    toast = e => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { confirmToast, toastMsg, activeStep, steps, stepTitles, tab, altPlaca } = this.state

        return <Fragment>
            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                stepTitles={stepTitles}
                setActiveStep={this.setActiveStep}
            />
            {activeStep < 2 && <VeiculosTemplate
                data={this.state}
                altPlacaOption={activeStep === 0}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
                showAltPlaca={this.showAltPlaca}
            />}
            {activeStep === 1 && <Grid
                container
                direction="row"
                justify="center"
                alignItems="center">
                <Grid>
                    <TextField
                        name='justificativa'
                        value={this.state.justificativa}
                        label='Justificativa'
                        type='text'
                        onChange={this.handleInput}
                        InputLabelProps={{ shrink: true, style: { fontWeight: 600, marginBottom: '5%' } }}
                        inputProps={{ style: { paddingBottom: '2%', width: '900px' } }}
                        multiline
                        rows={4}
                        variant='outlined'
                    />
                </Grid>
            </Grid>}
            {activeStep === 2 && <VehicleDocs
                tab={tab}
                handleFiles={this.handleFiles}
                handleSubmit={this.submitFiles}
                handleNames={this.handleNames}
            />}
            {activeStep === 3 && <Review data={this.state} />}
            <StepperButtons
                activeStep={activeStep}
                lastStep={steps.length - 1}
                handleSubmit={this.handleEdit}
                setActiveStep={this.setActiveStep}
            />
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            <FormDialog
                open={altPlaca}
                close={this.toggleDialog}
                newPlate={this.state.newPlate}
                handleInput={this.handleInput}
                handleFiles={this.handleFiles}
                updatePlate={this.updatePlate}
            />
        </Fragment>
    }
}

function mapStateToProps(state) {
    return {
        redux: state.data
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getData, updateData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AltDados)