import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import '../Layouts/stylez.css'
import ReactToast from '../Utils/ReactToast'
import VeiculosTemplate from './VeiculosTemplate'
import { cadVehicleFiles } from '../Forms/cadVehicleFiles'
import AutoComplete from '../Utils/autoComplete'

import Button from '@material-ui/core/Button'
import { Send } from '@material-ui/icons'

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default class extends Component {

    state = {
        tab: 3,
        subtitle: ['Informe os dados do Veículo', 'Informe os dados do Seguro',
            'Preencha os campos abaixo', 'Informe os dados para a baixa'],
        empresas: [],
        razaoSocial: '',
        delegatarioCompartilhado: '',
        frota: [],
        placa: '',
        form: {},
        check: '',
        delegaTransf: '',
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
    };

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
            case 'delegaTransf':
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

            let vehicle
            if (value.length > 2) {

                vehicle = this.state.frota.filter(v => {
                    if (typeof value === 'string') return v.placa.toLowerCase().match(value.toLowerCase())
                    else return v.placa.match(value)
                })[0]

                await this.setState({ ...vehicle, disable: true })

                if (vehicle !== undefined && vehicle.hasOwnProperty('empresa')) this.setState({ delegatario: vehicle.empresa })

            } else if (this.state.placa.length < 0 && !vehicle) {
                let reset = {}
                if (frota[0]) Object.keys(frota[0]).forEach(k => reset[k] = '')
                this.props.createAlert('plateNotFound')
                this.setState({ ...reset, disable: false })
            }
        }
    }

    handleSubmit = async e => {
        const { delegatarioId,
            justificativa, checked, delegaTransf } = this.state

        const enableSubmit = ['placa', 'renavam', 'nChassi']
            .every(k => this.state.hasOwnProperty(k) && this.state[k] !== '')

        if (!enableSubmit) {
            this.props.createAlert('fieldsMissing')
            return null
        }
        if (checked === 'venda' && !delegaTransf) {
            this.props.createAlert('fieldsMissing')
            return null
        } if (checked === 'outro' && !justificativa) {
            this.props.createAlert('fieldsMissing')
            return null
        } if (checked !== 'outro' && checked !== 'venda') {
            this.props.createAlert('fieldsMissing')
            return null
        } if (this.state.placa.length <= 2) {
            this.props.createAlert('invalidPlate')
            return null
        } else {
            let validPlate = []
            validPlate = this.state.frota.filter(v => v.placa === this.state.placa)
            if (validPlate.length < 1) {
                this.props.createAlert('plateNotFound')
                return null
            }
        }

        let tempObj

        if (checked === 'venda') tempObj = { delegatarioId, situacao: 'pendente' }
        if (checked === 'outro') tempObj = { situacao: 'excluído' }

        const requestObject = humps.decamelizeKeys(tempObj)

        const table = 'veiculo',
            tablePK = 'veiculo_id'
        axios.put('/api/updateVehicle', { requestObject, table, tablePK, id: this.state.veiculoId })
            .then(() => this.toast())
            .catch(err => console.log(err))
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

    handleCheck = e => {
        const { value } = e.target
        this.setState({ checked: value })
    }
    render() {
        const { delegaTransf, confirmToast, toastMsg, checked } = this.state

        return <Fragment>
            <VeiculosTemplate
                data={this.state}
                handleInput={this.handleInput}
                handleBlur={this.handleBlur}
            />

            <Grid container
                direction="row"
                justify="space-between"
                alignItems="center"
                style={{ width: checked === 'venda' || checked === 'outro' ? '1200px' : '600px' }}
            >
                <Grid item xs={checked ? 6 : 12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Motivo da baixa</FormLabel>
                        <RadioGroup aria-label="position" name="position"
                            onChange={this.handleCheck} row
                            style={{ width: 'auto' }}
                            className='radio'
                        >
                            <FormControlLabel
                                className='radio'
                                value="venda"
                                control={<Radio color="primary" inputProps={{ style: { fontSize: '0.5rem' } }} />}
                                label="Venda para outra empresa do sistema"
                                labelPlacement="start"

                            />
                            <FormControlLabel
                                value="outro"
                                control={<Radio color="primary" />}
                                label="Outro"
                                labelPlacement="start"
                            />

                        </RadioGroup>
                    </FormControl>
                </Grid>

                {checked === 'venda' &&
                    <Grid item xs={6} >

                        <TextField
                            inputProps={{
                                list: 'razaoSocial',
                                name: 'delegaTransf',
                            }}
                            //className={classes.textField}
                            value={delegaTransf}
                            onChange={this.handleInput}
                            onBlur={this.handleBlur}
                            label='Informe o delegatário para o qual foi transferido o veículo.'
                            fullWidth
                        />
                        <AutoComplete
                            collection={this.props.data.empresas}
                            datalist='razaoSocial'
                            value={delegaTransf}
                        />
                    </Grid>

                }
                {
                    checked === 'outro' &&
                    <Grid item xs={6}>
                        <TextField
                            name='justificativa'
                            value={this.state.justificativa}
                            label='Justificativa'
                            type='text'
                            onChange={this.handleInput}
                            InputLabelProps={{ shrink: true }}
                            multiline
                            rows={4}
                            variant='outlined'
                            fullWidth
                        />
                    </Grid>
                }
            </Grid>
            <Grid container direction="row" justify='flex-end' style={{ width: '1200px' }}>
                <Grid item xs={11} style={{ width: '1000px' }}></Grid>
                <Grid item xs={1} style={{ align: "right" }}>
                    <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        style={{ margin: '10px 0 10px 0' }}
                        onClick={() => this.handleSubmit()}
                    //onClick={handleEquipa}
                    >
                        Confirmar <span>&nbsp;&nbsp; </span> <Send />
                    </Button>
                </Grid>
            </Grid>
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
        </Fragment >
    }
}