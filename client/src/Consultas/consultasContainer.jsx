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
        items: ['Empresas', 'Sócios', 'Procuradores', 'Veículos', 'Seguros'],
        tablePKs: ['delegatario_id', 'socios', 'procurador_id', 'veiculo_id', 'apolice'],
        dbTables: ['delegatario', 'socios', 'procurador', 'veiculo', 'seguro'],
        empresas: [],
        seguros: [],
        razaoSocial: '',
        showDetails: false,
        showFiles: false,
        openDialog: false,
        filesCollection: [],
        elementDetails: '',
        vehicleFiles: []
    }

    async componentDidMount() {
        const vehicles = axios.get('/api/veiculosInit'),
            insurances = axios.get('/api/seguros'),
            delega = axios.get('/api/empresas'),
            soc = axios.get('/api/socios'),
            proc = axios.get('/api/proc')

        axios.get('/api/getFiles/vehicle')
            .then(res => this.setState({ vehicleFiles: res.data }))

        axios.get('/api/getFiles/empresa')
            .then(res => this.setState({ empresaFiles: res.data }))

        Promise.all([vehicles, insurances, delega, soc, proc])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([veiculos, seguros, empresas, socios, procuradores]) => {
                this.setState({ veiculos, seguros, empresas, socios, procuradores, collection: empresas })
            })
        document.addEventListener('keydown', this.escFunction, false)

    }
    componentWillUnmount() {
        this.setState({})
    }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        const options = ['empresas', 'socios', 'procuradores', 'veiculos', 'seguros'],
            collection = this.state[options[value]]
        this.setState({ collection })
    }

    handleEdit = (data) => {
        this.setState({ data })
    }

    showDetails = (e, elementDetails) => {

        if (elementDetails !== undefined) this.setState({ showDetails: !this.state.showDetails, elementDetails })
        else this.setState({ showDetails: !this.state.showDetails, elementDetails: undefined })
    }

    closeFiles = () => {
        this.setState({ showFiles: !this.state.showFiles })
    }

    showFiles = id => {
        const { tab } = this.state
        let selectedFiles = this.state.empresaFiles.filter(f => f.metadata.empresaId === id.toString())
        let typeId = 'empresaId'

        switch (tab) {
            case 2:
                typeId = 'procuracaoId'
                selectedFiles = this.state.empresaFiles.filter(f => f.metadata.procuracaoId === id.toString())
                break;
            case 3:
                typeId = 'veiculoId'
                selectedFiles = this.state.vehicleFiles.filter(f => f.metadata.veiculoId === id.toString())
                break;
            default: void 0                
        }

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, typeId, selectedElement: id })

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
        let dialogTitle, message, subject

        switch (alert) {
            case 'filesNotFound':
                subject = this.state.dbTables[this.state.tab]
                dialogTitle = 'Arquivos não encontrados'
                message = `Não há nenhum arquivo anexado no sistema para o ${subject} selecionado. 
                Ao cadastrar ou atualizar os dados do ${subject}, certifique-se de anexar os documentos solicitados.`
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
        const { tab, items, collection, showDetails, elementDetails, showFiles, selectedElement, filesCollection,
            openDialog, dialogTitle, message, typeId } = this.state

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
                    data={elementDetails}
                    tab={tab}
                />
            </PopUp>}
            {showFiles && <ShowFiles tab={tab} elementId={selectedElement} filesCollection={filesCollection} 
            close={this.closeFiles} format={format} typeId={typeId} />}
            <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
        </Fragment>
    }
}