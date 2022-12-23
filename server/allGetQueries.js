//@ts-check
const veiculos = (condition = '') => `
        SELECT veiculos.*,
            (extract(year from current_date) - ano_carroceria) as indicador_idade,
            marca_chassi.marca as marca_chassi,
            modelo_chassi.modelo_chassi,
            modelo_chassi.cmt,
            marca_carroceria.marca as marca_carroceria,
            modelo_carroceria.modelo as modelo_carroceria,
            empresas.razao_social as empresa,
            d2.razao_social as compartilhado,
            seguradoras.seguradora,
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
        LEFT JOIN public.empresas
            ON veiculos.codigo_empresa = empresas.codigo_empresa
        LEFT JOIN public.empresas d2
            ON veiculos.compartilhado_id = d2.codigo_empresa
        LEFT JOIN public.seguros
            ON veiculos.apolice = seguros.apolice
        LEFT JOIN public.seguradoras
            ON public.seguradoras.id = seguros.seguradora_id
        ${condition}
        ORDER BY veiculos.veiculo_id DESC
    `

const seguros = (condition = '') => `
        SELECT seguros.*,
                s.seguradora,
                array_to_json(array_agg(v.veiculo_id)) veiculos,
                array_to_json(array_agg(v.placa)) placas,
                empresas.razao_social empresa,
                cardinality(array_remove(array_agg(v.placa), null)) as segurados
        FROM seguros
        LEFT JOIN veiculos v
            ON seguros.apolice = v.apolice
        LEFT JOIN empresas
            ON empresas.codigo_empresa = seguros.codigo_empresa
        LEFT JOIN seguradoras s
            ON s.id = seguros.seguradora_id
            ${condition}
        GROUP BY seguros.apolice, empresas.razao_social, s.seguradora, empresas.codigo_empresa, seguros.id
        ORDER BY seguros.vencimento ASC
        `

const socios = (condition = '') => `
        SELECT public.socios.*, public.empresas.razao_social
            FROM public.socios
        LEFT JOIN public.empresas
            ON empresas.codigo_empresa = socios.codigo_empresa OR socios.empresas like '%' || empresas.codigo_empresa || '%'
        ${condition}
        ORDER BY nome_socio ASC
        `

const empresas = (condition = '') => `
        SELECT empresas.*,
            cardinality (array_remove(array_agg(v.veiculo_id), null)) frota
        FROM public.empresas
        LEFT JOIN veiculos v
            ON v.codigo_empresa = empresas.codigo_empresa
        ${condition}
        GROUP BY empresas.codigo_empresa
        ORDER BY frota DESC
        --ORDER BY codigo_empresa DESC
        `

const compartilhados = (condition = 'WHERE situacao != \'Desativada\'') => `
        SELECT empresas.codigo_empresa, empresas.razao_social
        FROM public.empresas
        WHERE situacao != \'Desativada\'
        `

const procuradores = (condition = '') => `
        SELECT * FROM public.procuradores
        ${condition}
        order by procuradores.procurador_id desc
        `
const procuracoes = (condition = '') => `
		SELECT public.procuracoes.*,
		empresas.razao_social
		FROM procuracoes
		LEFT JOIN empresas
		ON empresas.codigo_empresa = procuracoes.codigo_empresa
		${condition}
        ORDER BY vencimento DESC
		`

const seguradoras = (condition = '') => `
        SELECT * FROM public.seguradoras
        ${condition}
        order by seguradoras.seguradora asc
        `

const modeloChassi = (condition = '') => `
        SELECT modelo_chassi.*,
            public.marca_chassi.marca as marca
        FROM modelo_chassi
        LEFT JOIN marca_chassi
            ON public.marca_chassi.id = public.modelo_chassi.marca_id
        ${condition}
		`

const carrocerias = (condition = '') => `
		SELECT modelo_carroceria.id, modelo_carroceria.modelo,
			public.marca_carroceria.marca as marca
		FROM modelo_carroceria
		LEFT JOIN marca_carroceria
			ON public.marca_carroceria.id = public.modelo_carroceria.marca_id
        ${condition}
		`

const laudos = (condition = '') => `
    SELECT laudos.*,
        emp.empresa as empresa_laudo,
		empresas.razao_social razao_social,
		v.placa placa
    FROM laudos
    LEFT JOIN empresa_laudo emp
        ON emp.id = laudos.empresa_id
	LEFT JOIN empresas
		ON empresas.codigo_empresa = laudos.codigo_empresa
	LEFT JOIN veiculos v
		ON v.veiculo_id = laudos.veiculo_id
    ${condition}
    ORDER BY validade DESC
`

const acessibilidade = (condition = '') => `SELECT * FROM acessibilidade ${condition}`
const equipamentos = (condition = '') => `SELECT * FROM equipamentos ${condition}`
const empresasLaudo = (condition = '') => `SELECT * from empresa_laudo ${condition} ORDER BY id ASC `


module.exports = {
    empresas, socios, procuradores, procuracoes, veiculos, seguros, laudos, empresasLaudo, compartilhados,
    acessibilidade, equipamentos, seguradoras, carrocerias, modelosChassi: modeloChassi
}
