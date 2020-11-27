import React, { useState, useEffect } from 'react'
import { delegatario, caracteristicas, seguro, pesagem, informacoesGerais, other } from '../Forms/certificate'
import CertificateTemplate from './CertificateTemplate'

export default function PdfCertificate() {

    const
        [vehicle, setVehicle] = useState({}),
        [names, setNames] = useState({})

    useEffect(() => {
        async function setData() {
            const
                data = JSON.parse(localStorage.getItem('vehicle')),
                nomes = JSON.parse(localStorage.getItem('nomes'))

            let menus = document.querySelectorAll('.MuiToolbar-root')
            menus.forEach(m => m.style.display = 'none')

            await setVehicle(data)
            if (nomes)
                await setNames(nomes)

            setTimeout(() => {
                if (data) window.print()
            }, 500);
        }
        setData()
        localStorage.removeItem('vehicle')
    }, [])

    let carac = caracteristicas,
        delega = delegatario,
        seg = seguro,
        peso = pesagem,
        info = informacoesGerais,
        obs = other,
        object = {}

    const formArray = [carac, delega, seg, peso, info, obs]

    if (vehicle)
        formArray.forEach(form => {
            Object.entries(vehicle).forEach(([key, value]) => {
                form.forEach((line, i) => {
                    line.forEach((obj, k) => {
                        if (obj.field === key) {
                            object = Object.assign(obj, { value })
                            form[i][k] = object
                            object = {}
                        }
                    })
                })
            })
        })
    const checkMulti = field => {
        if (field === 'equipamentosId' || field === 'equipamentosId') return
        else return 'certificate'
    }
    const redirect = () => {
        let menus = document.querySelectorAll('.MuiToolbar-root')
        menus.forEach(m => m.style.display = 'none')
        const url = window.location.origin
        window.location.href = url;
    }

    if (!vehicle) {
        const url = window.location.origin
        window.location.replace(url)
        return null
    }
    return (
        <CertificateTemplate
            nomes={names}
            checkMulti={checkMulti}
            redirect={redirect}
            carac={carac}
            delega={delega}
            seg={seg}
            peso={peso}
            info={info}
            obs={obs}
        />
    )
}