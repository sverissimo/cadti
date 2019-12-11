import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'
import ReactToast from '../Utils/ReactToast'

import Crumbs from '../Utils/Crumbs'
import AltProcuradoresTemplate from './AltProcuradoresTemplate'
import ShowFiles from '../Utils/ShowFiles'
import { procuradorForm } from '../Forms/procuradorForm'

//import AlertDialog from '../Utils/AlertDialog'

const format = {
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '15%'
}

export default class AltProcuradores extends Component {

    state = {
        empresas: [],
        razaoSocial: 'Sv',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        addedSocios: [0],
        totalShare: 0,
        filteredProc: [],
        procDisplay: 'Clique ou arraste para anexar a procuração referente a este procurador.',
        showFiles: false,
        procuradores: [],
        selectedEmpresa: [],
        procFiles: new FormData(),
    }

    async componentDidMount() {
        const empresas = axios.get('/api/empresas'),
            procuradores = axios.get('/api/procuradores')

        Promise.all([empresas, procuradores])
            .then(res => res.map(r => humps.camelizeKeys(r.data)))
            .then(([empresas, procuradores]) => {
                this.setState({ empresas, procuradores, originalProc: humps.decamelizeKeys(procuradores) });
            })
        await axios.get('/api/getFiles/empresa?fieldName=procFile')
            .then(r => this.setState({ files: r.data }))
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {

        const { name } = e.target
        let { value } = e.target

        const { procuradores } = this.state

        this.setState({ ...this.state, [name]: value })
        
        if (name === 'razaoSocial' && Array.isArray(procuradores)) {
            const filteredProc = procuradores.filter(s => s.razaoSocial === value),
                selectedEmpresa = this.state.empresas.filter(e => e.razaoSocial === value)
            if (filteredProc.length > 0) {
                this.setState({ ...this.state, filteredProc, selectedEmpresa })
            } else this.setState({ filteredProc: [] })

            if (selectedEmpresa.length > 0) {
                await this.setState({ razaoSocial: selectedEmpresa[0].razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa[0].razaoSocial) this.setState({ selectedEmpresa: [] })
            } else this.setState({ selectedEmpresa: [] })
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

    addSocio = async () => {
        let procuradores = this.state.filteredProc,
            sObject = {}

        procuradorForm.forEach(obj => {
            Object.assign(sObject, { [obj.field]: this.state[obj.field] })
        })
        procuradores.push(sObject)

        const lastOne = procuradores[procuradores.length - 1]
        for (let pair of this.state.procFiles.entries()) {
            if (pair[0] === lastOne.cpfProcurador) {
                procuradores[procuradores.length - 1].fileLabel = pair[1].name
            }
        }
        await this.setState({ procuradores, procDisplay: 'Clique ou arraste para anexar a procuração referente a este procurador' })
        procuradorForm.forEach(obj => {
            this.setState({ [obj.field]: '' })
        })
        // console.log (document.getElementsByName('nomeProcurador'))
        //document.getElementsByName('nomeProcurador')[0].focus()
    }

    removeSocio = async index => {

        let procuradores = this.state.filteredProc
        const id = procuradores[index].procuradorId

        await axios.delete(`/api/delete?table=procurador&tablePK=procurador_id&id=${id}`)
            .catch(err => console.log(err))

        procuradores.splice(index, 1)
        this.setState({ filteredProc: procuradores })
    }

    enableEdit = index => {

        let editProc = this.state.filteredProc
        if (editProc[index].edit === true) editProc[index].edit = false
        else {
            editProc.forEach(s => s.edit = false)
            editProc[index].edit = true
        }
        this.setState({ filteredProc: editProc })
    }

    handleEdit = e => {
        const { name, value } = e.target

        let editProc = this.state.filteredProc.filter(p => p.edit === true)[0]
        const index = this.state.filteredProc.indexOf(editProc)

        editProc[name] = value

        let fs = this.state.filteredProc
        fs[index] = editProc        
        this.setState({ filteredProc: fs })
    }

    handleSubmit = async () => {
        const { selectedEmpresa, procuradores, contratoSocial } = this.state

        let submitProc = this.state.filteredProc,
            gotId,
            oldMembers = [], newMembers = [],
            contratoFile = new FormData(),
            keys = procuradorForm.map(el => humps.decamelize(el.field))
        keys.splice(1, 1)

        submitProc.forEach(fs => {
            let { razaoSocial, dataInicio, dataFim, createdAt, edit, ...rest } = fs
            fs = rest
            fs.delegatarioId = selectedEmpresa[0].delegatarioId
            if (!fs.hasOwnProperty('procuradorId')) {
                gotId = procuradores.filter(p => p.cpfProcurador === fs.cpfProcurador)
                if (gotId.length > 0) {
                    fs.procuradorId = gotId[0].procuradorId
                    oldMembers.push(fs)
                } else {
                    newMembers.push(fs)
                }
            } else {
                oldMembers.push(fs)
                delete oldMembers.procuradorId
            }
        })
        const table = 'procurador', tablePK = 'procurador_id'
        let realChanges = [], altObj = {}

        const originals = humps.camelizeKeys(this.state.originalProc)

        oldMembers.forEach(m => {
            originals.forEach(p => {
                if (m.procuradorId === p.procuradorId) {
                    Object.keys(m).forEach(key => {
                        if (m[key] !== p[key] || key === 'procuradorId') {
                            Object.assign(altObj, { [key]: m[key] })
                        }
                    })
                    if (Object.keys(altObj).length > 1) realChanges.push(altObj)
                    altObj = {}
                }
            })
        })

        oldMembers = humps.decamelizeKeys(realChanges)
        newMembers = humps.decamelizeKeys(newMembers)

        try {
            if (oldMembers.length > 0) {
                await axios.put('/api/editProc', { requestArray: oldMembers, table, tablePK, keys })
                //   .then(r => console.log(r.data))
            }

            if (newMembers.length > 0) {
                await axios.post('/api/cadSocios', { procuradores: newMembers, table, tablePK })
                    .then(r => console.log(r.data))
            }

            if (contratoSocial) {
                contratoFile.append('empresaId', selectedEmpresa[0].delegatarioId)
                for (let pair of contratoSocial.entries()) {
                    contratoFile.append(pair[0], pair[1])
                }
                await axios.post('/api/empresaUpload', contratoFile)
                    .then(r => console.log(r.data))
            }
        } catch (err) {
            console.log(err)
            alert(err)
        }

        this.toast()
    }

    handleFiles = (file) => {

        let procFiles = this.state.procFiles
        procFiles.append(this.state.cpfProcurador, file[0])
        this.setState({ procFiles, procDisplay: file[0].name })
    }


    closeFiles = () => {
        this.setState({ showFiles: !this.state.showFiles })
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
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { showFiles, selectedElement, filesCollection, procuradores } = this.state
        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresasHome']} text='Alteração de procuradores' />
                <AltProcuradoresTemplate
                    data={this.state}
                    handleInput={this.handleInput}
                    removeSocio={this.removeSocio}
                    handleFiles={this.handleFiles}
                    addSocio={this.addSocio}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleSubmit={this.handleSubmit}
                    showFiles={this.showFiles}
                />
                {showFiles && <ShowFiles elementId={selectedElement} typeId='cpfProcurador' filesCollection={filesCollection} format={format} close={this.closeFiles} procuradores={procuradores} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </React.Fragment>
        )
    }
}
