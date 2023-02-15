import React from 'react'
import EmpresaReview from '../EmpresaReview'
import AltSociosTemplate from './AltSociosTemplate'
import { altContratoForm, dadosEmpresaForm, altContratoFiles, empresaFiles } from './forms'

import Crumbs from '../../Reusable Components/Crumbs'
import FormSubtiltle from '../../Reusable Components/FormSubtiltle'
import SelectEmpresa from '../../Reusable Components/SelectEmpresa'
import CustomStepper from '../../Reusable Components/Stepper'
import TextInput from '../../Reusable Components/TextInput'
import StepperButtons from '../../Reusable Components/StepperButtons'
import DragAndDrop from '../../Reusable Components/DragAndDrop'

const AltContratoTemplate = (
    { empresas, data, activeStep, setActiveStep, enableEdit, handleEdit, addSocio, removeSocio, handleInput, handleBlur, handleSubmit, handleFiles, removeFile,
        setShowPendencias }) => {

    const
        { selectedEmpresa, demand, demandFiles, stepTitles, subtitles, form, fileToRemove, info, showPendencias } = data,
        headerTitle = `Alteração de contrato social - ${selectedEmpresa?.razaoSocial}`,
        forms = [dadosEmpresaForm, altContratoForm]

    return (
        <main>
            <header>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração de dados e contrato social' demand={demand} selectedEmpresa={selectedEmpresa} />
                {/*--------------------- Steppers ------------------------------*/}
                <section>
                    <CustomStepper
                        activeStep={activeStep}
                        steps={stepTitles}
                    />
                </section>
                <div className="flex center">
                    <SelectEmpresa
                        empresas={empresas}
                        data={data}
                        headerTitle={headerTitle}
                        handleInput={handleInput}
                    />
                </div>
            </header>
            {
                //selectedEmpresa?.cnpj &&
                selectedEmpresa instanceof Object &&
                <>
                    {/*--------------------- Form / inputs -------------------------*/}
                    {
                        activeStep !== 2 ?
                            <section className="flex paper">
                                <FormSubtiltle subtitle={subtitles[activeStep]} />
                                {
                                    activeStep < 2
                                        ?
                                        <>
                                            <TextInput
                                                form={forms[activeStep]}
                                                data={data}
                                                handleInput={handleInput}
                                                style={{ width: '100%' }}
                                            />
                                            <div className='flex center' style={{ width: '100%' }}>
                                                {
                                                    activeStep === 1 && altContratoFiles.map(({ name, title }, i) =>
                                                        <DragAndDrop
                                                            key={i}
                                                            name={name}
                                                            formData={form}
                                                            dropDisplay={`Clique ou arraste para anexar o ${title} `}
                                                            handleFiles={handleFiles}
                                                            removeFile={removeFile}
                                                            fileToRemove={fileToRemove}
                                                            style={{ width: i === 0 ? '380px' : '250px', marginRight: i === 0 ? '12px' : 0 }}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </>
                                        :
                                        <EmpresaReview
                                            data={data}
                                            forms={forms}
                                            files={form}
                                            demandFiles={demandFiles}
                                            filesForm={empresaFiles}
                                        />
                                }
                            </section>
                            :
                            <section>
                                <AltSociosTemplate
                                    data={data}
                                    handleInput={handleInput}
                                    handleBlur={handleBlur}
                                    addSocio={addSocio}
                                    removeSocio={removeSocio}
                                    handleFiles={handleFiles}
                                    enableEdit={enableEdit}
                                    handleEdit={handleEdit}
                                />
                            </section>
                    }
                    <footer>
                        <StepperButtons
                            demand={demand}
                            declineButtonLabel='Indeferir'
                            setShowPendencias={setShowPendencias}
                            showPendencias={showPendencias}
                            info={info}
                            activeStep={activeStep}
                            lastStep={stepTitles.length - 1}
                            setActiveStep={setActiveStep}
                            handleInput={handleInput}
                            handleSubmit={handleSubmit}
                        />
                    </footer>
                </>
            }
        </main>
    )
}

export default AltContratoTemplate