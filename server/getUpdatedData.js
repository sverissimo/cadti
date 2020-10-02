const { pool } = require('./config/pgConfig')

const vehicleQuery = condition => `
   SELECT veiculos.*,	
      (extract(year from current_date) - ano_carroceria) as indicador_idade,   
      marca_chassi.marca as marca_chassi,
      modelo_chassi.modelo_chassi,	
      marca_carroceria.marca as marca_carroceria,
      modelo_carroceria.modelo as modelo_carroceria,
      d.razao_social as empresa,
      d2.razao_social as compartilhado,
      seguradora.seguradora,
      seguros.data_emissao,
      seguros.vencimento      
   FROM veiculos
   LEFT JOIN public.modelo_chassi
      ON veiculos.modelo_chassi_id = public.modelo_chassi.id
   LEFT JOIN public.marca_chassi
      ON modelo_chassi.marca_id = marca_chassi.id
   LEFT JOIN public.modelo_carroceria
      ON veiculos.modelo_carroceria_id = public.modelo_carroceria.id
   LEFT JOIN public.marca_carroceria
      ON public.marca_carroceria.id = public.modelo_carroceria.marca_id
   LEFT JOIN public.empresas d
      ON veiculos.codigo_empresa = d.codigo_empresa
   LEFT JOIN public.empresas d2
      ON veiculos.compartilhado_id = d2.codigo_empresa
   LEFT JOIN public.seguros
      ON veiculos.apolice = seguros.apolice
   LEFT JOIN public.seguradora
      ON public.seguradora.id = seguros.seguradora_id   
   WHERE ${condition}
   ORDER BY veiculos.veiculo_id DESC
`

const seguroQuery = condition => `
SELECT seguros.*,
	s.seguradora,
	array_to_json(array_agg(v.veiculo_id)) veiculos,
	array_to_json(array_agg(v.placa)) placas,
	d.razao_social empresa,	
	cardinality(array_agg(v.placa)) segurados
FROM seguros
LEFT JOIN veiculos v
	ON seguros.apolice = v.apolice
LEFT JOIN empresas d
	ON d.delegatario_id = seguros.delegatario_id
LEFT JOIN seguradora s
	ON s.id = seguros.seguradora_id
${condition}
GROUP BY seguros.apolice, d.razao_social, s.seguradora, d.delegatario_id
ORDER BY seguros.vencimento ASC
`

const socioQuery = condition => `
SELECT public.socios.*, public.empresas.razao_social
   FROM public.socios 
LEFT JOIN public.empresas 
   ON empresas.delegatario_id = socios.delegatario_id
${condition}
ORDER BY nome_socio ASC
`

const empresaQuery = condition => ` 
SELECT d.*,
	cardinality (array_agg(v.veiculo_id)) frota,
	array_to_json(array_agg(v.veiculo_id)) veiculos	
FROM public.empresas d
LEFT JOIN veiculos v
	ON v.delegatario_id = d.delegatario_id
${condition}
GROUP BY d.delegatario_id
ORDER BY frota DESC
`

const procuradorQuery = condition => `
SELECT * FROM public.procurador
${condition}
order by procurador.procurador_id desc
`

const getUpdatedData = async (table, condition) => {

   let query
   if (table === 'veiculos') query = vehicleQuery
   if (table === 'seguros') query = seguroQuery
   if (table === 'socio') query = socioQuery
   if (table === 'empresa') query = empresaQuery
   if (table === 'procurador') query = procuradorQuery

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
   return data()
}
module.exports = { getUpdatedData }