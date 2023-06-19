import { useState, useEffect, useCallback, useMemo } from 'react'
import { useReducer } from 'react';
import { useSetIdades } from './hooks/useSetIdades';
import { useSetPoltronas } from './hooks/useSetPoltronas';
import { initialState, relatoriosReducer } from './RelatoriosReducer';
import { sum, average, countExpired } from './utils';

let debounceTimer

const Relatorios = props => {
    const { veiculos, empresas } = props.redux;
    const [state, dispatch] = useReducer(relatoriosReducer, initialState)
    const [razaoSocial, setRazaoSocial] = useState('')
    const [selectedEmpresa, setEmpresa] = useState()
    const [selectedVehicles, setSelectedVehicles] = useState([])

    const {
        anosLabel,
        idadeValues,
        mediaIdades,
        moda,
    } = useSetIdades(selectedVehicles)

    const {
        poltronasMedia,
        poltronasPerYearValues,
        totalDePoltronas,
    } = useSetPoltronas(selectedVehicles, anosLabel)

    useEffect(() => {
        if (selectedEmpresa) {
            const { codigoEmpresa } = selectedEmpresa
            const selectedVehicles = veiculos.filter(v => v.codigoEmpresa === codigoEmpresa)
            setSelectedVehicles(selectedVehicles)
        } else {
            setSelectedVehicles(veiculos)
        }
    }, [selectedEmpresa, veiculos])

    useEffect(() => {
        const currentYear = new Date().getFullYear()
        const segurosVencidos = countExpired(selectedVehicles)
        const segurosVigentes = selectedVehicles.length - segurosVencidos
        const veiculosAntigos = selectedVehicles.filter(v => currentYear - v.anoCarroceria > 14 && v.anoCarroceria !== null).length
        const veiculosNovos = selectedVehicles.length - veiculosAntigos

        dispatch({ type: 'SET_VEICULOS', payload: { veiculosNovos, veiculosAntigos } })
        dispatch({ type: 'SET_SEGUROS', payload: { segurosVencidos, segurosVigentes } })
    }, [selectedVehicles])

    const handleInput = useCallback((e) => {
        const { value } = e.target
        setRazaoSocial(value)

        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            if (value.length > 2) {
                const empresa = empresas.find(e => e.razaoSocial === value)
                setEmpresa(empresa)
            } else {
                setEmpresa()
            }
        }, 200)
    }, [empresas])

    const tableLabels = useMemo(() => ['Ano', ...anosLabel, 'Total'], [anosLabel])
    const anosValues = useMemo(() => ['Nº de Veículos', ...idadeValues, sum(idadeValues)], [idadeValues])
    const mediaPoltronaValues = useMemo(() => ['Capacidade Média', ...poltronasMedia, average(poltronasMedia)], [poltronasMedia])
    const numeroPoltronaValues = useMemo(() => ['Capacidade Total', ...poltronasPerYearValues, totalDePoltronas], [poltronasPerYearValues, totalDePoltronas])
    const tableData = useMemo(() => [anosValues, mediaPoltronaValues, numeroPoltronaValues], [anosValues, mediaPoltronaValues, numeroPoltronaValues])
    const { veiculosAntigos, veiculosNovos, segurosVencidos, segurosVigentes } = state

    return {
        empresas,
        razaoSocial,
        anosLabel,
        tableLabels,
        idadeValues,
        tableData,
        selectedEmpresa,
        selectedVehicles,
        mediaIdades,
        moda,
        handleInput,
        segurosVencidos,
        segurosVigentes,
        veiculosAntigos,
        veiculosNovos,
        totalDePoltronas,
    }
}

export default Relatorios
