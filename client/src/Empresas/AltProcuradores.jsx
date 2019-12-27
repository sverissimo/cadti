import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import Crumbs from '../Utils/Crumbs'
import AltProcuradoresTemplate from './AltProcuradoresTemplate'
import download from '../Utils/downloadFile'
import ShowFiles from '../Utils/ShowFiles'
import { procuradorForm } from '../Forms/procuradorForm'

import AlertDialog from '../Utils/AlertDialog'

const format = {
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '15%'
}

export default class AltProcuradores extends Component {

    constructor() {
        super()
        this.escFunction = (e) => {
            if (e.keyCode === 27) {
                if (this.state.openDialog) this.toggleDialog()
            }
        }
    }

    state = {
        empresas: [],
        razaoSocial: '',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        addedSocios: [0],
        totalShare: 0,
        filteredProc: [],
        procDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
        showFiles: false,
        procuradores: [],
        procFiles: new FormData(),
        procsToAdd: [1],
        procuracoesArray: [],
        selectedDocs: []
    }

    componentDidMount() {
        const empresas = axios.get('/api/empresas'),
            procuradores = axios.get('/api/proc'),
            procuracoes = axios.get('/api/procuracoes')

        Promise.all([empresas, procuradores, procuracoes])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([empresas, procuradores, procuracoes]) => {
                this.setState({ empresas, procuradores, procuracoes, originalProc: humps.decamelizeKeys(procuradores) });
            })

        axios.get('/api/getFiles/empresa?fieldName=procuracao')
            .then(r => this.setState({ files: r.data }))

