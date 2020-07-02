import React from 'react'
import moment from 'moment'

import Table from '../Reusable Components/Table'
import solicitacaoTable from '../Forms/solicitacaoTable'
import ClosePopUpButton from '../Reusable Components/ClosePopUpButton'

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button'

export default function SolHistory({ solicitacao, showInfo, historyLog, setHistoryLog, close, vehicleDocs, showFiles, setShowFiles, filesIds }) {

    const
        { history } = solicitacao,
        date = moment(historyLog?.createdAt).format('DD/MM/YYYY, HH:mm[h]')

    return (
        <main className="popUpWindow" sytle={{ width: '90%' }}>
            {!historyLog ?
                <Table
                    tableData={history}
                    staticFields={solicitacaoTable}
                    length={solicitacaoTable.length}
                    title={`Solicitação nº ${solicitacao?.numero}`}
                    id={solicitacao.id}
                    showInfo={showInfo}
                    style={{ padding: '9px 4px' }}
                    tableStyle={{ marginTop: '23px' }}
                    vehicleDocs={vehicleDocs}
                    showFiles={showFiles}
                    setShowFiles={setShowFiles}
                    close={close}
                    filesIds={filesIds}
                />
                :
                <>
                    <header className='infoLogHeader'>
                        <h3>Informações adicionais</h3>
                        <hr />
                        <div className='floatRight'>Inserido por {historyLog?.user} {date ? 'às ' + date : ''}</div>
                    </header>
                    <section>

                        <br /><br /><br />
                        <div>{historyLog.info}</div>
                    </section>
                    <footer>
                        <div className='voltarDiv' style={{
                            padding: '0px',
                            margin: '30px 0 0 0',
                            position: 'absolute',
                            bottom: '1%'
                        }}>
                            <Button variant='outlined' color='primary' onClick={() => setHistoryLog(false)}>
                                <ArrowBackIcon size='tiny' />
                                <span style={{ padding: '2px 0 0 2px', marginLeft: '2px', fontSize: '.85rem' }}>Voltar</span>
                            </Button>
                        </div>
                    </footer>
                </>
            }
            <ClosePopUpButton close={close} />
        </main >
    )
}