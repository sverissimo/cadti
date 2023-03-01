import React, { Component, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'
import moment from 'moment'

import StoreHOC from '../Store/StoreHOC'

import ConsultasTemplate from './ConsultasTemplate'
import { TabMenu } from '../Layouts'

import Certificate from '../Veiculos/Certificate'
import ShowDetails from '../Reusable Components/ShowDetails'
import ShowFiles from '../Reusable Components/ShowFiles'
import AlertDialog from '../Reusable Components/AlertDialog'
import removePDF from '../Utils/removePDFButton'
import getEmpresas from './getEmpresas'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'

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
        tablePKs: ['codigo_empresa', 'socio_id', 'procurador_id', 'veiculo_id', 'id'],
        dbTables: ['empresas', 'socios', 'procuradores', 'veiculos', 'seguros'],
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
        removePDF() //Desabilita opção de exportar como PDF do material-table
    }
    componentWillUnmount() {
        console.log("🚀 ~ file: Consultas.jsx:63 ~ ConsultasContainer ~ componentWillUnmount ~ true", true)
        removePDF(true)
        this.setState({})
    }
    changeTab = (e, value) => {
        this.setState(prevState => ({ tab: value }))
    }

    showDetails = (e, elementDetails) => {
        const
            { redux } = this.props,
            { options, tab, tablePKs } = this.state,
            primaryKeys = tablePKs.map(pk => humps.camelize(pk))

        let updatedElement

        if (elementDetails) {
            updatedElement = redux[options[tab]].find(e => e[primaryKeys[tab]] === elementDetails[primaryKeys[tab]])
        }

        if (updatedElement) {
            this.setState(prevState => ({ showDetails: !!!prevState.showDetails, elementDetails: updatedElement }))
        }
        else {
            this.setState({ showDetails: !this.state.showDetails, elementDetails: undefined })
            //this.setState({ showDetails: !this.state.showDetails })
        }
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
                        .filter(f => socio.empresas.some(e => e.codigoEmpresa === f.metadata.empresaId && f.metadata.fieldName !== 'crc'))
                    selectedFiles.forEach(f => {
                        if (f.metadata.socios && f.metadata.socios.includes(id)) {
                            sociosArray.push(f)
                        }
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
        console.log(selectedFiles)
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

    confirmDeactivate = data => {
        if (data.situacao === 'Desativada') {
            alert(`A empresa ${data.razaoSocial} já foi desativada.`)
            return
        }
        this.setState({
            openConfirmDialog: true,
            confirmType: 'deactivateEmpresa',
            element: data?.razaoSocial || '',
            empresaToDeactivate: data?.codigoEmpresa
        })
    }

    deleteHandler = data => {
        const { dbTables, tablePKs, tab } = this.state,
            table = dbTables[tab],
            tablePK = tablePKs[tab],
            itemId = humps.camelize(tablePK)

        let { codigoEmpresa } = data

        //Socios e procuradores não possuem codigoEmpresa, mas array de empresa
        if (table === 'socios' || table === 'procuradores')
            codigoEmpresa = JSON.stringify(data?.empresas)

        //Demanda da SGTI para não apagar as empresas, mas alterar o status para "inativo"
        if (tab === 0) {
            codigoEmpresa = data
            const reqBody = {
                table,
                tablePK: 'codigo_empresa',
                update: {
                    codigo_empresa: codigoEmpresa,
                    situacao: 'Desativada'
                }
            }

            axios.put('/api/editElements', reqBody)
            this.closeConfirmDialog()
        }
        else
            axios.delete(`/api/delete?table=${table}&tablePK=${tablePK}&id=${data[itemId]}&codigoEmpresa=${codigoEmpresa}&cpf_socio=${data.cpfSocio}&cpf_procurador=${data.cpfProcurador}`)
                .then(r => console.log(r.data))
    }

    showCertificate = async vehicle => {

        const
            { parametros } = this.props.redux,
            { anoCarroceria, situacao, vencimento } = vehicle,
            seguroVencido = moment(vencimento).isBefore(),
            currentYear = new Date().getFullYear(),
            isOld = currentYear - anoCarroceria >= 16

        if (isOld) {
            const validLaudo = moment(vehicle.vencimentoLaudo).isAfter(moment())

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

        const url = window.location.origin + '/crv'
        localStorage.setItem('vehicle', JSON.stringify(vehicle))

        //Envia os nomes da Secretaria, sub, etc para o certificado com base no DB>GlobalState
        if (parametros && parametros[0]) {
            const
                { nomes } = parametros[0]
            localStorage.setItem('nomes', JSON.stringify(nomes))

        }
        window.open(url, 'noopener')
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    closeCertificate = () => this.setState({ showCertificate: !this.state.showCertificate })
    closeConfirmDialog = () => this.setState({ openConfirmDialog: false })

    render() {
        const
            { tab, options, items, showDetails, elementDetails, showFiles, selectedElement, filesCollection, typeId, showCertificate, certified,
                detailsTitle, detailsHeader, openAlertDialog, openConfirmDialog, alertType, confirmType, customTitle, customMessage } = this.state,
            { redux, user } = this.props,
            { empresas, procuracoes, procuradores, empresaDocs, altContrato } = redux
        let
            updatedElement,
            collection = [...this.props.redux[options[tab]]]

        //Caso a aba seja Sócios ou Procuradores, extrai e renderiza o nome das empresas das arrays de codigoEmpresa de cada sócio/procurador
        if (tab === 1 || tab === 2)
            collection = getEmpresas(collection, empresas, tab)

        return <Fragment>
            <TabMenu items={items}
                tab={tab}
                changeTab={this.changeTab} />
            <ConsultasTemplate
                tab={tab}
                items={items}
                collection={collection}
                empresas={empresas}
                procuracoes={procuracoes}
                user={user}
                showDetails={this.showDetails}
                showFiles={this.showFiles}
                del={this.deleteHandler}
                showCertificate={this.showCertificate}
                confirmDeactivate={this.confirmDeactivate}
            />
            {showDetails &&
                <ShowDetails
                    close={this.showDetails}
                    data={updatedElement || elementDetails}
                    tab={tab}
                    title={detailsTitle[tab]}
                    header={detailsHeader[tab]}
                    empresas={empresas}
                    procuracoes={procuracoes}
                    procuradores={procuradores}
                    empresaDocs={empresaDocs}
                    altContrato={altContrato}
                />
            }
            {
                showCertificate &&
                <Certificate vehicle={certified} />
            }
            {
                showFiles &&
                <ShowFiles
                    tab={tab}
                    elementId={selectedElement}
                    filesCollection={filesCollection}
                    close={this.closeFiles}
                    format={format}
                    typeId={typeId}
                    empresas={empresas}
                    empresaDocs={empresaDocs}
                />
            }
            {
                openAlertDialog &&
                <AlertDialog
                    open={openAlertDialog} close={this.closeAlert} alertType={alertType} tab={tab} customMessage={customMessage} customTitle={customTitle}
                />
            }
            {
                openConfirmDialog &&
                <ConfirmDialog
                    open={openConfirmDialog}
                    close={this.closeConfirmDialog}
                    confirm={this.deleteHandler}
                    element={this.state.element}
                    type={confirmType}
                    id={this.state.empresaToDeactivate}
                />
            }
        </Fragment>
    }
}

const collections = ['veiculos', 'empresas', 'socios', 'procuradores', 'seguros', 'seguradoras', 'procuracoes',
    'getFiles/vehicleDocs', 'getFiles/empresaDocs', 'equipamentos', 'acessibilidade', 'laudos', 'altContrato', 'parametros']

export default StoreHOC(collections, ConsultasContainer)