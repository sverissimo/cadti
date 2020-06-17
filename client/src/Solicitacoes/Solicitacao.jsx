import React from 'react'
import Table from '../Reusable Components/Table'
import solicitacaoTable from '../Forms/solicitacaoTable'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

export default function Solicitacao({ solicitacao, showInfo, info, close }) {

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


{/* <header>
    <h3>Histórico da solicitação n. {solicitacao?.numero}</h3> <hr />
    <div className='flex fullWidth'>
        {headers.map((h, i) => <span key={i}>{h}</span>)}
    </div>
</header>



{
    history.map(({ action, user, createdAt, justificativa }, i) =>
        <div className='flex fullWidth' key={i}>
            <span> {action} </span><span>{user} </span><span>{createdAt} </span><span>{justificativa || ''}</span>
        </div>
    )
} */}