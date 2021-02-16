import React from 'react'
import MaterialTable from 'material-table';
import userTable from './userTable';
import exportToXlsx from '../Consultas/exportToXlsx';

export default function ({ collection, showDetails, addUser, editUser, deleteUser }) {

    if (!Array.isArray(collection)) collection = []
    //collection = collection.map(obj => ({ ...obj }))
    collection = Array.from(collection).sort((a, b) => a.name.localeCompare(b.name))

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
                    exportCsv: (columns, data) => {
                        exportToXlsx('Usuários', userTable, data)
                    },
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
                        addTooltip: 'Adicionar novo usuário',
                        editTooltip: 'Editar',
                        filterRow: { filterTooltip: 'Filtrar' }
                    },
                    toolbar: {
                        searchTooltip: 'Procurar',
                        searchPlaceholder: 'Procurar',
                        exportCSVName: 'Salvar como arquivo do excel',
                        exportAriaLabel: 'Exportar',
                        exportTitle: 'Exportar para xlsx',
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
                /* actions={[
                    {
                        icon: 'delete',
                        onClick: (event, rowData) => {
                            deleteUser(event, rowData)
                        }
                    }
                ]} */
                editable={{
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                addUser(newData)
                                resolve()
                            }, 1000)
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataUpdate = [...collection];
                                const index = oldData.tableData.id;
                                dataUpdate[index] = newData;
                                editUser(newData);
                                resolve();
                            }, 500)
                        }),
                    //isEditable: rowData => rowData.name === 'role', // only name(a) rows would be editable
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                deleteUser(oldData)

                                resolve();
                            }, 1000);
                        })
                }}
            />
        </div>
    )
}