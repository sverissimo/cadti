import React from 'react'

export default function AutoComplete({ collection = [], field, itemProp, value }) {

    if (value?.length > 2 && typeof collection !== 'string') {

        //O id é o próprio field (ex:placa). Quando for diferente, o parentComponent deve passar o itemProp a ser renderizado. 
        if (field === 'modeloCarroceria')
            field = 'modelo'
        if (!itemProp)
            itemProp = field

        return (
            <datalist id={field} autoComplete='off'>
                {
                    collection.map((item, index) => {
                        return (
                            <option key={index}>{item[itemProp]}</option>
                        )
                    })}
            </datalist>
        )
    }
    else {
        return null
    }
}
