//Calcula o CMT legal após o blur do modeloChassi e salva no estado local
export const getCMT = component => {
    const
        { modelosChassi } = component.props.redux,
        { modeloChassi } = component.state

    if (!modeloChassi)
        return

    const cmt = modelosChassi.find(c => c.modeloChassi === modeloChassi)?.cmt
    console.log("🚀 ~ file: CadVeiculo.jsx ~ line 190 ~ VeiculosContainer ~ cmt", cmt)
    component.setState({ cmt })
}

//Passa this como argumento para a função verificar se o pbt ultrapassou o cmt legal
const checkWeight = (component, name) => {

    let { poltronas, pesoDianteiro, pesoTraseiro, cmt, modeloChassi } = component.state

    poltronas = poltronas || 0
    pesoDianteiro = pesoDianteiro || 0
    pesoTraseiro = pesoTraseiro || 0

    //Converte string p número para corrigir ponto e vírgula como casa decimal.
    const
        pd = pesoDianteiro && parseFloat(pesoDianteiro.replace(',', '.')).toFixed(3),
        pt = pesoTraseiro && parseFloat(pesoTraseiro.replace(',', '.')).toFixed(3)

    let pbt = +poltronas * 0.08 + (+pd + (+pt))

    if (isNaN(pbt))
        pbt = undefined
    else
        pbt = pbt.toFixed(3)

    if (!pbt || !cmt)
        return
    //Avalia se o PBT é maior que o CMT
    if (+cmt >= pbt) {
        //console.log('Cmt, pbt ok.', cmt, pbt)
        pbt = Number(stringBR(pbt).replace(',', '.'))
        component.setState({ pbt })
    }
    else {
        //Se o PBT for maior que o CMT, zera os campos de peso e poltronas e abre alerta (modal) para o usuário.
        const
            pbtString = stringBR(pbt),
            cmtString = cmt && cmt.toString().replace('.', ','),
            customTitle = 'Peso total bruto superior ao permitido (CMT) para o modelo de chassi informado.',
            customMessage = `O número de poltronas e os pesos dianteiro e traseiro informados formam um peso bruto total de ${pbtString}t, superior à 
                Carga Máxima de tração permitida: modelo ${modeloChassi} -> ${cmtString}t.`
        component.setState({ openAlertDialog: true, customTitle, customMessage, [name]: 0 })

    }
}

//Recebe um float de 3 casas, transforma o número em string, troca "." por "," , retira os zeros depois da vírgula
export const stringBR = num => {
    if (!num)
        return
    num = num.toString()
        .replace('.', ',')
        .replace(',000', '')
    if (num.slice(-1) === '0' && (num.charAt(1) === ',' || num.charAt(2) === ','))
        num = num.slice(0, num.length - 1)
    if (num.slice(-1) === '0' && (num.charAt(1) === ',' || num.charAt(2) === ','))
        num = num.slice(0, num.length - 1)

    console.log(num)
    return num
}

export default checkWeight