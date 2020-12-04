import React, { useState, useEffect } from 'react'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import { cadVehicleForm } from '../Forms/cadVehicleForm'

import AddEquipa from './AddEquipa'

import './veiculos.scss'

const useStyles = makeStyles(theme => ({
    button: {
        marginRight: '15px'
    }
}))

export default function ({ redux, data, handleInput, handleBlur, handleEquipa, handleCheck, closeEquipa, resetShared }) {

    const
        [shared, setShared] = useState(false),
        { button } = useStyles(),
        { empresas, equipamentos, acessibilidade, modelosChassi, carrocerias } = redux,
        { activeStep, addEquipa, subtitle, selectedEmpresa, type, placa, reactivated } = data,
        form = cadVehicleForm[activeStep]

    let eqCollection = equipamentos
    if (type === 'acessibilidade') eqCollection = acessibilidade

    data.modelosChassi = modelosChassi
    data.carrocerias = carrocerias

    useEffect(() => {               //reset shared after submit
        if (resetShared) setShared(false)
    }, [resetShared])

    let conditionalSubtitle = subtitle[activeStep]
    if (reactivated)
        conditionalSubtitle += ' (reativação de veículo)'

    return (
        <>
            <header className={activeStep !== 0 ? 'flex center' : 'paper flex center'} style={{ width: '100%' }}>
                <section className='flexColumn' style={{ marginBottom: '10px' }}>
                    <SelectEmpresa
                        data={data}
                        shared={shared}
                        empresas={empresas}
                        headerTitle={placa && selectedEmpresa && `Cadastro de veículo ${placa} - ${selectedEmpresa?.razaoSocial}`}
                        handleBlur={handleBlur}
                        handleInput={handleInput}
                    />
                </section>
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
                            <FormSubtiltle subtitle={conditionalSubtitle} />
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