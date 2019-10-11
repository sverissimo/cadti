import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import { Grid, TextField } from '@material-ui/core'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import { altForm } from '../Forms/altForm'

export default class extends Component {

    state = {
        tab: 3,
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo', 'Informe os dados para a baixa'],        
        empresas: [],        
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        toastMsg: 'Baixa realizada com sucesso!',
        confirmToast: false,
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
            console.log(vehicle)
            let reset = {}
            if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
            if (this.state.placa !== '' && !vehicle) {
                this.props.createAlert('plateNotFound')
                this.setState({ ...reset, disable: false })
            }
        }
    }

    handleEdit = async e => {
        const { poltronas, pesoDianteiro, pesoTraseiro, delegatarioId, delegatarioCompartilhado } = this.state

        let tempObj = {}

        altForm.forEach(form => {
            form.forEach(obj => {
                for (let k in this.state) {
                    if (k === obj.field && !obj.disabled) {
                        Object.assign(tempObj, { [k]: this.state[k] })
                    }
                }
            })
        })

        let pbt = Number(poltronas) * 93 + (Number(pesoDianteiro) + Number(pesoTraseiro))
        if (isNaN(pbt)) pbt = undefined

        tempObj = Object.assign(tempObj, { delegatarioId, delegatarioCompartilhado, pbt })
        tempObj = humps.decamelizeKeys(tempObj)

        const { placa, delegatario, compartilhado, ...requestObject } = tempObj

        console.log(this.state)

        const table = 'veiculo',
            tablePK = 'veiculo_id'
        //axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
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

    submitFiles = async e => {
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
        const { confirmToast, toastMsg } = this.state

        return <Fragment>
            <VeiculosTemplate
                data={this.state}                
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />
            <Grid
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
            </Grid>
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
        </Fragment>
    }
}