import React from 'react'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

export default function Solicitacao({ solicitacao, close }) {

    console.log(solicitacao)

    const { content } = solicitacao,

        headers = ['Usuário', 'Data', 'Justificativa', 'Arquivos']
console.log(content[0]?.justitificativa)
    return (
        <main className="popUpWindow">
            <header>
                <h3>Whaaa??</h3> <hr />
                <div className='flex fullWidth'>
                    {headers.map(h => <span>{h}</span>)}
                </div>
            </header>

            {content.map(({ user, createdAt, justificativa }, i) =>
                <div className='flex' key={i}>
                    {user} {createdAt} {justificativa || ''}
                </div>
            )}

            <ClosePopUpButton close={close} />
        </main >
    )
}
