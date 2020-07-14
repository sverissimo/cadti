import React from 'react'

export default function autoComplete({ collection, datalist, value, empresas }) {    
    
    if (value?.length > 2 && typeof collection !== 'string') {
        if(datalist === 'razaoSocial' && empresas && empresas[0]) collection = empresas
        return (
            <datalist id={datalist}>
                {
                    collection.map((item, index) => {

                        return (
                            <option key={index}>{item[datalist]}</option>
                        )
                    })}
            </datalist>
        )
    } else {
        return null
    }
}
