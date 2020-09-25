const validaDistanciaMinima = (utilizacao, dist) => {

    const distancias = {
        Convencional: 70,
        Executivo: 79,
        'Semi-Leito': 95,
        Leito: 105,
        Urbano: 65
    }

    let validDistance, d

    if (distancias[utilizacao] && dist && dist !== '') {
        dist = Number(dist)
        d = distancias[utilizacao]

        if (d <= dist)
            validDistance = true
        else
            validDistance = false
    }
    if (validDistance)
        return false
    else if (d)
        return `A distância mínima para a utilização "${utilizacao}" é de ${d} centímetros. Altere a distância ou clique em "voltar" para alterar a utilização.`
}

export default validaDistanciaMinima