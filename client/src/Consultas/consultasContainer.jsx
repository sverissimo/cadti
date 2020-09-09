import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import moment from 'moment'

import StoreHOC from '../Store/StoreHOC'
import { connect } from 'react-redux'
import { updateCollection } from '../Store/dataActions'

import ConsultasTemplate from './ConsultasTemplate'
import { TabMenu } from '../Layouts'

import Certificate from '../Veiculos/Certificate'
import ShowDetails from '../Reusable Components/ShowDetails'
import ShowFiles from '../Reusable Components/ShowFiles'
import AlertDialog from '../Reusable Components/AlertDialog'

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
                if (this.state.showCertificate) this.closeCertificate()
            }
        }
    }

    state = {
        tab: 0,
        items: ['Empresas', 'Sócios', 'Procuradores', 'Veículos', 'Seguros'],
        tablePKs: ['delegatario_id', 'socio_id', 'procurador_id', 'veiculo_id', 'id'],
        dbTables: ['delegatario', 'socios', 'procurador', 'veiculo', 'seguro'],
        options: ['empresas', 'socios', 'procuradores', 'veiculos', 'seguros'],
        detailsTitle: ['Empresa', 'Sócio', 'Procurador', 'Placa', 'Apólice'],
        detailsHeader: ['razaoSocial', 'nomeSocio', 'nomeProcurador', 'placa', 'apolice'],
        empresas: [],
        seguros: [],
        razaoSocial: '',
        showDetails: false,
        showFiles: false,
        openDialog: false,
        filesCollection: [],
        elementDetails: '',
        vehicleDocs: [],
        showCertificate: false
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction, false)        
    }

    componentWillUnmount() { this.setState({}) }

    changeTab = async (e, value) => {
        await this.setState({ tab: value })
        return
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
            { veiculos, socios, empresaDocs, vehicleDocs } = this.props.redux
        let
            selectedFiles,
            typeId

        switch (tab) {
            case 0:
                selectedFiles = empresaDocs.filter(f => f.metadata.empresaId === id && f.metadata?.tempFile === false)
                typeId = 'empresaId'
                break

            case 1:
                selectedFiles = empresaDocs.filter(f => f.metadata.empresaId === id)
                const socio = socios.find(v => v.socioId === id)

                if (socio) {
                    let sociosArray = []
                    selectedFiles = empresaDocs
                        .filter(f => f.metadata.empresaId === socio.delegatarioId)
                        .forEach(f => {
                            if (f.metadata.socios && f.metadata.socios.includes(id))
                                sociosArray.push(f)
                        })
                    selectedFiles = sociosArray
                }
                break

            case 2:
                typeId = 'procuracaoId'
                let filesToReturn = []

                empresaDocs.forEach(f => {
                    if (f?.metadata?.fieldName === 'procuracao') {
                        if (f?.metadata?.procuradores)
                            f.metadata.procuradores.forEach(procId => {
                                if (procId === id) filesToReturn.push(f)
                            })
                    }
                })
                selectedFiles = filesToReturn
                break

            case 3:
                typeId = 'veiculoId'
                selectedFiles = vehicleDocs.filter(f => f.metadata.veiculoId === id)
                const vehicle = veiculos.find(v => v.veiculoId === id)
                if (vehicle) {
                    const seguro = empresaDocs.find(f => f?.metadata?.apolice === vehicle?.apolice?.toString())
                    if (seguro) selectedFiles.push(seguro)
                }
                break

            case 4:
                selectedFiles = empresaDocs.filter(f => f.metadata.apolice === id)
                break
            default: void 0
        }

        selectedFiles = selectedFiles.filter(file => file?.metadata?.tempFile === false)

        if (selectedFiles[0]) {
            selectedFiles = selectedFiles
                .sort((a, b) => new Date(a['uploadDate']) - new Date(b['uploadDate']))
                .reverse()
            this.setState({ filesCollection: selectedFiles, showFiles: true, typeId, selectedElement: id })

        } else {
            this.setState({ alertType: 'filesNotFound', openAlertDialog: true, subject: typeId })
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

    showCertificate = async vehicle => {

        const
            { laudos } = this.props.redux,
            { veiculoId, anoCarroceria, situacao, vencimento, vencimentoContrato } = vehicle,
            seguroVencido = moment(vencimento).isBefore(),
            contratoVencido = moment(vencimentoContrato).isBefore(),
            currentYear = new Date().getFullYear(),
            isOld = currentYear - anoCarroceria >= 15
        
        if (isOld) {
            const hasLaudo = laudos.find(l => l.veiculoId === veiculoId),
                validLaudo = moment(hasLaudo?.validade).isAfter(moment())

            if (!validLaudo) {
                await this.setState({
                    openAlertDialog: true,
                    customTitle: 'Certificado de segurança veicular pendente.',
                    customMessage: 'O laudo de segurança veicular não está registrado no sistema ou se encontra vencido. Para regularizar, acesse Veículos -> Laudos.'
                })
                return
            }
        }

        if (situacao !== 'Ativo') {
            await this.setState({ alertType: 'veiculoPendente', openAlertDialog: true })
            return
        }
        if (seguroVencido) {
            await this.setState({ alertType: 'seguroVencido', openAlertDialog: true })
            return
        }
        if (contratoVencido) {
            await this.setState({ alertType: 'contratoVencido', openAlertDialog: true })
            return
        }

        const url = window.location.origin + '/crv'
        localStorage.setItem('vehicle', JSON.stringify(vehicle))
        window.open(url, 'noopener')
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    closeCertificate = () => this.setState({ showCertificate: !this.state.showCertificate })

    render() {
        const
            { tab, options, items, showDetails, elementDetails, showFiles, selectedElement, filesCollection, typeId, tablePKs, showCertificate, certified,
                detailsTitle, detailsHeader, openAlertDialog, alertType, customTitle, customMessage } = this.state,
            { redux } = this.props,
            { empresas } = redux,
            primaryKeys = tablePKs.map(pk => humps.camelize(pk))

        let updatedElement
        if (elementDetails && showDetails) updatedElement = redux[options[tab]].find(e => e[primaryKeys[tab]] === elementDetails[primaryKeys[tab]])

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
                showCertificate={this.showCertificate}
            />
            {showDetails &&
                <ShowDetails
                    close={this.showDetails}
                    data={updatedElement || elementDetails}
                    tab={tab}
                    title={detailsTitle[tab]}
                    header={detailsHeader[tab]}
                />
            }
            {
                showCertificate &&
                <Certificate vehicle={certified} />
            }
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
            {openAlertDialog &&
                <AlertDialog
                    open={openAlertDialog} close={this.closeAlert} alertType={alertType} tab={tab} customMessage={customMessage} customTitle={customTitle}
                />}
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas', 'socios', 'procuradores', 'seguros', 'seguradoras',
    'getFiles/vehicleDocs', 'getFiles/empresaDocs', 'equipamentos', 'acessibilidade', 'laudos']

export default connect(null, { updateCollection })(StoreHOC(collections, ConsultasContainer))