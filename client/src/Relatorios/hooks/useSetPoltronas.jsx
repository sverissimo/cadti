import { useEffect, useState } from "react"
import { average } from "../utils"

export const useSetPoltronas = (selectedVehicles, anosLabel) => {
    const [poltronasMedia, setPoltronasMedia] = useState([])
    const [poltronasPerYearValues, setPoltronasPerYearValue] = useState([])
    const [totalDePoltronas, setTotalDePoltronas] = useState(0)

    useEffect(() => {
        if (selectedVehicles.length && anosLabel.length) {
            const poltronasPorAno = anosLabel.reduce((acc, ano) => ({
                ...acc,
                [ano]: selectedVehicles
                    .filter(v => v.anoCarroceria && v.anoCarroceria.toString() === ano)
                    .map(v => v.poltronas)
            }), {})

            const poltronasPerYearValuesTemp = anosLabel.map(ano => poltronasPorAno[ano].reduce((prev, curr) => prev + curr, 0))
            const poltronasMedia = anosLabel.map(ano => average(poltronasPorAno[ano]))
            const totalDePoltronas = poltronasPerYearValuesTemp.reduce((prev, curr) => prev + curr)

            setPoltronasMedia(poltronasMedia)
            setPoltronasPerYearValue(poltronasPerYearValuesTemp)
            setTotalDePoltronas(totalDePoltronas)
        }

    }, [selectedVehicles, anosLabel])

    return {
        poltronasMedia,
        poltronasPerYearValues,
        totalDePoltronas,
    }
}
