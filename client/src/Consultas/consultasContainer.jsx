import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import ConsultasTemplate from './consultasTemplate'
import { TabMenu } from '../Layouts'

import PopUp from '../Utils/PopUp'
import VehicleDetails from '../Veiculos/VehicleDetails'
import ShowFiles from '../Utils/ShowFiles'
import AlertDialog from '../Utils/AlertDialog'

const format = {
    top: '5%',
    left: '10%',
    right: '10%'
}

export default class extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.showDetails) this.showDetails()
                if (this.state.showFiles) this.closeFiles()
            }
        }
    }

    state = {
        tab: 0,
        items: ['Veículos', 'Delegatários', 'Sócios', 'Seguros'],
        tablePKs: ['veiculo_id', 'delegatario_id', 'procurador_id', 'apolice'],
        dbTables: ['veiculo', 'delegatario', 'procurador', 'seguro'],
        empresas: [],
        seguros: [],
        razaoSocial: '',
        showDetails: false,
        showFiles: false,
        openDialog: false,
        filesCollection: [],
        vehicleInfo: ''
    }

    async componentDidMount() {
        const vehicles = axios.get('/api/veiculosInit'),
            insurances = axios.get('/api/seguros'),
            delega = axios.get('/api/empresas'),
            proc = axios.get('/api/socios')

        axios.get('/api/vehicleFiles')
            .then(res => this.setState({ files: res.data }))            

        Promise.all([vehicles, insurances, delega, proc])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, seguros, empresas, procuradores]) => {
                this.setState({ veiculos, seguros, empresas, procuradores, collection: veiculos })
            })
        document.addEventListener('keydown', this.escFunction, false)


    }
    componentWillUnmount() {
        this.setState({})
    }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        const options = ['veiculos', 'empresas', 'procuradores', 'seguros'],
            collection = this.state[options[value]]
        this.setState({ collection })
    }

    handleEdit = (data) => {
        this.setState({ data })
    }

    showDetails = (e, vehicleInfo) => {

        if (vehicleInfo !== undefined) this.setState({ showDetails: !this.state.showDetails, vehicleInfo })
        else this.setState({ showDetails: !this.state.showDetails, vehicleInfo: undefined })
    }

    closeFiles = () => {
        this.setState({ showFiles: !this.state.showFiles })
    }

    showFiles = id => {

        let selectedFiles = this.state.files.filter(f => f.metadata.veiculoId === id.toString())

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, selectedVehicle: id })

        } else {
            this.createAlert('filesNotFound')
            this.setState({ filesCollection: [] })
        }
    }

    deleteHandler = data => {
        const { dbTables, tablePKs, tab } = this.state,
            table = dbTables[tab],
            tablePK = tablePKs[tab],
            itemId = humps.camelize(tablePK)

        axios.delete(`/api/delete?table=${table}&tablePK=${tablePK}&id=${data[itemId]}`)
            .then(r => console.log(r.data))
    }

    createAlert = (alert) => {
        let dialogTitle, message

        switch (alert) {
            case 'filesNotFound':
                dialogTitle = 'Arquivos não encontrados'
                message = `Não há nenhum arquivo anexado no sistema para este veículo. 
                Ao cadastrar ou atualizar os dados de um veículo, certifique-se de anexar os documentos solicitados.`
                break;
            default:
                break;
        }
        this.setState({ openDialog: true, dialogTitle, message })
    }

    toggleDialog = () => {
        this.setState({ openDialog: !this.state.openDialog })
    }

    render() {
        const { tab, items, collection, showDetails, vehicleInfo, showFiles, selectedVehicle, filesCollection, 
            openDialog, dialogTitle, message } = this.state

        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                collection={collection}
                showDetails={this.showDetails}
                showFiles={this.showFiles}
                handleEdit={this.handleEdit}
                del={this.deleteHandler}
            />
            {showDetails && <PopUp
                close={this.showDetails}
                title='Informações sobre o veículo'
                format={format}
            >
                <VehicleDetails
                    data={vehicleInfo}
                    tab={tab}
                />
            </PopUp>}
            {showFiles && <ShowFiles veiculoId={selectedVehicle} filesCollection={filesCollection} close={this.closeFiles} format={format} />}
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}