import React, { PureComponent, Fragment } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import ConfigAddDialog from './ConfigAddDialog'
import ReactToast from '../Reusable Components/ReactToast'
import ConfigTemplate from './ConfigTemplate'
import ConfirmDialog from '../Reusable Components/ConfirmDialog'

import { configVehicleForm } from '../Forms/configVehicleForm'

class VehicleConfig extends PureComponent {

    state = {
        collection: '',
        marca: '',
        options: [],
        openAddDialog: false,
        confirmToast: false,
        toastMsg: 'Dados atualizados!',
        confirmDialogProps: { open: false }
    }
    componentDidMount() {
        let options = []
        configVehicleForm.forEach(col => { options.push(col.label) })
        this.setState({ options })

    }

    componentDidUpdate(prevProps) {
        const
            redux = JSON.parse(JSON.stringify(this.props.redux)),
            { veiculos } = redux,
            { staticData, data, editIndex } = this.state

        if (!staticData || !data) return null

        const { collection } = staticData
        if (JSON.stringify(prevProps.redux[collection]) !== JSON.stringify(redux[collection])) {
            const data = this.addCounter(veiculos, staticData, redux[collection])
            if (editIndex || editIndex === 0)
                data[editIndex].edit = true
            this.setState({ data })
        }
    }

    addCounter = (veiculos, staticData, data) => {
        const { name, field, label } = staticData

        data.forEach(el => {
            const vehicles = veiculos.filter(v => {
                if (label === 'Itens de acessibilidade' && v[name]) {
                    const vehicleAccessItems = v[name]
                    const hasItem = vehicleAccessItems.find(ac => ac === el.id)
                    return hasItem
                }

                if (label === 'Equipamentos' && v[name]) return v[name].toLowerCase().match(el[field].toLowerCase())
                return v[name] === el[field]
            }),
                count = vehicles.length
            Object.assign(el, { count })
        })
        data = data.sort((a, b) => a[field].localeCompare(b[field]))
        return data
    }

    selectCollection = async e => {
        const
            { value } = e.target,
            { veiculos, marcaChassi, marcaCarroceria } = this.props.redux
        let
            staticData = configVehicleForm.find(el => el.label === value),
            data = JSON.parse(JSON.stringify(this.props.redux[staticData.collection]))

        data = this.addCounter(veiculos, staticData, data)
        data.forEach(el => el.edit = false)

        this.setState({ marcas: undefined, marca: '' })
        if (staticData.collection === 'modelosChassi') this.setState({ marcas: marcaChassi })
        if (staticData.collection === 'carrocerias') this.setState({ marcas: marcaCarroceria })

        await this.setState({ collection: value, data, staticData })
        void 0
    }

    enableEdit = async index => {
        let oldIndex
        const
            redux = JSON.parse(JSON.stringify(this.props.redux)),
            divCell = document.querySelectorAll('.divCell'),
            divWrap = divCell[index].childNodes[0],
            inputTarget = divWrap.querySelectorAll('input')[0],
            { updatedObj, staticData } = this.state,
            data = JSON.parse(JSON.stringify(this.state.data)),
            selectedObj = data[index],
            name = this.state?.staticData?.field

        //O index de referência vai variar: se houver um campo em edição e se clicar no enableEdit de outro, o index de refrência é do campo anterior
        //Inicialmente os objetos originais se baseiam no index que é dado como argumento da função
        if (selectedObj?.edit === undefined) selectedObj.edit = false

        let
            originalObject = redux[staticData.collection].find(el => {
                if (el.id === selectedObj.id)
                    return Object.freeze(el)
                else return {}
            }),
            noChanges = data[index][name] === originalObject[name]

        //Verificar se já havia algum edit === true e se está se checando outro como true ao mesmo tempo q torna o ativo false        
        const leftOpen = data.some((el, i) => {
            if (i !== index && el.edit === true) {
                oldIndex = data.indexOf(el)
                return el
            } else return false
        })

        //desativa a edição de todos os outros campos exceto o escolhido (index)
        async function select() {
            data.forEach(el => el.edit = false)
            data[index].edit = true
            await this.setState({ data, editIndex: index })
            inputTarget.focus()
        }
        //Se todos objs estiverem com edição desabilitada:
        if (!leftOpen) {
            //So o clicado estiver desabilitad, apenas habilite sua edição
            if (selectedObj.edit === false) {
                data[index].edit = true
                await this.setState({ data })
                inputTarget.focus()
            }
            // Senão, verificar se houve mudança. Caso positivo, request p salvar e depois desabilita edição
            else {
                data[index].edit = false
                if (updatedObj && !noChanges)
                    this.handleSubmit(updatedObj)
                this.setState({ data, editIndex: undefined })
            }
            return
        }
        //Nesse caso, um campo está em ediçao e outro campo foi clicado. Salva-se o em edição caso tenha sido alterado e se habilita a edição do próximo
        if (leftOpen && !selectedObj.edit) {
            select.call(this)
            //Atualização do index para achar o objeto original referente ao último objeto com edit=true
            originalObject = redux[staticData.collection].find(el => el.id === data[oldIndex]?.id)
            noChanges = data[oldIndex][name] === originalObject[name]

            if (updatedObj && !noChanges)
                this.handleSubmit(updatedObj)
        }
    }

