//Passa this como argumento para a função verificar se o pbt ultrapassou o cmt legal
const checkWeight = component => {

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
    if (+cmt >= pbt)
        console.log('Cmt, pbt ok.', cmt, pbt)
    else {
        const stringBR = num => {
            if (!num)
                return
            num = num.toString()
                .replace('.', ',')
                .replace(',000', '')
            if (num.slice(-1) === '0' && num.charAt(1) === ',')
                num = num.slice(0, num.length - 1)
            if (num.slice(-1) === '0' && num.charAt(1) === ',')
                num = num.slice(0, num.length - 1)

            console.log(num)
            return num
        }
        const
            //pbtString = pbt && pbt.toString().replace('.', ','),
            pbtString = stringBR(pbt),
            cmtString = cmt && cmt.toString().replace('.', ','),
            customTitle = 'Peso total bruto superior ao permitido (CMT) para o modelo de chassi informado.',
            customMsg = `O número de poltronas e os pesos dianteiro e traseiro informados formam um peso bruto total de ${pbtString}t, superior à 
                Carga Máxtima de tração permitida: modelo ${modeloChassi} -> ${cmtString}t.`
        component.setState({ openAlertDialog: true, customTitle, customMsg, poltronas: 0, pesoDianteiro: 0, pesoTraseiro: 0 })
    }
}

export default checkWeight