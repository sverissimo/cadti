import React, { useState, useEffect } from 'react'
import { delegatario as delega, dadosVeiculo, caracteristicas as carac, seguro as seg, vistoria, pesagem as peso, informacoesGerais as info } from '../Forms/certificate'
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

            /*   setTimeout(() => {
                  if (data) window.print()
              }, 500); */
        }
        setData()
        localStorage.removeItem('vehicle')
    }, [])

    //Cria array de formulários importados para fazer um loop preenchendo com valores do state
    const formArray = [carac, dadosVeiculo, delega, seg, vistoria, peso, info]
    let object = {}

    if (vehicle) {
        //Adiciona Passag/Bagagem no certificado, q é poltronas x 80kg ou 0.08ton
        const
            { poltronas, pesoDianteiro } = vehicle,
            pesoPassageiros = poltronas * 80 / 1000
        vehicle.pesoPassageiros = pesoPassageiros
        vehicle.pesoDianteiro = +pesoDianteiro

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
    }
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
            vehicle={vehicle}
            nomes={names}
            checkMulti={checkMulti}
            redirect={redirect}
            delega={delega}
            carac={carac}
            dadosVeiculo={dadosVeiculo}
            seg={seg}
            vistoria={vistoria}
            peso={peso}
            info={info}
        />
    )
}