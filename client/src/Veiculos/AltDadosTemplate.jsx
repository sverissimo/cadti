import React from 'react'

import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import FormSubtitle from '../Reusable Components/FormSubtitle'
import TextInput from '../Reusable Components/TextInput'
import AddEquipa from './AddEquipa'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import { altForm } from '../Forms/altForm'

const useStyles = makeStyles(theme => ({
    button: {
        marginRight: '15px'
    }
}))

export default function ({ handleInput, handleBlur, data, handleCheck, handleEquipa, altPlacaOption, showAltPlaca, empresas, compartilhados, equipamentos, acessibilidade, close }) {

    const
        { activeStep, subtitle, placa, selectedEmpresa, addEquipa, demand, type } = data,
        classes = useStyles(), { button } = classes,
        form = altForm[activeStep]

    let eqCollection = equipamentos
    if (type === 'acessibilidade') eqCollection = acessibilidade

    return (
        <div className='flex center'>
            <header className='flex center' style={{ marginBottom: '10px', width: '100%' }}>
                <SelectEmpresa
                    data={data}
                    empresas={empresas}
                    compartilhados={compartilhados}
                    headerTitle={selectedEmpresa && `Alteração de dados ${placa || ''} - ${selectedEmpresa?.razaoSocial}`}
                    handleInput={handleInput}
                    handleBlur={handleBlur}
                />
            </header>
            {
                selectedEmpresa &&
                <main>
                    {activeStep < 2 &&
                        <section className='paper'>
                            <FormSubtitle subtitle={subtitle[activeStep]} />
                            <TextInput
                                form={form}
                                data={data}
                                empresas={empresas}
                                compartilhados={compartilhados}
                                handleBlur={handleBlur}
                                handleInput={handleInput}
                                disableSome={demand ? ['placa', 'delegatario'] : ['delegatario']}
                            />
                        </section>}

                    {activeStep === 0 &&
                        <section className="flex center">
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

                    {altPlacaOption && placa.match('[a-zA-Z]{3}[-]?\\d{4}') &&
                        <div className='addNewDiv'>
                            <span onClick={() => showAltPlaca()}> → Clique aqui para alterar a placa para o formato Mercosul.</span>
                        </div>
                    }
                    {
                        addEquipa && <AddEquipa
                            type={type}
                            equipamentos={eqCollection}
                            close={close}
                            handleCheck={handleCheck}
                            data={data} />
                    }
                </main>
            }
        </div>
    )
}