        document.addEventListener('keydown', this.escFunction, false)
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {

        const { name } = e.target
        let { value } = e.target,
            procuracoes = [...this.state.procuracoes],
            procArray = [],
            procuracoesArray = []

        const procuradores = [...this.state.procuradores]

        this.setState({ ...this.state, [name]: value })

        if (name === 'razaoSocial' && Array.isArray(procuradores)) {
            
            procuracoes = procuracoes.filter(pr => pr.razaoSocial === value)
            
            if (procuracoes[0]) procuracoes.forEach(pr => {
                pr.procuradores.forEach(id => {
                    const pro = procuradores.find(p => p.procuradorId === id)
                    if (pro) procArray.push(pro)
                })
                procuracoesArray.push(procArray)
                procArray = []
            })
            this.setState({ procuracoesArray, selectedDocs: procuracoes })

            const selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
            } else this.setState({ selectedEmpresa: undefined })
        }
    }

    handleBlur = async  e => {
        /* const { selectedEmpresa, razaoSocial } = this.state
        const { name } = e.target
        let { value } = e.target

         */
        /* switch (name) {
            case 'cnpj':
                const alreadyExists = empresas.filter(e => e.cnpj === value)
                if (alreadyExists[0]) {
                    this.setState({ cnpj: '' })
                    this.createAlert(alreadyExists[0])
                }
                break;
            case 'share':
                if (value > 100) {
                   console.log('overShared')
                }
                else {
                    const totalShare = Number(this.state.totalShare) + Number(value)
                    console.log(totalShare)
                }
                break;
            default:
                break;
        } */
    }

    addProc = async () => {
        const { selectedEmpresa, procuradores, procFiles, vencimento } = this.state
        const nProc = [...this.state.procsToAdd]
        let selectedDocs = [...this.state.selectedDocs],
            files = [...this.state.files],
            addedProcs = [],
            sObject = {}

        nProc.forEach((n, i) => {
            procuradorForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field + i] })
            })
            let j = 0
            Object.values(sObject).forEach(v => {
                if (v) j += 1
            })
            if (j > 0) addedProcs.push(sObject)

            j = 0
            sObject = {}

            procuradorForm.forEach(obj => {
                this.setState({ [obj.field + i]: '' })
            })
        })

        let gotId, newMembers = [], procIdArray = [],
            contratoFile = new FormData()

        addedProcs.forEach(fp => {
            gotId = procuradores.filter(p => p.cpfProcurador === fp.cpfProcurador)
            if (gotId.length > 0 && gotId[0].hasOwnProperty('procuradorId')) {
                procIdArray.push(gotId[0].procuradorId)
            } else {
                newMembers.push(fp)
            }
        })

        if (newMembers.length > 0) {
            newMembers = humps.decamelizeKeys(newMembers)
            await axios.post('/api/cadProcuradores', { procuradores: newMembers, table: 'procurador', tablePK: 'procurador_id' })
                .then(procs => {
                    procs.data.forEach(p => procIdArray.push(p.procurador_id))
                })
            await axios.get('/api/proc')
                .then(res => {
                    const procuradores = humps.camelizeKeys(res.data)
                    this.setState({ procuradores })
                })
        }

        const novaProcuracao = {
            delegatario_id: selectedEmpresa.delegatarioId,
            vencimento,
            status: 'vigente',
            procuradores: procIdArray
        }

        let procuracaoId

        await axios.post('/api/cadProcuracao', novaProcuracao)
            .then(r => {
                procuracaoId = r.data[0].procuracao_id
            })

        novaProcuracao.procuracaoId = procuracaoId

        if (procFiles) {
            contratoFile.append('fieldName', 'procuracao')
            contratoFile.append('empresaId', selectedEmpresa.delegatarioId)
            contratoFile.append('procuracaoId', procuracaoId)
            contratoFile.append('procuradores', procIdArray.toString())
            for (let pair of procFiles.entries()) {
                contratoFile.append(pair[0], pair[1])
            }
        }

        await axios.post('/api/empresaUpload', contratoFile)
            .then(r => console.log('uploaded'))

        await axios.get(`/api/getOneFile?collection=empresaDocs&id=${procuracaoId}`)
            .then(r => { if (r.data[0]) files.push(r.data[0]) })

        selectedDocs.reverse()
        selectedDocs.push(novaProcuracao)
        selectedDocs.reverse()

        this.setState({
            selectedDocs,
            files,
            procDisplay: 'Clique ou arraste para anexar a procuração referente a este(s) procurador(es).',
            procsToAdd: [1]
        })

        this.toast()
    }

    removeProc = async proc => {

        const { files } = this.state,
            id = proc.procuracaoId,
            selectedFile = files.find(f => Number(f.metadata.procuracaoId) === id)


        let procs = [...this.state.selectedDocs]

        await axios.delete(`/api/delete?table=procuracao&tablePK=procuracao_id&id=${id}`)
            .then(r => { console.log(r.data) })

        if (selectedFile && selectedFile.hasOwnProperty('_id')) axios.get(`/api/deleteFile/${selectedFile._id}`)

        const i = procs.indexOf(proc)
        procs.splice(i, 1)

        this.setState({ selectedDocs: procs })
    }

    enableEdit = index => {

        let editProc = [...this.state.filteredProc]

        if (editProc[index].edit === true) {
            editProc[index].edit = false
        } else {
            editProc.forEach(s => {
                s.edit = false
            })
            editProc[index].edit = true
        }
        this.setState({ filteredProc: editProc })
    }

    handleEdit = e => {
        const { name, value } = e.target

        let editProc = this.state.filteredProc.filter(p => p.edit === true)[0]
        const index = this.state.filteredProc.indexOf(editProc)

        editProc[name] = value

        let fp = [...this.state.filteredProc]
        fp[index] = editProc
        this.setState({ filteredProc: fp })
    }

    handleFiles = (file) => {
        let procFiles = this.state.procFiles
        procFiles.append(this.state.cpfProcurador, file[0])
        this.setState({ procFiles, procDisplay: file[0].name })
    }

    getFile = id => {
        const { files } = this.state

        const selectedFile = files.find(f => Number(f.metadata.procuracaoId) === id)

        if (selectedFile) {
            const { _id, filename } = selectedFile
            download(_id, filename, 'empresaDocs')
        } else {
            this.createAlert('filesNotFound')
        }
    }

    showFiles = cpf => {
        let selectedFiles = this.state.files.filter(f => f.metadata.cpfProcurador === cpf.toString())

        if (selectedFiles[0]) {
            this.setState({ filesCollection: selectedFiles, showFiles: true, selectedElement: cpf })

        } else {
            console.log('filesNotFound')
            this.setState({ filesCollection: [] })
        }
    }

    plusOne = () => {
        let i = [...this.state.procsToAdd]
        i.push(1)
        this.setState({ procsToAdd: i })
    }

    minusOne = () => {
        let i = [...this.state.procsToAdd]
        i.pop()
        this.setState({ procsToAdd: i })
    }

    createAlert = (alert) => {
        let dialogTitle, message

        switch (alert) {
            case 'filesNotFound':
                const subject = 'Procuração'
                dialogTitle = 'Arquivos não encontrados'
                message = `Não há nenhum arquivo anexado no sistema para a ${subject} selecionada. 
                Ao cadastrar ou atualizar a ${subject}, certifique-se de anexar o arquivo correspondente.`
                break;
            case 'fieldsMissing':
                dialogTitle = 'Favor preencher todos os campos.'
                message = 'Os campos acima são de preenchimento obrigatório. Certifique-se de ter preenchido todos eles.'
                break;
            case 'plateExists':
                dialogTitle = 'Placa já cadastrada!'
                message = 'A placa informada já está cadastrada. Para atualizar seguro, alterar dados ou solicitar baixa, utilize as opções acima. '
                break;
            default:
                break;
        }
        this.setState({ openDialog: true, dialogTitle, message })
    }

    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })        
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { showFiles, selectedElement, filesCollection, openDialog, dialogTitle, message } = this.state

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresasHome']} text='Alteração de procuradores' />
                <AltProcuradoresTemplate
                    data={this.state}
                    handleInput={this.handleInput}
                    removeProc={this.removeProc}
                    handleFiles={this.handleFiles}
                    addProc={this.addProc}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleSubmit={this.handleSubmit}
                    showFiles={this.showFiles}
                    plusOne={this.plusOne}
                    minusOne={this.minusOne}
                    getFile={this.getFile}
                />
                {showFiles && <ShowFiles elementId={selectedElement} typeId='procuracao' filesCollection={filesCollection} format={format} close={this.closeFiles} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
                <AlertDialog open={openDialog} close={this.toggleDialog} title={dialogTitle} message={message} />
            </React.Fragment>
        )
    }
}