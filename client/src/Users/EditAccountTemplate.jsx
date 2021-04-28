import React from 'react'
import { editAccountForm as form } from '../Forms/editAccountForm'
import CustomButton from '../Reusable Components/CustomButton'
import FormSubtiltle from '../Reusable Components/FormSubtiltle'
import TextInput from '../Reusable Components/TextInput'
import './editAccount.scss'

/**
 * 
 * @param {object } data
 *
 * @returns 
 */
const EditAccountTemplate = ({ data, handleInput, handleSubmit }) => {
    const { modified } = data
    return (
        <div className='flexColumn center editAccount__container'>
            <header className="selectHeader">
                <h4 className='parametrosTitle'>Alterar dados da conta</h4>
                <FormSubtiltle
                    subtitle={`Caso deseje alterar apenas a senha, insira apenas a senha e a confirmação. Não é necessário informar a senha para alterar os demais dados da conta.`}
                />
            </header>
            <main className='configForm'>
                <TextInput
                    form={form}
                    data={data}
                    handleInput={handleInput}
                    style={{ width: '100%', flexDirection: 'column' }}
                />
            </main>
            <div style={{ minHeight: '60px', position: 'flex' }}>
                <CustomButton
                    action='save'
                    onClick={handleSubmit}
                    disabled={!modified}
                />
            </div>
        </div>
    )
}

export default EditAccountTemplate

