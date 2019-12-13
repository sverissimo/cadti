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
        procFiles: new FormData(),
        procsToAdd: [1]
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

        axios.get('/api/getFiles/empresa?fieldName=procFile')
            .then(r => this.setState({ files: r.data }))
    }

    componentWillUnmount() { this.setState({}) }

    handleInput = async e => {

        const { name } = e.target
        let { value } = e.target, procuracoes = []

        const procuradores = [...this.state.procuradores]

        this.setState({ ...this.state, [name]: value })

        if (name === 'razaoSocial' && Array.isArray(procuradores)) {
            let filteredProc = procuradores.filter(p => p.procuracoes.find(pr => pr.razaoSocial === value))
            const selectedEmpresa = this.state.empresas.find(e => e.razaoSocial === value)

            if (filteredProc.length > 0) {
                this.setState({ ...this.state, filteredProc, selectedEmpresa })
            } else this.setState({ filteredProc: [] })
            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
            } else this.setState({ selectedEmpresa: undefined })

            if (filteredProc[0] && selectedEmpresa) {
                filteredProc.forEach(pr => {
                    let procObj = {}
                    const proc = pr.procuracoes.find(p => p.delegatarioId === selectedEmpresa.delegatarioId)
                    if (proc) {
                        Object.assign(procObj, proc, { procuradorId: pr.procuradorId })
                        delete procObj.razaoSocial
                        procuracoes.push(procObj)
                        this.setState({ procuracoes })
                    }
                })
            }
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

    addProc = () => {
        const nProc = [...this.state.procsToAdd]
        let procuradores = [...this.state.filteredProc],
            sObject = {}

        nProc.forEach((n, i) => {
            procuradorForm.forEach(obj => {
                Object.assign(sObject, { [obj.field]: this.state[obj.field + i] })
            })
            let j = 0
            Object.values(sObject).forEach(v => {                
                if (v) j += 1
            })
            if (j >0) procuradores.push(sObject)

            j = 0
            sObject = {}
            

            procuradorForm.forEach(obj => {
                this.setState({ [obj.field + i]: '' })
            })
        })

        /* const lastOne = procuradores[procuradores.length - 1]
                    for (let pair of this.state.procFiles.entries()) {
                        if (pair[0] === lastOne.cpfProcurador) {
                            procuradores[procuradores.length - 1].fileLabel = pair[1].name
                        }
                    } */

        this.setState({
            filteredProc: procuradores,
            procDisplay: 'Clique ou arraste para anexar a procuração referente a este procurador',
            procsToAdd: [1]
        })



        //document.getElementsByName('nomeProcurador')[0].focus()        
    }

    removeProc = async index => {

        let procuradores = this.state.filteredProc
        const id = procuradores[index].procuradorId

        await axios.delete(`/api/delete?table=procurador&tablePK=procurador_id&id=${id}`)
            .catch(err => console.log(err))

        procuradores.splice(index, 1)
        this.setState({ filteredProc: procuradores })
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
        /* for (let [k, v] of this.state.procFiles.entries()) {
            console.log(k, ', ', v )
        } */
    }

    handleSubmit = async () => {
        const { selectedEmpresa, procuradores, contratoSocial } = this.state

        let submitProc = this.state.filteredProc,
            gotId,
            oldMembers = [], newMembers = [],
            contratoFile = new FormData(),
            keys = procuradorForm.map(el => humps.decamelize(el.field))
        keys.splice(1, 1)

        submitProc.forEach(fp => {
            let { razaoSocial, dataInicio, createdAt, edit, ...rest } = fp
            fp = rest
            fp.delegatarioId = selectedEmpresa.delegatarioId
            if (!fp.hasOwnProperty('procuradorId')) {
                gotId = procuradores.filter(p => p.cpfProcurador === fp.cpfProcurador)
                if (gotId.length > 0 && gotId[0].hasOwnProperty('procuradorId')) {
                    fp.procuradorId = gotId[0].procuradorId
                    oldMembers.push(fp)
                } else {
                    newMembers.push(fp)
                }
            } else {
                oldMembers.push(fp)
            }
        })
        //console.log(newMembers, oldMembers)
        const table = 'procurador', tablePK = 'procurador_id'
        let realChanges = [], altObj = {}, oldProcs = []

        const originals = humps.camelizeKeys(this.state.originalProc)

        oldMembers.forEach(m => {
            oldProcs.push({ delegatarioId: selectedEmpresa.delegatarioId, procuradorId: m.procuradorId, vencimento: m.vencimento })
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

        /* try {
            if (oldMembers.length > 0) {
                await axios.put('/api/editProc', { requestArray: oldMembers, table, tablePK, keys })
                //   .then(r => console.log(r.data))
            }

            if (newMembers.length > 0) {
                await axios.post('/api/cadProcuradores', { procuradores: newMembers, table, tablePK })
                    .then(r => console.log(r.data))
            }

            if (contratoSocial) {
                contratoFile.append('empresaId', selectedEmpresa.delegatarioId)
                for (let pair of contratoSocial.entries()) {
                    contratoFile.append(pair[0], pair[1])
                }
                await axios.post('/api/empresaUpload', contratoFile)
                    .then(r => console.log(r.data))
            }
        } catch (err) {
            console.log(err)
            alert(err)
        } */

        this.toast()
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
    closeFiles = () => this.setState({ showFiles: !this.state.showFiles })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { showFiles, selectedElement, filesCollection, procuradores } = this.state

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
                />
                {showFiles && <ShowFiles elementId={selectedElement} typeId='cpfProcurador' filesCollection={filesCollection} format={format} close={this.closeFiles} procuradores={procuradores} />}
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
            </React.Fragment>
        )
    }
}