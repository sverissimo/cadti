import React, { PureComponent } from 'react'
import axios from 'axios'
import humps from 'humps'

import StoreHOC from '../Store/StoreHOC'

import ConfigAddDialog from './ConfigAddDialog'
import ReactToast from '../Utils/ReactToast'
import ConfigTemplate from './ConfigTemplate'
import { configVehicleForm } from '../Forms/configVehicleForm'
import { Fragment } from 'react'

class VehicleConfig extends PureComponent {

    state = {
        collection: '',
        marca: '',
        options: [],
        openAddDialog: false,
        confirmToast: false,
        toastMsg: 'Dados atualizados!',
    }
    componentDidMount() {
        let options = []
        configVehicleForm.forEach(col => { options.push(col.label) })
        this.setState({ options })
    }

    addCounter = (veiculos, staticData, data) => {
        const { name, field, label } = staticData

        data.forEach(el => {
            const vehicles = veiculos.filter(v => {
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

        if (staticData.collection === 'modelosChassi') this.setState({ marcas: marcaChassi })
        if (staticData.collection === 'carrocerias') this.setState({ marcas: marcaCarroceria })

        await this.setState({ collection: value, data, staticData })
    }

    enableEdit = async index => {
        const
            divCell = document.querySelectorAll('.divCell'),
            divWrap = divCell[index].childNodes[0],
            inputTarget = divWrap.querySelectorAll('input')[0]
        let
            data = [...this.state.data]

        if (data[index].edit === true) data[index].edit = false
        else {
            data.forEach(s => s.edit = false)
            data[index].edit = true
        }
        await this.setState({ data })
        inputTarget.focus()
    }

    handleChange = e => {
        const
            { value } = e.target,
            name = this.state.staticData.field

        let changedElement = this.state.data.find(el => el.edit === true)
        const index = this.state.data.indexOf(changedElement)

        changedElement[name] = value

        let newData = [...this.state.data]
        newData[index] = changedElement

        this.setState({ data: newData })
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

        this.setState({ openAddDialog: false, data })
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


    removeItem = async index => {

        let data = [...this.state.data]
        const
            { staticData } = this.state,
            { collection } = staticData,
            id = data[index].id,
            originalData = this.props.redux[collection],
            registered = originalData.find(el => el.id === id)
        
        if (registered) {
            await axios.delete(`/api/delete?table=${collection}&tablePK=id&id=${id}`)
                .catch(err => console.log(err))
        }
        data.splice(index, 1)
        this.setState({ data })
    }


    handleSubmit = async () => {

        const
            { data, staticData } = this.state,
            { collection, field, table } = staticData,
            originalData = this.props.redux[collection]

        let editedElements = [], newElements = []

        data.forEach(el => {
            if (el.hasOwnProperty('id')) {
                const { count, edit, ...rest } = el
                editedElements.push(rest)
            }
            else newElements.push(el)
        })

        let realChanges = [], tempObj = {}

        editedElements.forEach(el => {
            originalData.forEach(item => {
                if (el.id === item.id) {
                    Object.keys(el).forEach(key => {
                        if (el[key] !== item[key]) {
                            if (!tempObj.id) tempObj = { ...tempObj, id: el.id }
                            Object.assign(tempObj, { [key]: el[key] })
                        }
                    })
                    if (Object.keys(tempObj).length > 0) realChanges.push(tempObj)
                    tempObj = {}
                }
            })
        })

        editedElements = humps.decamelizeKeys(realChanges)
        //console.log(editedElements)
        //newElements = humps.decamelizeKeys(newElements)
        newElements = ['Aaaaa']
        const
            tablePK = 'id',
            column = humps.decamelize(field)

        try {
            if (editedElements.length > 0) {

                await axios.put('/api/editElements', { requestArray: editedElements, table, tablePK, column })
                    .then(r => console.log(r.data));
            }

            if (newElements.length > 0) {
                await axios.post('/api/addElements', { newElements, table, column })
                    .then(r => console.log(r.data))
            }
        } catch (err) {
            console.log(err)
        }

        editedElements = []
        realChanges = []
        tempObj = {}
        newElements = []
        this.toast()

        this.setState({
            collection: '', data: undefined, staticData: undefined
        })
    }


    toggleDialog = () => this.setState({ openAddDialog: !this.state.openAddDialog })
    toast = () => this.setState({ confirmToast: !this.state.confirmToast })

    render() {

        const { options, collection, data, staticData, openAddDialog, marca, marcas, confirmToast, toastMsg } = this.state
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
                    removeItem={this.removeItem}
                />
                {openAddDialog && <ConfigAddDialog
                    open={openAddDialog}
                    close={this.toggleDialog}
                    title={staticData.label}
                    marca={marca}
                    marcas={marcas}
                    selectMarca={this.selectMarca}
                    handleInput={this.handleInput}
                    addNewElement={this.addNewElement}
                />}
                <ReactToast open={confirmToast} close={this.toast} msg={toastMsg} />
            </Fragment>
        )
    }
}

const collections = ['seguradoras', 'lookUpTable/marca_chassi', 'modelosChassi', 'lookUpTable/marca_carroceria',
    'carrocerias', 'equipamentos', 'veiculos']

export default StoreHOC(collections, VehicleConfig)