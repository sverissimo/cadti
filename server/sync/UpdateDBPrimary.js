const updateEmpresasPK = `
alter table empresas
drop constraint empresas_pkey;

UPDATE public.empresas 
SET delegatario_id = d.delegatario_id
FROM public.delegatario d
WHERE empresas.old_id = d.old_id;

alter table empresas add primary key (delegatario_id);

SELECT setval('empresas_delegatario_id_seq', max(delegatario_id) ) FROM empresas;
`

module.exports = { updateEmpresasPK }
