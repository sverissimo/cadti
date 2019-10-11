import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import { Grid, TextField } from '@material-ui/core'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import VehicleDocs from './VehicleDocs'
import Review from './Review'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import StepperButtons from '../Utils/StepperButtons'
import CustomStepper from '../Utils/Stepper'

export default class extends Component {

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
        selectedEmpresa: '',
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        activeStep: 0,
        files: [],
        fileNames: [],
        openDialog: false
    }

    async componentDidMount() {
        const veiculos = axios.get('/api/veiculosInit')
        const empresas = axios.get('/api/empresas')        

        await Promise.all([veiculos, empresas])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, empresas]) => {
                this.setState({
                    veiculos, empresas
                })
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
        const parsedName = humps.decamelize(name)
        if (name !== 'razaoSocial') this.setState({ [name]: value, form: { ...this.state.form, [parsedName]: value } })
        else this.setState({ [name]: value })
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
                this.getId(name, value, empresas, 'compartilhadoId', 'razaoSocial', 'delegatarioId')
                break;
            case 'razaoSocial':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
                if (this.state.delegatarioId) {
                    const f = veiculos.filter(v => v.delegatarioId === this.state.delegatarioId)
                    this.setState({ frota: f })
                }
                break;
            default:
                void 0
        }
        if (name === 'placa' && typeof this.state.frota !== 'string') {

            const vehicle = this.state.frota.filter(v => v.placa === value)[0]
            await this.setState({ ...vehicle, disable: true })
            if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })
            let reset = {}
            if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
            if (!vehicle) {
                this.props.createAlert('plateNotFound')
                this.setState({ ...reset, disable: false })
            }
        }
    }

    handleEdit = async e => {
        console.log(this.state)
    }

    toast = e => {
        this.setState({ confirmToast: !this.state.confirmToast })
    }

    handleFiles = async e => {
        const { name, files } = e.target

        if (files && files[0]) {

            document.getElementById(name).value = files[0].name

            let formData = new FormData()

            let fn = this.state.fileNames

            if (files && files.length > 0) {

                fn.push({ [name]: files[0].name })
                await this.setState({ filesNames: fn, [name]: files[0] })

                cadVehicleFiles.forEach(({ name }) => {
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

    handleSubmit = async e => {
        const { form } = this.state

        await axios.post('/api/upload', form)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
        this.toast()
    }

    toggleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    render() {
        const { selectedEmpresa, confirmToast, toastMsg, activeStep, steps, stepTitles, tab } = this.state

        return <Fragment>
            <CustomStepper
                activeStep={activeStep}
                steps={steps}
                stepTitles={stepTitles}
                setActiveStep={this.setActiveStep}
                selectedEmpresa={selectedEmpresa}
            />
            {activeStep < 2 && <VeiculosTemplate
                data={this.state}
                selectedEmpresa={selectedEmpresa}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
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
                handleSubmit={this.handleSubmit}
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
        </Fragment>
    }
}