const
    mongoose = require('mongoose')
    , distanciaSchema = require('./distanciaSchema')
    , idadeBaixaSchema = require('./idadeBaixaSchema')
    , nomesSchema = require('./nomesSchema')
    , prazosAlertaSchema = require('./prazosAlertaSchema');

//Todos os sub schemas com default: {} possuem seus respectivos valores padrão.
//A atribuição de um objeto vazio é para puxar de cada sub schema os padrões.
const parametrosSchema = new mongoose.Schema({

    distanciaPoltronas: { type: distanciaSchema, default: {} },
    idadeBaixa: { type: idadeBaixaSchema, default: {} },
    nomes: { type: nomesSchema, default: {} },
    motivosBaixa: {
        type: [],
        default: ["Baixado pela fiscalização",
            "Fim do contrato com delegatário",
            "Impróprio para uso",
            "Outros",
            "Pedido do delegatário",
            "Venda do veículo"]
    },
    prazosAlerta: { type: prazosAlertaSchema, default: {} },
    adminEmails: {
        type: [],
        default: [
            'cristina.souza@infraestrutura.mg.gov.br',
            'poliana.gomes@infraestrutura.mg.gov.br',
            'rozana.almeida@infraestrutura.mg.gov.br',
            'veber.junior@infraestrutura.mg.gov.br',
            'grasiele.soares@infraestrutura.mg.gov.br',
            'leandro.alvarenga@infraestrutura.mg.gov.br',
            'sandro.verissimo@infraestrutura.mg.gov.br',
            'sverissimo2@gmail.com']
    },
    inputValidation: { type: Boolean, default: true }
},
    {
        timestamps: true,
        strict: false
    });

const parametrosModel = mongoose.model('parametros', parametrosSchema, 'parametros');

module.exports = parametrosModel