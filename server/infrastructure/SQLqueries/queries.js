const { pool } = require('../../config/pgConfig')

const laudos = `
SELECT laudos.*,
	emp.empresa as empresa_laudo
FROM laudos
LEFT JOIN empresa_laudo emp
	ON emp.id = laudos.empresa_id
`

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

const lookup = (req, res) => {
	const { table } = req.params
	if (table)
		pool.query(`SELECT * FROM ${table}`, (err, table) => {
			if (err) res.send(err)
			else if (table.rows && table.rows.length === 0) { res.send(table.rows); return }
			res.json(table.rows)
		})
}


module.exports = { seguros, socios, lookup, laudos }