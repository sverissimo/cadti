import React from 'react'

export default function autoComplete({ collection, datalist, value }) {
    
    if (value.length > 2 && typeof collection !== 'string') {
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
