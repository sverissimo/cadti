import React from 'react'
import AutoComplete from '../Utils/autoComplete'

import './commonStyles.css'

export default function SelectEmpresa(props) {

    const
        { empresas, handleInput, handleBlur, shared, headerTitle } = props,
        { razaoSocial, delegatarioCompartilhado, activeStep, demand } = props.data,
        list = 'razaoSocial'

    //Configure the form. If shared is present in state, another form will be pusshed into the array (CadVehicles)
    let headerTitles = [{ title: 'Selecione a Viação', list, name: list, value: razaoSocial }]
    if (shared)
        headerTitles.push({ title: 'Empresa autorizada a compartilhar', list, name: 'delegatarioCompartilhado', value: delegatarioCompartilhado })

    //Render field or title conditionally
    let enableSelect = true

    if (demand) enableSelect = false
    else if (activeStep && activeStep > 0) enableSelect = false

    if (enableSelect)
        return (
            <div className={props.hasOwnProperty('shared') ? 'flex center' : 'paper flex center'} style={{ width: '100%', marginBottom: 0 }}>
                {
                    headerTitles.map(({ title, list, name, value }, i) =>
                        <div className='flexColumn' key={i}>
                            <h4 style={{ margin: '5px 0', textAlign: 'center' }}>{title}</h4>
                            <input
                                list={list}
                                name={name}
                                className='selectEmpresa'
                                value={value}
                                onChange={handleInput}
                                onBlur={handleBlur}
                            />
                            <AutoComplete
                                collection={empresas}
                                datalist={list}
                                value={value}
                            />
                        </div>
                    )
                }
            </div >
        )
    else return (
        <>
            <span className='selectedEmpresa'> {headerTitle || demand?.empresa || ''} </span>
        </>
    )
}