import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import AutoComplete from '../Utils/autoComplete'

import './commonStyles.css'

function SelectEmpresa(props) {

    const
        [enableSelect, setEnabled] = useState(true),
        { empresas, compartilhados, handleInput, handleBlur, shared, headerTitle } = props,
        { razaoSocial, compartilhado, activeStep, demand } = props.data,
        singleEmpresaUser = empresas.length === 1,
        list = 'razaoSocial'


    //Configure the form. If shared is present in state, another form will be pusshed into the array (CadVehicles)
    let headerTitles = [{ title: 'Selecione a Viação', list, name: list, value: razaoSocial }]
    if (shared)
        headerTitles.push({ title: 'Empresa autorizada a compartilhar', list, name: 'compartilhado', value: compartilhado })


    //Render field or title conditionally
    useEffect(() => {
        //|| user?.empresas.length === 1
        if (demand || activeStep > 0 || singleEmpresaUser)
            setEnabled(false)
        else if (activeStep === 0)
            setEnabled(true)

        //focus no campo de preencher o nome da empresa
        const selectInput = document.getElementsByName('razaoSocial')
        if (enableSelect && selectInput[0])
            selectInput[0].focus()

    }, [demand, activeStep, enableSelect, singleEmpresaUser])

    return (
        <div
            className={props.hasOwnProperty('shared') ? 'flex center' : 'paper flex center'}
            style={{
                flexDirection: activeStep === 0 ? 'row' : 'column',
                width: '100%',
                marginBottom: 0,
            }}>
            {
                !enableSelect &&
                <div className='selectedEmpresa'
                    style={{ padding: shared && activeStep === 0 && '0 30px 33px 0' }}>
                    {headerTitle || demand?.empresa || razaoSocial || ''}
                </div>
            }
            {props.hasOwnProperty('shared') && activeStep !== 0 && compartilhado &&
                <div className='compartilhadoHeader'>
                    Compartilhado por {compartilhado}
                </div>
            }
            {
                (!activeStep || activeStep === 0) && headerTitles.map(({ title, list, name, value }, i) =>
                    ((singleEmpresaUser && i === 1) || !singleEmpresaUser) &&
                    < div className='flexColumn' key={i} >
                        <h4 style={{ margin: '5px 0', textAlign: 'center' }}>{title}</h4>
                        <input
                            list={list}
                            name={name}
                            className='selectEmpresa'
                            value={value}
                            onChange={handleInput}
                            onBlur={handleBlur}
                            autoComplete='off'
                        />
                        <AutoComplete
                            collection={props.hasOwnProperty('shared') ? compartilhados : empresas}
                            datalist={list}
                            value={value}
                        />
                    </div>
                )
            }
        </div >
    )
}

function mapStateToProps(state) {
    return { user: state.user, redux: state.data }
}

export default connect(mapStateToProps)(SelectEmpresa)