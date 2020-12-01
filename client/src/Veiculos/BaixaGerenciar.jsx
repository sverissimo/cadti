import React from 'react'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search';
import CustomButton from '../Reusable Components/CustomButton';
import dischargedForm from '../Forms/dischargedForm';

const BaixaGerenciar = ({ data, handleInput, searchDischarged }) => {
    const { placaBaixada, dischargedFound, notFound } = data

    return (
        <>
            <div className='flex center paper'>
                <form onSubmit={searchDischarged}>
                    <TextField
                        type="text"
                        name='placaBaixada'
                        label='Informe a placa do veículo'
                        value={placaBaixada || ''}
                        onChange={handleInput}
                        placeholder='Digite a placa'
                        InputLabelProps={{ style: { fontSize: '0.7rem' } }}
                        InputProps={{ style: { width: '250px', marginRight: '10px', fontSize: '0.9rem', textAlign: 'center' } }}
                    />
                </form>
                <span
                    action='search'
                    onClick={searchDischarged}
                    style={{ marginTop: '18px' }}
                >
                    <SearchIcon />
                </span>
                {
                    dischargedFound &&
                    <>
                        <section className='dischargedContainer'>
                            {
                                dischargedForm.map(({ label }, i) =>
                                    <TextField
                                        label={label}
                                        key={i}
                                        value={dischargedFound[label]}
                                        disabled={true}
                                        InputLabelProps={{ style: { fontSize: '0.7rem' }, shrink: true }}
                                        InputProps={{ style: { width: '250px', margin: '8px 10px 0 0', fontSize: '0.7rem', color: '#444' } }}
                                    />
                                )
                            }
                        </section>
                        <footer className='reactivate'>
                            <CustomButton
                                action='save'
                                label='Reativar'
                            />
                        </footer>
                    </>
                }
            </div>
            {
                notFound &&
                <h3>Veículo não encontrado.</h3>
            }
        </>
    )
}

export default BaixaGerenciar
