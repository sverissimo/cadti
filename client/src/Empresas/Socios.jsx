import React, { Component } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import SociosTemplate from './SociosTemplate'
import ReactToast from '../Reusable Components/ReactToast'
import valueParser from '../Utils/valueParser'

import Crumbs from '../Reusable Components/Crumbs'
import { sociosForm } from '../Forms/dadosSociosForm'
import AlertDialog from '../Reusable Components/AlertDialog'
import { removeFile, sizeExceedsLimit } from '../Utils/handleFiles'
import { setEmpresaDemand } from '../Utils/setEmpresaDemand'
import { logGenerator } from '../Utils/logGenerator'

class AltSocios extends Component {

    state = {
        razaoSocial: '',
        toastMsg: 'Dados atualizados!',
        confirmToast: false,
        files: [],
        fileNames: [],
        openDialog: false,
        dialogTitle: '',
        addedSocios: [0],
        totalShare: 0,
        filteredSocios: [],
        dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
        showFiles: false,
        showPendencias: false
    }

    componentDidMount() {
        const
            { redux } = this.props,
            demand = this.props?.location?.state?.demand,
            originals = humps.decamelizeKeys(redux.socios),
            socios = JSON.parse(JSON.stringify(redux.socios)),
            filteredSocios = socios.filter(s => s.razaoSocial === this.state.razaoSocial)

        if (demand) {

            const filteredSocios = socios.filter(s => s.codigoEmpresa === demand.empresaId)
            console.log(filteredSocios)

            const
                demandState = setEmpresaDemand(demand, redux, filteredSocios),
                { latestDoc, ...updatedState } = demandState
            console.log(demandState)
            this.setState({ ...updatedState, contratoSocial: latestDoc, originals })
        }
        else this.setState({ originals, filteredSocios })
    }

    componentDidUpdate(prevProps, prevState) {
        const
            { socios } = prevProps.redux,
            { originals } = prevState,
            decamSocios = humps.decamelizeKeys(socios)

        if (JSON.stringify(decamSocios) !== JSON.stringify(originals))
            this.setState({ originals: decamSocios })
    }

    componentWillUnmount() {
        this.setState({})
        document.removeEventListener('keydown', this.escFunction, false)
    }

    handleInput = async e => {
        const
            { empresas } = this.props.redux,
            { name } = e.target
        let
            { value } = e.target

        const parsedValue = valueParser(name, value)

        this.setState({ [name]: parsedValue })

        if (name === 'razaoSocial') {
            const
                originalSocios = humps.camelizeKeys(this.state.originals),
                filteredSocios = originalSocios.filter(s => s.razaoSocial === value).map(s => s),
                selectedEmpresa = empresas.find(e => e.razaoSocial === value)

            if (filteredSocios.length > 0) {
                this.setState({ filteredSocios, selectedEmpresa })
            } else this.setState({ filteredSocios: [] })
            if (selectedEmpresa) {
                await this.setState({ razaoSocial: selectedEmpresa.razaoSocial, selectedEmpresa })
                if (value !== selectedEmpresa.razaoSocial) this.setState({ selectedEmpresa: undefined })
            } else this.setState({ selectedEmpresa: undefined })
        }
    }

    handleBlur = async e => {
        const { filteredSocios, share } = this.state
        const { name } = e.target
        let { value } = e.target
        switch (name) {
            case 'cpfSocio':
                const alreadyExists = filteredSocios.find(e => e.cpfSocio === value)
                if (alreadyExists) {
                    this.setState({ alertType: 'alreadyExists', openAlertDialog: true })
                    this.setState({ cpfSocio: '' })
                }
                break;
            case 'share':

                if (share && typeof share !== 'number')
                    await this.setState({ share: Number(this.state.share) })                         //Garante que o state é um número

                if (value) {
                    value = this.state.share
                    if (value > 100) {
                        await this.setState({ share: '' })
                        value = ''
                        this.setState({ alertType: 'numberNotValid', openAlertDialog: true })
                    }
                    if (value < 0) {
                        value = value * -1
                        this.setState({ share: value })
                    }
                    if (value > 0) {
                        let totalShare = 0
                        const allShares = filteredSocios.map(s => s.share ? Number(s.share) : 0)            //Procura valor share entre os sócios

                        if (allShares[0])                                                   // se encontrar, retorna a soma dos valores
                            totalShare = allShares.reduce((a, b) => a + b)

                        totalShare += value
                        //console.log(totalShare, typeof totalShare)
                        this.setState({ totalShare })
                    }
                }
                break;
            default: break;
        }
    }

    addSocio = async () => {
        let socios = this.state.filteredSocios,
            sObject = {}

        //check if totalShare is more than 100

        if (this.state.totalShare > 100) {
            this.setState({ openAlertDialog: true, alertType: 'overShared' })
            return null
        }

        sociosForm.forEach(obj => {
            Object.assign(sObject, { [obj.field]: this.state[obj.field] })
        })
        socios.unshift(sObject)

        await this.setState({ filteredSocios: socios })

        sociosForm.forEach(async obj => {
            await this.setState({ [obj.field]: undefined })
        })
        document.getElementsByName('nomeSocio')[0].focus()
    }