    selectMarca = e => {
        const
            { value } = e.target,
            { collection } = this.state.staticData,
            { marcaChassi, marcaCarroceria } = this.props.redux

        let marcaCollection
        if (collection === 'modelosChassi') marcaCollection = marcaChassi
        if (collection === 'carrocerias') marcaCollection = marcaCarroceria

        const { id } = marcaCollection.find(m => m.marca === value)

        this.setState({ marca: value, marcaId: id })
    }

    handleChange = async e => {
        const
            { value } = e.target,
            { staticData, data } = this.state,
            { field } = staticData,

            changedElement = data.find(el => el.edit === true),
            index = data.indexOf(changedElement)

        changedElement[field] = value

        let newData = [...this.state.data]
        newData[index] = changedElement
        const updatedObj = {
            id: changedElement?.id,
            [field]: value
        }
        this.setState({ data: newData, updatedObj })
    }

    handleInput = e => {
        const { value } = e.target
        this.setState({ newElement: value })
    }

    addNewElement = async () => {

        const
            { staticData, newElement, marcaId } = this.state,
            { table, field, collection } = staticData,
            { veiculos } = this.props.redux

        let requestElement = { [field]: newElement }
        if (marcaId) requestElement.marcaId = marcaId
        requestElement = humps.decamelizeKeys(requestElement)

        await axios.post('/api/addElement', { table, requestElement })

        let data = this.props.redux[collection]
        data = this.addCounter(veiculos, staticData, data)

        this.setState({ openAddDialog: false, data, marcaId: undefined })
    }

    confirmDelete = index => {

        const
            { data, staticData } = this.state,
            { field } = staticData,

            elementName = data[index][field],
            confirmDialogProps = {
                open: true,
                type: 'delete',
                element: `${elementName}`,
                index
            }

        this.setState({ confirmDialogProps })
    }

    removeItem = async index => {
        this.closeConfirmDialog()

        let data = [...this.state.data]

        const
            { staticData } = this.state,
            { collection, table } = staticData,
            id = data[index].id,
            originalData = this.props.redux[collection],
            registered = originalData.find(el => el.id === id)

        if (registered) {
            await axios.delete(`/api/delete?table=${table}&tablePK=id&id=${id}`)
                .catch(err => console.log(err))
        }
        data.splice(index, 1)
        this.setState({ data })

    }

    handleSubmit = async updatedObj => {
        const
            { staticData } = this.state,
            { field, table } = staticData,
            tablePK = 'id',
            column = humps.decamelize(field),
            editedElements = [humps.decamelizeKeys(updatedObj)]

        await axios.put('/api/editElements', { requestArray: editedElements, table, tablePK, column })
            .then(r => console.log('updated.'))
            .catch(err => console.log(err))

        this.setState({ updatedObj: undefined })
    }

    closeConfirmDialog = () => {
        let confirmDialogProps = { ...this.state.confirmDialogProps }
        confirmDialogProps.open = false

        this.setState({ confirmDialogProps })
    }

    toggleDialog = () => this.setState({ openAddDialog: !this.state.openAddDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {

        const { options, collection, data, staticData, openAddDialog, marca, marcas, confirmToast, toastMsg, confirmDialogProps } = this.state
        return (
            <Fragment>
                <ConfigTemplate
                    collections={options}
                    collection={collection}
                    data={data}
                    staticData={staticData}
                    selectCollection={this.selectCollection}
                    enableEdit={this.enableEdit}
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    openAddDialog={this.toggleDialog}
                    confirmDelete={this.confirmDelete}
                />
                {openAddDialog && <ConfigAddDialog
                    open={openAddDialog}
                    close={this.toggleDialog}
                    title={staticData.label}
                    helperMessage='Para adicionar, insira o nome no campo abaixo e clique em "Confirmar".'
                    marca={marca}
                    marcas={marcas}
                    selectMarca={this.selectMarca}
                    handleInput={this.handleInput}
                    addNewElement={this.addNewElement}
                />}
                {confirmDialogProps.open && <ConfirmDialog {...confirmDialogProps} close={this.closeConfirmDialog} confirm={this.removeItem} />}

                <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['seguradoras', 'lookUpTable/marca_chassi', 'modelosChassi', 'lookUpTable/marca_carroceria',
    'carrocerias', 'equipamentos', 'veiculos', 'acessibilidade', 'empresasLaudo']

export default StoreHOC(collections, VehicleConfig)