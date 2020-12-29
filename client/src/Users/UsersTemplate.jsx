import React from 'react'
import MaterialTable from 'material-table';
import userTable from './userTable';
import exportToXlsx from '../Consultas/exportToXlsx';

export default function ({ collection, showDetails, del, setData }) {

    if (!Array.isArray(collection)) collection = []
    collection = collection.map(obj => ({ ...obj }))

    return (
        <div style={{ margin: '10px 0' }} className='noPrint'>
            <MaterialTable
                title={`Gerenciar dados de usuários`}
                columns={userTable}
                data={collection}
                style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}
                options={{
                    filtering: true,
                    exportButton: true,
                    exportFileName: 'Usuários',
                    /*  exportCsv: (columns, data) => {
                         exportToXlsx(subject, tab, userTable, data)
                     }, */
                    actionsColumnIndex: -1,
                    searchFieldStyle: { color: '#024', fontSize: '14px' },
                    headerStyle: { backgroundColor: '#FAFAFC' },
                    emptyRowsWhenPaging: false,
                    pageSize: 20,
                    rowStyle: {
                        fontSize: '0.5rem',
                    }
                }}

                localization={{
                    header: { actions: 'Opções' },
                    body: {
                        emptyDataSourceMessage: 'Registro não encontrado.',
                        editRow: { deleteText: 'Tem certeza que deseja apagar esse registro ?' },
                        deleteTooltip: 'Apagar',
                        filterRow: { filterTooltip: 'Filtrar' }
                    },
                    toolbar: {
                        searchTooltip: 'Procurar',
                        searchPlaceholder: 'Procurar',
                        exportName: 'Salvar como arquivo do excel',
                        exportAriaLabel: 'Exportar',
                        exportTitle: 'Exportar'
                    },
                    pagination: {

                        labelRowsSelect: 'Resultados por página',
                        labelDisplayedRows: ' {from}-{to} a {count}',
                        firstTooltip: 'Primeira página',
                        previousTooltip: 'Página anterior',
                        nextTooltip: 'Próxima Página',
                        lastTooltip: 'Última Página',

                    }
                }}
                actions={[
                    {
                        icon: 'info',
                        iconProps: { color: 'primary' },
                        tooltip: 'Mais informações',
                        onClick: (event, rowData) => showDetails(event, rowData)
                    }
                ]}
                editable={{
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                setData([...collection, newData]);

                                resolve();
                            }, 1000)
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataUpdate = [...collection];
                                const index = oldData.tableData.id;
                                dataUpdate[index] = newData;
                                setData([...dataUpdate]);

                                resolve();
                            }, 1000)
                        }),
                    //isEditable: rowData => rowData.name === 'role', // only name(a) rows would be editable
                    onRowDelete: async oldData => await del(oldData)
                }}
            />
        </div>
    )
}