    removeSocio = async index => {
        let socios = [...this.state.filteredSocios]
        const socio = socios[index]

        if (socio.status && socio.status !== 'deleted') {
            socio.originalStatus = socio.status
            socio.status = 'deleted'
        }
        else if (socio?.status === 'deleted')
            socio.status = socio?.originalStatus
        else
            socio.status = 'deleted'

        this.setState({ filteredSocios: socios })
    }

    enableEdit = index => {

        let editSocio = this.state.filteredSocios
        if (editSocio[index].edit === true) editSocio[index].edit = false
        else {
            editSocio.forEach(s => s.edit = false)
            editSocio[index].edit = true
        }
        this.setState({ filteredSocios: editSocio })
    }

    handleEdit = e => {
        const { name } = e.target
        let { value } = e.target

        value = valueParser(name, value)

        let editSocio = this.state.filteredSocios.filter(s => s.edit === true)[0]
        const index = this.state.filteredSocios.indexOf(editSocio)

        editSocio[name] = value

        let fs = this.state.filteredSocios
        fs[index] = editSocio

        this.setState({ filteredSocios: fs })
    }

    handleSubmit = async approved => {
        const
            { socios } = this.props.redux,
            { selectedEmpresa, filteredSocios, demand, contratoSocial, info } = this.state,
            { codigoEmpresa } = selectedEmpresa,
            oldHistoryLength = demand?.history?.length || 0

        let log = {}
        log.metadata = {}

        //check if totalShare is more than 100
        let updatedShare = filteredSocios
            .map(({ share }) => {
                if (typeof share === 'string')
                    share = Number(share)
                if (share)
                    return share
                else return 0
            })
            .reduce((a, b) => a + b)

        updatedShare = +(updatedShare.toFixed(2))

        if (updatedShare > 100) {
            this.setState({ openAlertDialog: true, alertType: 'overShared' })
            return null
        }

        let
            oldMembers = [],
            newMembers = [],
            keys = sociosForm.map(el => humps.decamelize(el.field))
        keys.splice(1, 1)

        //*************Organize socios into oldMembers and newMembers arrays*/
        filteredSocios.forEach(fs => {
            let { razaoSocial, createdAt, edit, ...rest } = fs
            fs = rest
            fs.codigoEmpresa = codigoEmpresa
            if (!fs.hasOwnProperty('socioId')) {
                const gotId = socios.find(s => s.cpfSocio === fs.cpfSocio)
                if (gotId) {
                    fs.socioId = gotId.socioId
                    oldMembers.push(fs)
                } else {
                    if (fs?.status !== 'deleted') {
                        fs.status = 'new'
                        newMembers.push(fs)
                    }
                }
            } else {
                oldMembers.push(fs)
                delete oldMembers.socioId
            }
        })

        const table = 'socios', tablePK = 'socio_id'
        let
            realChanges = [],
            altObj = {},
            shareUpdate,
            deleted

        //*****************Send only real updates of oldMembers and add status = 'modified'
        const originals = humps.camelizeKeys(this.state.originals)

        oldMembers.forEach(m => {
            originals.forEach(async s => {
                if (m.socioId === s.socioId) {
                    Object.keys(m).forEach(key => {
                        if (m[key] && m[key] !== '' && (m[key] !== s[key] || key === 'socioId')) {
                            Object.assign(altObj, { [key]: m[key] })
                        }
                    })
                    //if marked as deleted, preserve status to create delete request, else mark as modified. if deleted, demand needs approval
                    if (Object.keys(altObj).length > 1) {
                        if (altObj?.status !== 'deleted') {
                            m.status = 'modified'
                            altObj.status = 'modified'
                        }
                        else deleted = true
                        realChanges.push(altObj)
                    }
                    if (altObj.share || deleted) shareUpdate = true
                    altObj = {}
                }
            })
        })

        //delete newMembers empty / undefined fields / canceled newMembers

        newMembers = newMembers.filter(({ status }) => status !== 'deleted')
        newMembers.forEach(m => {
            Object.keys(m).forEach(key => {
                if (!m[key] || m[key] === '') delete m[key]
            })
        })

        const modifiedMembers = oldMembers.filter(m => m?.status === 'modified')

        //alert if oldMembers and new members dont exist
        if (!modifiedMembers[0] && !newMembers[0] && !contratoSocial && approved !== false && !deleted) {
            alert('Nenhuma alteração foi realizada.')
            return
        }

        //Variables to be inserted in files metadata
        let
            updateFilesMetadata = false,
            socioIdsArray = filteredSocios
                .filter(s => s.socioId !== undefined)
                .map(s => s.socioId)

        //**********If not approved but share was updated, create demand ***************** */
        if (!approved && (newMembers.length > 0 || shareUpdate))
            this.setState({ toastMsg: 'Alteração estatuária enviada!' })

        //**********Else if approved and/or no share update, prepare request Object to PG DB */
        else if ((!shareUpdate && newMembers.length === 0) || approved) {

            log.completed = true
            log.metadata.tempFile = 'false'

            oldMembers = humps.decamelizeKeys(realChanges)
            newMembers = humps.decamelizeKeys(newMembers)

            try {
                //insert new members, if any
                if (newMembers.length > 0) {
                    newMembers.forEach(m => delete m.status)
                    await axios.post('/api/cadSocios', { socios: newMembers, table, tablePK })
                        .then(r => r.data.forEach(newSocio => socioIdsArray.push(newSocio.socio_id)))
                    updateFilesMetadata = true // if new members are inserted, we need to update socioIds array in file metadata.
                }

                //remove members marked as 'deleted' from the database and update any modified
                if (oldMembers.length > 0) {
                    oldMembers.forEach(async (member, i) => {                                           //remove deleted from DB
                        if (member?.status === 'deleted') {
                            await axios.delete(`/api/delete?table=socios&tablePK=socio_id&id=${member.socio_id}`)
                                .catch(err => console.log(err))

                            const index = socioIdsArray.indexOf(member.socio_id)
                            if (index !== -1) {
                                socioIdsArray.splice(i, 1)
                                updateFilesMetadata = true
                            }
                        }
                    })
                    oldMembers = oldMembers.filter(({ status }) => status === 'modified')               //update existing member data
                    oldMembers.forEach(m => delete m.status)
                    await axios.put('/api/editSocios', { requestArray: oldMembers, table, tablePK, keys })
                        .then(r => console.log(r.data))
                }
            } catch (err) {
                console.log(err)
            }
        }

        //**********Prepare the log object, approved, or not.******************
        log = {
            ...log,
            id: demand?.id,
            empresaId: codigoEmpresa,
            info,
            history: {},
            historyLength: oldHistoryLength,
            approved
        }

        if (realChanges.length > 0) log.history.oldMembers = realChanges
        if (newMembers.length > 0) log.history.newMembers = newMembers
        if (contratoSocial && demand) log.demandFiles = [contratoSocial]
        //if (demand) log.id = demand?.id
        if (approved === false) log.declined = true
        if (log.completed) log.approved = true

        //If first attempt to send files completed (no share update) or not, handle files
        if (contratoSocial && !updateFilesMetadata && !demand) {
            log.history.files = contratoSocial
            log.metadata = {
                fieldName: 'contratoSocial',
                empresaId: codigoEmpresa
            }
        }
        log.metadata.socios = socioIdsArray

        logGenerator(log)                               //Generate the demand
            .then(r => {
                console.log(r?.data)
                this.toast()
            })
            .catch(err => console.log(err))

        //*******************Reset state and variables ************** */
        oldMembers = []
        realChanges = []
        altObj = {}
        newMembers = []

        this.resetState()
        if (demand)
            setTimeout(() => { this.props.history.push('/solicitacoes') }, 1500)
    }

