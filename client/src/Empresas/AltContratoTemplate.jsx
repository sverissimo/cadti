import React from 'react'
import { altContratoForm } from '../Forms/altContratoForm'
import { empresasForm } from '../Forms/empresasForm'
import EmpresaReview from './EmpresaReview'

import Crumbs from '../Reusable Components/Crumbs'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import SelectEmpresa from '../Reusable Components/SelectEmpresa'
import CustomStepper from '../Reusable Components/Stepper'
import TextInput from '../Reusable Components/TextInput'
import StepperButtons from '../Reusable Components/StepperButtons'
import DragAndDrop from '../Reusable Components/DragAndDrop'
import SociosTemplate from './SociosTemplate'
import AltSociosTemplate from './AltSociosTemplate'
import { empresaFiles } from '../Forms/empresaFiles'


const AltContratoTemplate = (
    { empresas, data, setActiveStep, enableEdit, handleEdit, addSocio, removeSocio, handleInput, handleSubmit, handleFiles, removeFile,
        setShowPendencias }) => {

    const
        { selectedEmpresa, demand, demandFiles, activeStep, stepTitles, subtitles, dropDisplay, altContratoDoc, fileToRemove, info, showPendencias } = data,
        headerTitle = `Alteração de contrato social - ${selectedEmpresa?.razaoSocial}`,
        forms = [empresasForm, altContratoForm]

    return (
        <main>
            <header>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração de dados e contrato social' />
                {/*--------------------- Steppers ------------------------------*/}
                <section>
                    <CustomStepper
                        activeStep={activeStep}
                        steps={stepTitles}
                        setActiveStep={setActiveStep}
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
                selectedEmpresa?.cnpj &&
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
                                            {
                                                activeStep === 1 &&
                                                <div className='flex center' style={{ width: '100%' }}>
                                                    <DragAndDrop
                                                        name='altContratoDoc'
                                                        style={{ width: '440px' }}
                                                        dropDisplay={dropDisplay}
                                                        formData={altContratoDoc}
                                                        handleFiles={handleFiles}
                                                        demandFiles={demandFiles}
                                                        removeFile={removeFile}
                                                        fileToRemove={fileToRemove}
                                                    />
                                                </div>
                                            }
                                        </>
                                        :
                                        <EmpresaReview
                                            data={data}
                                            demandFiles={demandFiles}
                                            forms={forms}
                                            filesForm={empresaFiles}
                                        />
                                }
                            </section>
                            :
                            <section>

                                <AltSociosTemplate
                                    data={data}
                                    handleInput={handleInput}
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