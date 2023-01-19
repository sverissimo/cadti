//@ts-check
const addUpcomingSegurosMockData = [
    {
        "apolice": "99991",
        "seguradora_id": 5,
        "codigo_empresa": 70025,
        "data_emissao": "2024-02-02",
        "vencimento": "2025-02-15",
        "situacao": "Vigente"
    },
    {
        "apolice": "99992",
        "seguradora_id": 4,
        "codigo_empresa": 70025,
        "data_emissao": "2024-01-18T03:00:00.000Z",
        "vencimento": "2025-01-15T03:00:00.000Z",
        "situacao": "Vigente"
    },
    {
        "apolice": "99993",
        "seguradora_id": 3,
        "codigo_empresa": 70008,
        "data_emissao": "2023-01-19T03:00:00.000Z",
        "vencimento": "2023-02-19T03:00:00.000Z",
        "situacao": "Vigente"
    },
    {
        "apolice": "99994",
        "seguradora_id": 2,
        "codigo_empresa": 70008,
        "data_emissao": "2023-01-18T03:00:00.000Z",
        "vencimento": "2025-11-19T03:00:00.000Z",
        "situacao": "Vigente"
    },
    {
        "apolice": "99995",
        "seguradora_id": 1,
        "codigo_empresa": 9808,
        "data_emissao": "2022-12-29T03:00:00.000Z",
        "vencimento": "2023-01-17T03:00:00.000Z",
        "situacao": "Vigente"
    }
]

const vehiclesFromInsurancesMockData = [
    {
        "placa": "DDD-0004",
        "ano_carroceria": "2016",
        "codigo_empresa": 9060,
        "situacao": "Cadastro solicitado",
        //"apolice": "99994"
    },
    {
        "placa": "EEE-0005",
        "ano_carroceria": "2016",
        "codigo_empresa": 9060,
        "situacao": "Cadastro solicitado",
        "apolice": "Seguro não cadastrado"
    },
    {
        "placa": "FFF-0F06",
        "ano_carroceria": "2006",
        "codigo_empresa": 9060,
        "situacao": "Ativo",
        "apolice": "99993"
    }
]

module.exports = { addUpcomingSegurosMockData, vehiclesFromInsurancesMockData }