    handleFiles = files => {
        //limit file Size
        if (sizeExceedsLimit(files)) return

        if (files && files[0]) {
            const contratoSocial = new FormData()
            contratoSocial.append('contratoSocial', files[0])
            this.setState({ contratoSocial, fileToRemove: null })
        }
    }

    removeFile = async (name) => {
        const
            { contratoSocial } = this.state,
            newState = removeFile(name, contratoSocial)

        this.setState({ ...this.state, ...newState })
    }

    resetState = () => {
        const { filteredSocios } = this.state

        if (filteredSocios)
            filteredSocios.forEach(s => s.edit = false)

        this.setState({
            razaoSocial: '', selectedEmpresa: undefined, filteredSocios: [],
            dropDisplay: 'Clique ou arraste para anexar o contrato social atualizado da empresa',
            contratoSocial: undefined
        })
    }

    setShowPendencias = () => this.setState({ showPendencias: !this.state.showPendencias })
    toggleDialog = () => this.setState({ openDialog: !this.state.openDialog })
    closeAlert = () => this.setState({ openAlertDialog: !this.state.openAlertDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {
        const { filteredSocios, openAlertDialog, alertType } = this.state,
            { empresas } = this.props.redux

        return (
            <React.Fragment>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração do quadro societário' />
                <SociosTemplate
                    data={this.state}
                    socios={filteredSocios}
                    empresas={empresas}
                    handleInput={this.handleInput}
                    handleBlur={this.handleBlur}
                    addSocio={this.addSocio}
                    removeSocio={this.removeSocio}
                    enableEdit={this.enableEdit}
                    handleEdit={this.handleEdit}
                    handleFiles={this.handleFiles}
                    handleSubmit={this.handleSubmit}
                    removeFile={this.removeFile}
                    setShowPendencias={this.setShowPendencias}
                />
                <ReactToast open={this.state.confirmToast} close={this.toast} msg={this.state.toastMsg} />
                {openAlertDialog && <AlertDialog open={openAlertDialog} close={this.closeAlert} alertType={alertType} />}
            </React.Fragment>
        )
    }
}

const collections = ['empresas', 'socios', 'getFiles/empresaDocs']

export default StoreHOC(collections, AltSocios)