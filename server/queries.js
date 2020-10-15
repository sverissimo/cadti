const { pool } = require('./config/pgConfig')

const empresas = ` 
		SELECT d.*,
			cardinality (array_remove(array_agg(v.veiculo_id), null)) frota		
		FROM public.empresas d
		LEFT JOIN veiculos v
			ON v.codigo_empresa = d.codigo_empresa
		GROUP BY d.codigo_empresa, d.delegatario_id
		ORDER BY frota DESC
		`
//ORDER BY frota DESC LIMIT 20
//array_to_json(array_agg(v.veiculo_id)) veiculos,	
//array_to_json(array_agg(v.placa)) placas

const veiculos = `
		SELECT veiculos.*,
			(extract(year from current_date) - ano_carroceria) as indicador_idade,
			marca_chassi.marca as marca_chassi,
			modelo_chassi.modelo_chassi,	
			marca_carroceria.marca as marca_carroceria,
			modelo_carroceria.modelo as modelo_carroceria,
			d.razao_social as empresa,
			d.vencimento_contrato,
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
		ORDER BY veiculos.veiculo_id DESC
		`
//WHERE indicador_idade < 2004 OR placa = 'DDD-4444'
//ORDER BY veiculos.veiculo_id DESC LIMIT 50

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

const acessibilidade = `SELECT * FROM acessibilidade`
const equipamentos = `SELECT * FROM equipamentos`
const seguradoras = `SELECT * FROM seguradora`
const empresasLaudo = `SELECT * from empresa_laudo`

const laudos = `
SELECT laudos.*,
	emp.empresa as empresa_laudo
FROM laudos
LEFT JOIN empresa_laudo emp
	ON emp.id = laudos.empresa_id
`
//WHERE laudos.veiculo_id = 4464

const seguros = `
SELECT seguros.*,
		s.seguradora,
		array_to_json(array_agg(v.veiculo_id)) veiculos,
		array_to_json(array_agg(v.placa)) placas,
		d.razao_social empresa,
		cardinality(array_remove(array_agg(v.placa), null)) as segurados
FROM seguros
LEFT JOIN veiculos v
	ON seguros.apolice = v.apolice
LEFT JOIN empresas d
	ON d.codigo_empresa = seguros.codigo_empresa
LEFT JOIN seguradora s
	ON s.id = seguros.seguradora_id
GROUP BY seguros.apolice, d.razao_social, s.seguradora, d.codigo_empresa, seguros.id
ORDER BY seguros.vencimento ASC
		`

const socios = `
		SELECT public.socios.*,
				public.empresas.razao_social
			FROM public.socios 
		LEFT JOIN public.empresas 
			ON empresas.codigo_empresa = socios.codigo_empresa
		ORDER BY LOWER (nome_socio) ASC
		`

const procuracoes = `
		SELECT public.procuracao.*,
		d.razao_social
		FROM procuracao
		LEFT JOIN empresas d
		ON d.delegatario_id = procuracao.delegatario_id
		ORDER BY vencimento DESC      
		`

const procuradores = `
	SELECT * FROM public.procurador
	ORDER BY LOWER (procurador.nome_procurador) ASC
	`

const lookup = (req, res) => {
	const { table } = req.params
	if (table)
		pool.query(`SELECT * FROM ${table}`, (err, table) => {
			if (err) res.send(err)
			else if (table.rows && table.rows.length === 0) { res.send(table.rows); return }
			res.json(table.rows)
		})
}


module.exports = {
	empresas, veiculos, modeloChassi, carrocerias, equipamentos,
	seguradoras, seguros, socios, procuradores, procuracoes, lookup, laudos, empresasLaudo, acessibilidade
}