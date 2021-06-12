import React from 'react'
import compartilhamentoForm from '../Forms/compartilhamentoForm'
import { compartilhamentoFiles } from '../Forms/compatilhamentoFiles'
import Crumbs from '../Reusable Components/Crumbs'
import CustomButton from '../Reusable Components/CustomButton'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import TextArea from '../Reusable Components/TextArea'
import TextInput from '../Reusable Components/TextInput'


const CompartilhamentoTemplate = ({ data, redux, handleInput, handleFiles, removeFile, setShowPendencias, handleSubmit }) => {

    const
        { empresas, compartilhados } = redux
        , { razaoSocial, selectedEmpresa, motivoCompartilhamento, form, demand, info, showPendencias, demandFiles, fileToRemove } = data

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
                        <FormSubtiltle subtitle='Insira a placa do veículo para gerenciar seu compartilhamento.' />
                        <TextInput
                            form={compartilhamentoForm}
                            data={data}
                            empresas={empresas}
                            compartilhados={compartilhados}
                            handleInput={handleInput}
                        />
                        <section className='flexColumn' style={{ margin: '0 6rem' }}>
                            <TextArea
                                label='Motivo do compartilhamento'
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
                                    subtitle='Anexe os arquivos solicitados.'
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <div className='flex' style={{ margin: '0 0 0 6rem' }}>
                                {
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
                                }
                            </div>
                        </section>
                    </main>
                    <footer>
                        <CustomButton
                            label='Enviar'
                            onClick={handleSubmit}
                        />
                    </footer>
                </>
            }
        </>
    )
}

export default CompartilhamentoTemplate
