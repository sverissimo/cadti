const empresas = ` 
SELECT * FROM public.delegatario 
ORDER BY "razao_social" 
`

const veiculoInit = `
SELECT veiculo.*,	
	marca_chassi.marca as marca_chassi,
	modelo_chassi.modelo_chassi,	
	marca_carroceria.marca as marca_carroceria,
	modelo_carroceria.modelo as modelo_carroceria,
	delegatario.razao_social as empresa
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
SELECT seguro.* , seguradora.seguradora
FROM seguro
LEFT JOIN public.seguradora
	ON public.seguro.seguradora_id = public.seguradora.id
`

module.exports = { empresas, veiculoInit, modeloChassi, carrocerias, equipamentos, seguradoras, seguros }