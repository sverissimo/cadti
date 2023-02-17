//@ts-check
export const createSociosUpdate = (state) => {
    const { filteredSocios, selectedEmpresa, demand } = state
    const { codigoEmpresa } = selectedEmpresa
    const cpfsToRemove = []
    const cpfsToAdd = []
    const socioUpdates = filteredSocios.filter(s => !!s.status)

    if (!socioUpdates.length) {
        return null
    }

    socioUpdates.forEach(m => {
        const { edit, createdAt, razaoSocial, ...filteredFields } = m
        m = filteredFields
        Object.keys(m).forEach(k => { if (!m[k]) delete m[k] })
    })

    socioUpdates.forEach(s => {
        //Se o sócio ainda não tem a empresa em sua array de empresas, inserir
        if (s.empresas && s.empresas[0] && !s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)) {
            s.empresas.push({ codigoEmpresa, share: s?.share })
            console.log(s, s.empresas)
        }
        //Se a empresa já existe, atualiza o share
        else if (s.empresas && s.empresas[0] && s.empresas.some(e => e.codigoEmpresa === codigoEmpresa)) {
            const index = s.empresas.findIndex(e => e.codigoEmpresa === codigoEmpresa)
            s.empresas[index].share = +s.share
            console.log(s, s.empresas)
        }
        else if (!s.empresas || !s.empresas[0])
            s.empresas = [{ codigoEmpresa, share: s?.share }]
        //Se newSocio, incluir cpf para atualizar permissões de usuário
        if (s.status === 'new' || s.outsider === true)
            cpfsToAdd.push({ cpf_socio: s.cpfSocio })
        //Se deleted, remove o código da empresa da array de empresas do sócio e grava todos os cpfs para retirar permissão de usuário
        if (s.empresas instanceof Array && s.status === 'deleted') {
            s.empresas = s.empresas.filter(e => e.codigoEmpresa !== codigoEmpresa)
            cpfsToRemove.push({ cpf_socio: s.cpfSocio }) // Esse é o formato esperado no backEnd (/users/removeEmpresa.js)
            //Se após apagada a empresa, não houver nenhuma, registra 0 como único elemento da array empresas (previne erro no posgresql)
            if (!s.empresas[0])
                s.empresas = []
        }
    })

    //Se não tiver demand, retorna socioUpdates
    if (!demand)
        return { socioUpdates, cpfsToAdd, cpfsToRemove }

    //Prepara o objeto de resposta
    if (demand) {
        //Replace with map and destructuring...
        socioUpdates.forEach(s => {
            delete s.outsider
            delete s.razaoSocial
            delete s.codigoEmpresa
            delete s.originalStatus
            //s.empresas = JSON.stringify(s.empresas)
        })

        const
            newSocios = socioUpdates.filter(s => s.status === 'new'),
            oldSocios = socioUpdates.filter(s => s.status === 'modified' || s.status === 'deleted')

        //Se aprovado, Apaga a prop 'status' de cada sócio antes do request
        oldSocios.forEach(s => delete s.status)
        newSocios.forEach(s => delete s.status)
        return { newSocios, oldSocios, cpfsToAdd, cpfsToRemove }
    }
}
