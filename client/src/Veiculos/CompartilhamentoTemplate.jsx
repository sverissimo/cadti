import React from 'react'
import compartilhamentoForm from '../Forms/compartilhamentoForm'
import { compartilhamentoFiles } from '../Forms/compatilhamentoFiles'
import Crumbs from '../Reusable Components/Crumbs'
import CustomButton from '../Reusable Components/CustomButton'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import ShowLocalFiles from '../Reusable Components/ShowLocalFiles'
import TextArea from '../Reusable Components/TextArea'
import TextInput from '../Reusable Components/TextInput'


const CompartilhamentoTemplate = ({ data, redux, handleInput, handleFiles, removeFile, handleSubmit }) => {

    const
        { empresas, compartilhados } = redux
        , { razaoSocial, selectedEmpresa, motivoCompartilhamento, form, demand, compartilhamentoRemoved, demandFiles, fileToRemove } = data
        , reviewForm = compartilhamentoForm.map(e => ({ ...e, disabled: true }))
    // , reviewForm = compartilhamentoForm

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
                        <FormSubtiltle subtitle={!demand ? 'Insira a placa do veículo para gerenciar seu compartilhamento.' : 'Informações do veículo e do compartilhamento'} />
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
                                <FormSubtiltle
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
                    </main>
                    <footer>
                        <CustomButton
                            label={!demand ? 'Enviar' : 'Aprovar'}
                            onClick={() => !demand ? handleSubmit() : handleSubmit(true)}
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
