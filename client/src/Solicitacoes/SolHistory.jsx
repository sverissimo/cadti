import React from 'react'
import Table from '../Reusable Components/Table'
import solicitacaoTable from '../Forms/solicitacaoTable'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

export default function SolHistory({ solicitacao, showInfo, info, close }) {

    const { history } = solicitacao

    //    headers = ['Movimentação', 'Usuário', 'Data', 'Justificativa', 'Arquivos']
    console.log(info)

    return (
        <main className="popUpWindow" sytle={{ width: '90%' }}>
            {true &&
                <Table
                    tableData={history}
                    staticFields={solicitacaoTable}
                    length={solicitacaoTable.length}
                    title={`Solicitação nº ${solicitacao?.numero}`}
                    id={solicitacao.id}
                    showInfo={showInfo}
                    info={info}
                    style={{ padding: '9px 4px' }}
                    tableStyle={{ marginTop: '23px' }}
                />
            }

            <ClosePopUpButton close={close} />
        </main >
    )
}