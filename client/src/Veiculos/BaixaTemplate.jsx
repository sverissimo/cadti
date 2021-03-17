import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'

import BaixaMotivo from './BaixaMotivo'
import BaixaOptions from './BaixaOptions'
import BaixaGerenciar from './BaixaGerenciar'

import StepperButtons from '../Reusable Components/StepperButtons'
import Button from '@material-ui/core/Button'
import Send from '@material-ui/icons/Send'

import { baixaForm } from '../Forms/baixaForm'
import './veiculos.scss'

export default function ({ user, selectOption, handleInput, handleBlur, handleCheck, handleSubmit, selectMotivo,
    data, empresas, motivosBaixa, searchDischarged, downloadXls, reactivateVehicle, setShowPendencias }) {
    const { selectedEmpresa, selectedOption, checked, delegaTransf, justificativa, selectedMotivo, demand, info, motivo, showPendencias } = data

    return (
        <Fragment>
            <Crumbs links={['Veículos', '/veiculos']} text='Baixa de veículo' demand={demand} />
            <SelectEmpresa
                data={data}
                empresas={empresas}
                handleInput={handleInput}
                handleBlur={handleBlur}
            />
            <div className="flexColumn">
                {//razaoSocial && frota[0] &&
                    selectedEmpresa &&
                    <>
                        {
                            !demand &&
                            <BaixaOptions
                                demand={demand}
                                checked={checked}
                                delegaTransf={delegaTransf}
                                justificativa={justificativa}
                                empresas={empresas}
                                selectOption={selectOption}
                                handleInput={handleInput}
                                handleBlur={handleBlur}
                                handleCheck={handleCheck}
                                handleSubmit={handleSubmit}
                            />
                        }
                        {
                            selectedOption === 'baixar' ?
                                <div className="flex">
                                    <section className="paper">
                                        <h3 style={{ marginBottom: '7px' }}>
                                            {!demand ? 'Informe os dados para a baixa' : `Solicitação nº${demand?.numero} - ${demand?.subject}`}
                                        </h3>
                                        {demand &&
                                            <h4>
                                                {motivo}
                                            </h4>
                                        }
                                        {demand &&
                                            <h4>Situação: {demand?.status}</h4>
                                        }
                                        <TextInput
                                            form={baixaForm}
                                            data={data}
                                            handleBlur={handleBlur}
                                            handleInput={handleInput}
                                            disableAll={demand ? true : false}
                                        />
                                    </section>
                                    <BaixaMotivo
                                        demand={demand}
                                        selectedOption={selectedOption}
                                        //delegaTransf={delegaTransf}
                                        motivosBaixa={motivosBaixa}
                                        selectMotivo={selectMotivo}
                                        selectedMotivo={selectedMotivo}
                                        info={info}
                                        empresas={empresas}
                                        handleInput={handleInput}
                                        handleBlur={handleBlur}
                                        handleSubmit={handleSubmit}
                                        setShowPendencias={setShowPendencias}
                                        showPendencias={showPendencias}
                                    />
                                </div>
                                :
                                selectedOption === 'gerenciar' ?
                                    <BaixaGerenciar
                                        data={data}
                                        user={user}
                                        handleInput={handleInput}
                                        searchDischarged={searchDischarged}
                                        downloadXls={downloadXls}
                                        reactivateVehicle={reactivateVehicle}
                                    />
                                    : null
                        }
                        {
                            !demand && selectedOption === 'baixar' ?
                                <div className="flexEnd">
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        style={{ margin: '10px 0 10px 0' }}
                                        onClick={() => handleSubmit()}
                                    >
                                        Confirmar <span>&nbsp;&nbsp; </span> <Send />
                                    </Button>
                                </div>
                                : demand ?
                                    <StepperButtons
                                        uniqueStep={true}
                                        declineButtonLabel='Indeferir'
                                        demand={demand}
                                        setShowPendencias={setShowPendencias}
                                        showPendencias={showPendencias}
                                        info={info}
                                        handleSubmit={handleSubmit}
                                        handleInput={handleInput}
                                    />
                                    : null
                        }
                    </>
                }
            </div>
        </Fragment>
    )
}