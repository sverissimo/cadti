import React, { Fragment } from 'react'

import Crumbs from '../Reusable Components/Crumbs'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextInput from '../Reusable Components/TextInput'

import BaixaMotivo from './BaixaMotivo'
import BaixaOptions from './BaixaOptions'
import BaixaGerenciar from './BaixaGerenciar'

import { baixaForm } from '../Forms/baixaForm'
import './veiculos.scss'

export default function ({ selectOption, handleInput, handleBlur, handleCheck, handleSubmit, selectMotivo,
    data, empresas, motivosBaixa, searchDischarged, downloadXls, reactivateVehicle }) {
    const { selectedEmpresa, selectedOption, checked, delegaTransf, justificativa, selectedMotivo, demand } = data

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
                        {
                            selectedOption === 'baixar' ?
                                <div className="flex">
                                    <section className="paper">
                                        <h3 style={{ marginBottom: '7px' }}>
                                            {!demand ? 'Informe os dados para a baixa' : `Solicitação nº${demand?.numero} - ${demand?.subject}`}
                                        </h3>
                                        {demand && <h4>Situação: {demand?.status}</h4>}
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
                                        delegaTransf={delegaTransf}
                                        motivosBaixa={motivosBaixa}
                                        selectMotivo={selectMotivo}
                                        selectedMotivo={selectedMotivo}
                                        justificativa={justificativa}
                                        empresas={empresas}
                                        handleInput={handleInput}
                                        handleBlur={handleBlur}
                                        handleSubmit={handleSubmit}
                                    />
                                </div>
                                :
                                selectedOption === 'gerenciar' ?
                                    <BaixaGerenciar
                                        data={data}
                                        handleInput={handleInput}
                                        searchDischarged={searchDischarged}
                                        downloadXls={downloadXls}
                                        reactivateVehicle={reactivateVehicle}
                                    />
                                    : null
                        }
                    </>
                }
            </div>
        </Fragment>
    )
}