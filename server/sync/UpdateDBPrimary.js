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

const getVehicleFK =
    `
    UPDATE veiculos
        SET delegatario_id = e.delegatario_id
        FROM empresas e
        WHERE veiculos.delegatario = e.razao_social;

        UPDATE veiculos
        SET compartilhado_id = e.delegatario_id
        FROM empresas e
        WHERE veiculos.delegatario_compartilhado LIKE '%' || e.razao_social || '%';

    UPDATE veiculos
        SET modelo_chassi_id = m.id
        FROM modelo_chassi m
        WHERE veiculos.modelo_chassi = m.modelo_chassi;

    UPDATE veiculos
        SET modelo_carroceria_id = m.id
        FROM modelo_carroceria m
        WHERE veiculos.modelo_carroceria = m.modelo;    
    
    ALTER TABLE veiculos
        DROP IF EXISTS delegatario,
        DROP IF EXISTS delegatario_compartilhado,
        DROP IF EXISTS modelo_chassi,
        DROP IF EXISTS modelo_carroceria;
        `

module.exports = { updateEmpresasPK, getVehicleFK }


