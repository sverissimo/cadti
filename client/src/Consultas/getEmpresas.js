//Caso a aba seja Sócios ou Procuradores, extrai e renderiza o nome das empresas das arrays de codigoEmpresa de cada sócio/procurador
const getEmpresas = (collection, empresas, tab) => {
    let nomeEmpresas
    collection.forEach(s => {
        if (s.empresas instanceof Array) {
            //Se o tab for 2, o array é de integers, codigoEmpresa.
            let codigos = s.empresas
            //Se a tab for 1, a array é de objetos e cada obj tem a prop codigoEmpresa
            if (tab === 1)
                codigos = s.empresas.map(e => e?.codigoEmpresa)

            nomeEmpresas = empresas
                .filter(e => codigos.includes(e.codigoEmpresa))
                .map(e => e.razaoSocial)
                .toString()
                .replace(',', ', ')
            if (nomeEmpresas)
                s.nomeEmpresas = nomeEmpresas
        }
    })
    return collection
}

export default getEmpresas
