import humps from 'humps'
const validaDistanciaMinima = (utilizacao, dist, distancias) => {

    utilizacao = humps.camelize(utilizacao)
    if (utilizacao === 'leitoEExecutivo')
        utilizacao = 'leitoExecutivo'
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