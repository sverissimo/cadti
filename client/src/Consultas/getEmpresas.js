//@ts-check
//Caso a aba seja Sócios ou Procuradores, extrai e renderiza o nome das empresas das arrays de codigoEmpresa de cada sócio/procurador
export const getEmpresas = (collection, empresas, tab) => {
    collection.forEach(s => {
        if (s.empresas instanceof Array) {
            let codigos = s.empresas
            if (tab === 1) {
                codigos = s.empresas.map(e => e?.codigoEmpresa)
                s.share = _shareToString(s)
            }

            const nomeEmpresas = empresas
                .filter(e => codigos.includes(e.codigoEmpresa))
                .map(e => e.razaoSocial)
                .toString()
                .replace(',', ', ')
            if (nomeEmpresas) {
                s.nomeEmpresas = nomeEmpresas
            }
        }
    })

    return collection
}

function _shareToString(socio) {
    let share = socio?.empresas[0]?.share || ''
    if (share) share += '%'
    if (socio.empresas.length > 1) {
        share = socio.empresas
            .filter(e => !!e.share)
            .map(e => String(e.share) + '%')
            .join(', ')
    }

    return share
}
