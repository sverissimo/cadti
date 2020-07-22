import React, { useState } from 'react'

import TextInput from '../Reusable Components/TextInput'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { cadVehicleForm } from '../Forms/cadVehicleForm'

import AutoComplete from '../Utils/autoComplete'
import AddEquipa from './AddEquipa'

import './veiculos.css'

const useStyles = makeStyles(theme => ({
    selectEmpresa: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth: 415,
        fontColor: '#bbb',
    },
    button: {
        marginRight: '15px'
    }
}))

export default function ({ empresas, equipamentos, acessibilidade, data, handleInput, handleBlur, handleEquipa, handleCheck, closeEquipa }) {

    const
        classes = useStyles(),
        { selectEmpresa, button } = classes,

        { razaoSocial, activeStep, addEquipa, delegatarioCompartilhado, subtitle, selectedEmpresa, type } = data,

        form = cadVehicleForm[activeStep],
        [shared, setShared] = useState(false)

    let eqCollection = equipamentos
    if (type === 'acessibilidade') eqCollection = acessibilidade
    const headerTitles = [
        { title: 'Selecione a Viação', value: razaoSocial },
        { title: 'Empresa autorizada a compartilhar', value: delegatarioCompartilhado }
    ]

    return (
        <>
            <header className='paper flex center' style={{ width: '100%', margin: '10px 0', padding: '5px 0' }}>
                {activeStep === 0 ?
                    <section className='flexColumn' style={{ marginBottom: '15px' }}>
                        <div className='flex center'>
                            {
                                headerTitles.map(({ title, value }, i) => ((i === 1 && shared) || i === 0) &&
                                    <div className='flexColumn' key={i}>
                                        <h4 style={{ margin: '5px 0', textAlign: 'center' }}>{title}</h4>
                                        <TextField
                                            inputProps={{
                                                list: 'razaoSocial',
                                                name: i === 0 ? 'razaoSocial' : 'delegatarioCompartilhado',
                                                style: { textAlign: 'center', fontSize: '0.8rem' }
                                            }}
                                            className={selectEmpresa}
                                            value={value}
                                            onChange={handleInput}
                                            onBlur={handleBlur}
                                        />
                                        <AutoComplete
                                            collection={empresas}
                                            datalist='razaoSocial'
                                            value={value}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    </section>
                    :
                    <div className='formTitle'>Cadastro de Veículo - {razaoSocial}</div>
                }
                {
                    activeStep === 0 &&
                    <section className="flex center" style={{ width: '100%', margin: '-7px 0 -4px 0' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={shared === true}
                                    onChange={() => setShared(!shared)}
                                    value={shared}
                                />
                            }
                            label={
                                <h4 style={{ color: '#2979ff', fontSize: '0.7rem' }}>
                                    Veículo Compartilhado?
                            </h4>
                            }
                        />
                    </section>
                }
            </header>
            {
                selectedEmpresa &&
                <main>
                    {activeStep < 2 &&
                        <section className='paper' style={{ paddingBottom: '25px' }}>
                            <div className='formSubtitle'>
                                <i className='material-icons subtitleHelper'>arrow_forward</i>
                                <span style={{ fontSize: '14.3px' }}>
                                    {subtitle[activeStep]}
                                </span>
                            </div>
                            <TextInput
                                form={form}
                                data={data}
                                handleBlur={handleBlur}
                                handleInput={handleInput}
                            />
                        </section>}
                    {activeStep === 0 &&
                        <section className='flex center' style={{ marginTop: '15px' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                className={button}
                                onClick={() => handleEquipa('equipamentos')}
                            >
                                <AddIcon />
                                                Equipamentos
                                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                className={button}
                                onClick={() => handleEquipa('acessibilidade')}
                            >
                                <AddIcon />
                                        Acessibilidade
                                    </Button>
                        </section>}
                    {
                        addEquipa && <AddEquipa
                            equipamentos={eqCollection}
                            close={closeEquipa}
                            handleCheck={handleCheck}
                            data={data} />
                    }
                </main>
            }
        </>
    )
}