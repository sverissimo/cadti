const empresas = ` 
SELECT * FROM public.delegatario 
ORDER BY "razao_social" 
`

const veiculoInit = `
SELECT public.veiculo.*,    
    public.delegatario.razao_social as empresa,
	public.modelo_chassi.marca_chassi as marca
FROM veiculo
LEFT JOIN public.delegatario
	ON veiculo.delegatario_id = public.delegatario.delegatario_id
LEFT JOIN public.modelo_chassi
	ON veiculo.modelochassi_id = public.modelo_chassi.modelo_chassi
ORDER BY veiculo_id DESC
`

module.exports = { empresas, veiculoInit }