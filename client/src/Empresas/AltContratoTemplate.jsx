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


const AltContratoTemplate = ({ empresas, data, handleInput, setActiveStep }) => {

    const
        { selectedEmpresa, activeStep, steps, subtitles, dropDisplay } = data,
        headerTitle = `Alteração de contrato social - ${selectedEmpresa?.razaoSocial}`,
        forms = [empresasForm, altContratoForm]

    return (
        <main>
            <header>
                <Crumbs links={['Empresas', '/altContrato']} text='Alteração de dados e contrato social' />
                {/*--------------------- Steppers ------------------------------*/}
                <section>
                    <CustomStepper
                        activeStep={activeStep}
                        steps={steps}
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
                    <section className="flex paper">
                        <FormSubtiltle subtitle={subtitles[activeStep]} />
                        {activeStep < 2 ?
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
                                            name='contratoSocial'
                                            dropDisplay={dropDisplay}
                                        /* formData={contratoSocial}
                                        handleFiles={handleFiles}
                                        demandFiles={demandFiles}
                                        removeFile={removeFile}
                                        fileToRemove={fileToRemove} */
                                        />
                                    </div>
                                }
                            </>
                            :
                            <EmpresaReview
                                forms={forms}
                                data={data}
                            />
                        }
                    </section>
                    <footer>
                        <StepperButtons
                            activeStep={activeStep}
                            lastStep={steps.length - 1}
                            setActiveStep={setActiveStep}
                        //handleInput={handleInput}
                        //handleSubmit={this.handleCadastro}
                        />
                    </footer>
                </>
            }
        </main>
    )
}

export default AltContratoTemplate