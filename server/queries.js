const empresas = ` 
SELECT d.*,
	cardinality (array_agg(v.veiculo_id)) frota,
	array_to_json(array_agg(v.veiculo_id)) veiculos	
FROM public.delegatario d
LEFT JOIN veiculo v
	ON v.delegatario_id = d.delegatario_id
GROUP BY d.delegatario_id
ORDER BY frota DESC
`

const veiculoInit = `
SELECT veiculo.*,	
	marca_chassi.marca as marca_chassi,
	modelo_chassi.modelo_chassi,	
	marca_carroceria.marca as marca_carroceria,
	modelo_carroceria.modelo as modelo_carroceria,
	delegatario.razao_social as empresa,
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
LEFT JOIN public.delegatario
	ON veiculo.delegatario_id = delegatario.delegatario_id
LEFT JOIN public.seguro
	ON veiculo.seguro_id = seguro.apolice
LEFT JOIN public.seguradora
	ON public.seguradora.id = seguro.seguradora_id
ORDER BY veiculo.veiculo_id DESC
`

const modeloChassi = `
SELECT modelo_chassi.id, modelo_chassi,
	public.marca_chassi.marca as marca
FROM modelo_chassi 
LEFT JOIN marca_chassi
	ON public.marca_chassi.id = public.modelo_chassi.marca_id
`

const carrocerias = `
SELECT modelo_carroceria.id, modelo_carroceria.modelo,
	public.marca_carroceria.marca as marca
FROM modelo_carroceria
LEFT JOIN marca_carroceria
	ON public.marca_carroceria.id = public.modelo_carroceria.marca_id
`

const equipamentos = `
SELECT * FROM equipamentos
`

const seguradoras = `
SELECT * FROM seguradora
`

const seguros = `
SELECT seguro.*,
	s.seguradora,
	array_to_json(array_agg(v.veiculo_id)) veiculos,
	array_to_json(array_agg(v.placa)) placas,
	d.razao_social empresa,
	cardinality(array_agg(v.placa)) segurados
FROM seguro
LEFT JOIN veiculo v
	ON seguro.apolice = v.seguro_id
LEFT JOIN delegatario d
	ON d.delegatario_id = v.delegatario_id
LEFT JOIN seguradora s
	ON s.id = seguro.seguradora_id
GROUP BY seguro.apolice, d.razao_social, s.seguradora
ORDER BY seguro.vencimento ASC
`

module.exports = { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras, seguros }