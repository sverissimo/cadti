const { pool } = require('./config/pgConfig')

const vehicleQuery = condition => `
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
   WHERE ${condition}
   ORDER BY veiculo.veiculo_id DESC
`

const seguroQuery = condition => `
SELECT seguro.*,
	s.seguradora,
	array_to_json(array_agg(v.veiculo_id)) veiculos,
	array_to_json(array_agg(v.placa)) placas,
	d.razao_social empresa,	
	cardinality(array_agg(v.placa)) segurados
FROM seguro
LEFT JOIN veiculo v
	ON seguro.apolice = v.apolice
LEFT JOIN delegatario d
	ON d.delegatario_id = seguro.delegatario_id
LEFT JOIN seguradora s
	ON s.id = seguro.seguradora_id
${condition}
GROUP BY seguro.apolice, d.razao_social, s.seguradora, d.delegatario_id
ORDER BY seguro.vencimento ASC
`

const getUpdatedData = async (table, condition) => {

   let query
   if (table === 'veiculo') query = vehicleQuery
   if (table === 'seguro') query = seguroQuery
   console.log(query)
   const data = () => new Promise((resolve, reject) => {
      pool.query(query(condition), (err, t) => {
         if (err) {
            console.log(err)
            reject(err)
         }
         if (t && t.rows) {
            resolve(t.rows)
         }
      })
   })
   console.log(data())
   return data()

}
module.exports = { getUpdatedData }