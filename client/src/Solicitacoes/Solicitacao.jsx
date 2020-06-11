import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

export default function Solicitacao({ solicitacao, close }) {    

    const { history } = solicitacao,

        headers = ['Movimentação', 'Usuário', 'Data', 'Justificativa', 'Arquivos']

    return (
        <main className="popUpWindow" sytle={{ width: '70%' }}>
            <header>
                <h3>Histórico da solicitação n. {solicitacao?.numero}</h3> <hr />
                <div className='flex fullWidth'>
                    {headers.map((h, i) => <span key={i}>{h}</span>)}
                </div>
            </header>

            {history.map(({ action, user, createdAt, justificativa }, i) =>
                <div className='flex fullWidth' key={i}>
                    <span> {action} </span><span>{user} </span><span>{createdAt} </span><span>{justificativa || ''}</span>
                </div>
            )}

            <ClosePopUpButton close={close} />
        </main >
    )
}
