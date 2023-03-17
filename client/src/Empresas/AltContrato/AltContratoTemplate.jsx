import React from 'react'
import { EmpresaReview } from '../EmpresaReview'
import AltSociosTemplate from './AltSociosTemplate'
import { altContratoForm, dadosEmpresaForm, altContratoFiles, empresaFiles } from './forms'
import StoreHOC from '../../Store/StoreHOC'

import Crumbs from '../../Reusable Components/Crumbs'
import FormSubtitle from '../../Reusable Components/FormSubtitle'
import SelectEmpresa from '../../Reusable Components/SelectEmpresa'
import CustomStepper from '../../Reusable Components/Stepper'
import TextInput from '../../Reusable Components/TextInput'
import StepperButtons from '../../Reusable Components/StepperButtons'
import DragAndDrop from '../../Reusable Components/DragAndDrop'
import { stepTitles, subtitles } from './data/stepLabels'
import AlertDialog from '../../Reusable Components/AlertDialog'
import ReactToast from '../../Reusable Components/ReactToast'
import AltContrato from './AltContrato'

const AltContratoTemplate = (props) => {
    const { empresas, selectedEmpresa, data, activeStep, setActiveStep, enableEdit, handleEdit, addSocio, removeSocio, handleInput, handleBlur, handleSubmit, handleFiles, removeFile,
        filteredSocios, demand, setShowPendencias, alertObj, closeAlert, toast } = AltContrato(props)

    const { demandFiles, form, fileToRemove, info, showPendencias, confirmToast, toastMsg } = data
    const headerTitle = `Alteração de contrato social - ${selectedEmpresa?.razaoSocial}`
    const forms = [dadosEmpresaForm, altContratoForm]

    return (
        <>
            <header>
                <Crumbs links={['Empresas', '/empresas']} text='Alteração de dados e contrato social' demand={demand} selectedEmpresa={selectedEmpresa} />
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
                        activeStep={activeStep}
                        demand={demand}
                    />
                </div>
            </header>
            {
                selectedEmpresa instanceof Object &&
                <>
                    {
                        activeStep !== 2 ?
                            <section className="flex paper">
                                <FormSubtitle subtitle={subtitles[activeStep || 0] || ''} />
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
                                            filteredSocios={filteredSocios}
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
                                    selectedEmpresa={selectedEmpresa}
                                    filteredSocios={filteredSocios}
                                    activeStep={activeStep}
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
            {
                alertObj?.openAlertDialog &&
                <AlertDialog
                    open={alertObj.openAlertDialog}
                    close={closeAlert}
                    customMessage={alertObj.customMessage}
                    customTitle={alertObj.customTitle}
                />
            }
            <ReactToast open={confirmToast} close={toast} msg={toastMsg} />
        </>
    )
}

const collections = ['empresas', 'socios', 'getFiles/empresaDocs']
export default (StoreHOC(collections, AltContratoTemplate))
