import { useEffect, useState } from "react"

export const useSetIdades = (selectedVehicles) => {
    const [anosLabel, setAnosLabel] = useState([])
    const [idadeValues, setIdadeValues] = useState([])
    const [mediaIdades, setMediaIdades] = useState('')
    const [moda, setModa] = useState('')

    useEffect(() => {
        if (!selectedVehicles.length) {
            return
        }

        const anoFabricacao = selectedVehicles
            .filter(v => !!v.anoCarroceria && v.situacao !== 'Cadastro solicitado')
            .map(({ anoCarroceria }) => anoCarroceria).sort()

        const mediaAnoFabricacao = anoFabricacao.reduce((a, b) => a + b / anoFabricacao.length, 0)
        const idadesCounter = anoFabricacao.reduce((acc, el) => {
            if (!acc[el]) acc[el] = 0
            acc[el] += 1
            return acc
        }, {})

        const anosLabel = Object.keys(idadesCounter).sort((a, b) => Number(a) - Number(b))
        const idadeValues = Object.values(idadesCounter)
        const mediaIdades = (new Date().getFullYear() - mediaAnoFabricacao).toFixed(2)
        const moda = Object.keys(idadesCounter).sort((a, b) => idadesCounter[a] - idadesCounter[b]).pop()

        setAnosLabel(anosLabel)
        setIdadeValues(idadeValues)
        setMediaIdades(mediaIdades)
        setModa(moda)

    }, [selectedVehicles])

    return {
        anosLabel,
        idadeValues,
        mediaIdades,
        moda,
    }
}
