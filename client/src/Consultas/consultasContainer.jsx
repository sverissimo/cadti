import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'
import { connect } from 'react-redux'
import { updateCollection } from '../Store/dataActions'

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

class ConsultasContainer extends Component {

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
        tablePKs: ['delegatario_id', 'socio_id', 'procurador_id', 'veiculo_id', 'apolice'],
        dbTables: ['delegatario', 'socios', 'procurador', 'veiculo', 'seguro'],
        options: ['empresas', 'socios', 'procuradores', 'veiculos', 'seguros'],
        empresas: [],
        seguros: [],
        razaoSocial: '',
        showDetails: false,
        showFiles: false,
        openDialog: false,
        filesCollection: [],
        elementDetails: '',
        vehicleDocs: []
    }

    async componentDidMount() {

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        return
        /*   const options = ['empresas', 'socios', 'procuradores', 'veiculos', 'seguros'],
              collection = this.props.redux[options[value]]
          this.setState({ collection }) */
    }

    showDetails = async (e, elementDetails) => {
        const
            { redux } = this.props,
            { options, tab, tablePKs } = this.state,
            primaryKeys = tablePKs.map(pk => humps.camelize(pk))

        let updatedElement

        if (elementDetails) updatedElement = redux[options[tab]].find(e => e[primaryKeys[tab]] === elementDetails[primaryKeys[tab]])

        if (elementDetails !== undefined && updatedElement) {
            await this.setState({ showDetails: !this.state.showDetails, elementDetails: updatedElement })
            void 0
        }
        else this.setState({ showDetails: !this.state.showDetails, elementDetails: undefined })
    }

    closeFiles = () => {
        this.setState({ showFiles: !this.state.showFiles })
    }

    showFiles = id => {
        const
            { tab } = this.state,
            { redux } = this.props

        let selectedFiles = redux.empresaDocs.filter(f => f.metadata.empresaId === id.toString())
        let typeId = 'empresaId'

        switch (tab) {
            case 2:
                typeId = 'procuracaoId'
                let filesToReturn = []

                redux.empresaDocs.forEach(f => {
                    if (f.metadata.fieldName === 'procuracao') {
                        f.metadata.procuradores.forEach(procId => {
                            if (procId === id) filesToReturn.push(f)
                        })
                    }
                })
                selectedFiles = filesToReturn
                break;
            case 3:
                typeId = 'veiculoId'
                selectedFiles = redux.vehicleDocs.filter(f => f.metadata.veiculoId === id.toString())
                break;
            default: void 0
        }

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, typeId, selectedElement: id })

        } else {
            this.setState({ alertType: 'filesNotFound', openAlertDialog: true })
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

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })

    render() {
        const
            { tab, options, items, showDetails, elementDetails, showFiles, selectedElement, filesCollection,
                openAlertDialog, alertType, typeId, tablePKs } = this.state,
            { redux } = this.props,
            { empresas } = redux,
            primaryKeys = tablePKs.map(pk => humps.camelize(pk))

        let updatedElement
        if (elementDetails && showDetails) updatedElement = redux[options[tab]].find(e => e[primaryKeys[tab]] === elementDetails[primaryKeys[tab]])

        /* let updatedElement
        if (elementDetails) updatedElement = redux[options[tab]].find(e => e[tablePKs[tab]] === elementDetails[tablePKs[tab]]) */

        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                collection={this.props.redux[options[tab]]}
                showDetails={this.showDetails}
                showFiles={this.showFiles}
                del={this.deleteHandler}
            />
            {showDetails && <PopUp
                close={this.showDetails}
                title='Informações sobre o veículo'
                format={format}
            >
                <VehicleDetails
                    data={updatedElement || elementDetails}
                    tab={tab}
                />
            </PopUp>}
            {showFiles &&
                <ShowFiles
                    tab={tab}
                    elementId={selectedElement}
                    filesCollection={filesCollection}
                    close={this.closeFiles}
                    format={format}
                    typeId={typeId}
                    empresas={empresas} />
            }
            {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas', 'socios', 'procuradores', 'seguros', 'seguradoras',
    'getFiles/vehicleDocs', 'getFiles/empresaDocs']

export default connect(null, { updateCollection })(StoreHOC(collections, ConsultasContainer))