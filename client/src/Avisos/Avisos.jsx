import React, { useEffect } from 'react'
import StoreHOC from '../Store/StoreHOC'
import AvisosTemplate from './AvisosTemplate'

const Avisos = props => {
    const { avisos } = props.redux

    useEffect(() => {
        if (avisos) {
            avisos.forEach(a => {
                a.message = JSON.parse(a.message)
            });
        }

        return () => void 0
    }, [avisos])

    return (
        <AvisosTemplate
            avisos={avisos}
        />
    )
}

const collections = ['avisos']

export default StoreHOC(collections, Avisos)
