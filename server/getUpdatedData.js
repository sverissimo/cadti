const { pool } = require('./config/pgConfig')

const vehicleQuery = id => `
SELECT veiculo.*,	
   marca_chassi.marca as marca_chassi,
   modelo_chassi.modelo_chassi,	
   marca_carroceria.marca as marca_carroceria,
   modelo_carroceria.modelo as modelo_carroceria,
   d.razao_social as empresa,
   d2.razao_social as compartilhado,
   seguradora.seguradora,
   seguro.data_emissao,
   seguro.vencimento
FROM veiculo
LEFT JOIN public.modelo_chassi
   ON veiculo.modelo_chassi_id = public.modelo_chassi.id
LEFT JOIN public.marca_chassi
   ON modelo_chassi.marca_id = marca_chassi.id
LEFT JOIN public.modelo_carroceria
   ON veiculo.modelo_carroceria_id = public.modelo_carroceria.id
LEFT JOIN public.marca_carroceria
   ON public.marca_carroceria.id = public.modelo_carroceria.marca_id
LEFT JOIN public.delegatario d
   ON veiculo.delegatario_id = d.delegatario_id
LEFT JOIN public.delegatario d2
   ON veiculo.delegatario_compartilhado = d2.delegatario_id
LEFT JOIN public.seguro
   ON veiculo.apolice = seguro.apolice
LEFT JOIN public.seguradora
   ON public.seguradora.id = seguro.seguradora_id
WHERE veiculo.veiculo_id = '${id}'
   ORDER BY veiculo.veiculo_id DESC
`

const getUpdatedData = async (table, id) => {

    if (table === 'veiculo') {

        const data = () => new Promise((resolve, reject) => {
            pool.query(vehicleQuery(id), (err, t) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                if (t && t.rows) {
                    console.log(t.rows)
                    resolve(t.rows)
                }
            })
        })


        console.log('*************** fuck *************', data())
        return data()
    }

}
module.exports = { getUpdatedData }