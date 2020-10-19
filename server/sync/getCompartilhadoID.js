const getCompartilhadoId =
    `
        UPDATE veiculos
        SET compartilhado_id = e.codigo_empresa
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

module.exports = getCompartilhadoId