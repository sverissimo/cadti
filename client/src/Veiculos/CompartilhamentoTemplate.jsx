import React from 'react'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import compartilhamentoForm from '../Forms/compartilhamentoForm'
import { compartilhamentoFiles } from '../Forms/compatilhamentoFiles'
import Crumbs from '../Reusable Components/Crumbs'
import CustomButton from '../Reusable Components/CustomButton'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import FormSubtitle from '../Reusable Components/FormSubtitle'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import TextArea from '../Reusable Components/TextArea'
import TextInput from '../Reusable Components/TextInput'

import styles from './compartilhamento.module.scss'

const CompartilhamentoTemplate = ({ data, redux, handleInput, handleFiles, removeFile, handleSubmit, toggleAcceptTerms }) => {

    const
        { empresas, compartilhados } = redux
        , { razaoSocial, selectedEmpresa, motivoCompartilhamento, form, demand, compartilhamentoRemoved,
            termsAccepted, demandFiles, fileToRemove } = data
        , reviewForm = compartilhamentoForm.map(e => ({ ...e, disabled: true }))
        , { termoCiencia__div, termoCiencia__text } = styles

    return (
        <>
            <header>
                <Crumbs links={['Veículos', '/veiculos']} text='Gerenciar compartilhamento de Veículos' demand={demand} />
                <SelectEmpresa
                    empresas={empresas}
                    data={{ razaoSocial, demand }}
                    handleInput={handleInput}
                />
            </header>
            {
                selectedEmpresa &&
                <>
                    <main className='paper' style={{ margin: '0.5rem 0' }}>
                        <FormSubtitle subtitle={!demand ? 'Insira a placa do veículo para gerenciar seu compartilhamento.' : 'Informações do veículo e do compartilhamento'} />
                        {
                            compartilhamentoRemoved &&
                            <p className='smallFont' style={{ color: 'red' }}>
                                *Solicitação de término do compartilhamento
                            </p>
                        }
                        <TextInput
                            form={!demand ? compartilhamentoForm : reviewForm}
                            data={data}
                            empresas={empresas}
                            compartilhados={compartilhados}
                            handleInput={handleInput}
                        />
                        <section className='flexColumn' style={{ margin: '0 6rem' }}>
                            <TextArea
                                label={!compartilhamentoRemoved ? 'Motivo do compartilhamento' : ' Motivo do término do compartilhamento'}
                                name='motivoCompartilhamento'
                                id='motivoCompartilhamento'
                                disabled={false}
                                onChange={handleInput}
                                value={motivoCompartilhamento}
                                rows='2'
                            />
                        </section>
                        <section className='flexColumn'>
                            <div style={{ margin: '3rem 0 0 0' }}>
                                <FormSubtitle
                                    subtitle={!demand ? 'Anexe os arquivos solicitados.' : 'Documentos'}
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <div className='flex' style={{ margin: '0 0 0 6rem' }}>
                                {
                                    !demand ?
                                        compartilhamentoFiles.map(({ name, title }, i) =>
                                            <DragAndDrop
                                                key={i}
                                                name={name}
                                                formData={form}
                                                dropDisplay={`Clique ou arraste para anexar o ${title} `}
                                                handleFiles={handleFiles}
                                                removeFile={removeFile}
                                                fileToRemove={fileToRemove}
                                                style={{ width: '490px', marginRight: i === 0 ? '12px' : 0 }}
                                            />
                                        )
                                        :
                                        <ShowLocalFiles
                                            demandFiles={demandFiles}
                                            form={compartilhamentoFiles}
                                            files={form}
                                            collection='vehicleDocs'
                                        />
                                }
                            </div>
                        </section>
                        <section className={termoCiencia__div}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={termsAccepted === true}
                                        onChange={() => toggleAcceptTerms()}
                                        value={termsAccepted}
                                    />
                                }
                                label={
                                    <span className={termoCiencia__text}>
                                        Estou ciente de que a utilização de veículos de terceiros é autorizada desde que o veículo seja cadastrado na Superintendência de Transporte Intermunicipal, apresentando o Certificado de Registro da SEINFRA vigente,  e com as características necessárias para utilização naquela linha.
                                    </span>
                                }
                            />

                        </section>

                    </main>
                    <footer>
                        <CustomButton
                            label={!demand ? 'Enviar' : 'Aprovar'}
                            onClick={() => !demand ? handleSubmit() : handleSubmit(true)}
                            disabled={!demand && !termsAccepted}
                        />
                        {
                            demand &&
                            <CustomButton
                                label='Indeferir'
                                color='secondary'
                                onClick={() => handleSubmit(false)}
                            />
                        }
                    </footer>
                </>
            }
        </>
    )
}

export default CompartilhamentoTemplate
