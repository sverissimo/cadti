import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import VehicleHOC from './VeiculosHOC'

import Crumbs from '../Utils/Crumbs'
import BaixaTemplate from './BaixaTemplate'
import AutoComplete from '../Utils/autoComplete'
import ReactToast from '../Utils/ReactToast'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Send } from '@material-ui/icons'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import '../Layouts/stylez.css'

class BaixaVeiculo extends Component {

    state = {
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

    componentDidMount() {
        this.setState({ ...this.props.redux })
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {
        const { name, value } = e.target,
            { veiculos } = this.state

        this.setState({ [name]: value })

        if (name === 'razaoSocial') {
            let selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })

                const frota = veiculos.filter(v => v.empresa === this.state.razaoSocial)

                this.setState({ frota })

            } else this.setState({ selectedEmpresa: undefined, frota: [] })

        }
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
        const { empresas, frota } = this.state
        const { name } = e.target
        let { value } = e.target

        switch (name) {
            case 'delegaTransf':
                await this.getId(name, value, empresas, 'delegatarioId', 'razaoSocial', 'delegatarioId', 'Empresa')
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

    handleCheck = e => {
        const { value } = e.target
        this.setState({ checked: value })
    }
    render() {
        const { delegaTransf, confirmToast, toastMsg, checked } = this.state

        return <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Baixa de veículo' />
            <BaixaTemplate
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
                            collection={this.props.redux.empresas}
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
                    >
                        Confirmar <span>&nbsp;&nbsp; </span> <Send />
                    </Button>
                </Grid>
            </Grid>
            <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
        </Fragment >
    }
}

const collections = ['veiculos', 'empresas']

export default VehicleHOC(collections, BaixaVeiculo)