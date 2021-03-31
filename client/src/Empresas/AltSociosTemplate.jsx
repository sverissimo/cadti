import React, { Fragment } from 'react'

import FormSubtiltle from '../Reusable Components/FormSubtiltle'

import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import { sociosForm } from '../Forms/sociosForm'
import TextInput from '../Reusable Components/TextInput'
import { errorHandler, helper } from '../Utils/checkInputErrors';

const useStyles = makeStyles(theme => ({
    list: {
        margin: theme.spacing(1),
        width: 180,
        fontSize: '0.7rem',
        fontColor: '#999',
        textAlign: 'center',
    },
    iconButton: {
        marginTop: '17px',
        padding: '6px 0px'
    }
}))

export default function ({ handleInput, handleBlur, data, addSocio, enableEdit, handleEdit, removeSocio }) {

    const
        { selectedEmpresa, subtitles, activeStep, filteredSocios } = data,
        classes = useStyles(), { iconButton, list } = classes

    return (
        <>
            {
                selectedEmpresa &&
                <section className="flex paper">
                    <FormSubtiltle subtitle={subtitles[activeStep]} />
                    <div className="flex center">
                        <div style={{ padding: '10px 0', width: '100%' }}>
                            <TextInput
                                form={sociosForm}
                                data={data}
                                handleBlur={handleBlur}
                                handleInput={handleInput}
                            />
                        </div>
                        <div style={{ margin: '5px 0 7px 84.58%', width: '100%' }}>
                            <Button color='primary' variant='outlined' size='small' onClick={addSocio}>
                                <AddIcon /> Adicionar sócio
                            </Button>
                        </div>
                    </div>
                </section>
            }

            {
                selectedEmpresa && filteredSocios.length === 0 &&
                <section>
                    <p>
                        Nenhum sócio cadastrado para {selectedEmpresa.razaoSocial}
                    </p>
                </section>
            }
            {
                filteredSocios?.length > 0 &&
                <>
                    <section className="flex center paper">
                        <p > Sócios cadastrados</p>
                        {filteredSocios.map((s, i) =>
                            <div key={i}>
                                {sociosForm.map((e, k) =>
                                    <Fragment key={k + 1000}>
                                        <TextField
                                            value={s[e.field] || ''}
                                            name={e.field}
                                            label={e.label}
                                            className={list}
                                            disabled={s.edit && e.field !== 'cpfSocio' ? false : true}
                                            onChange={handleEdit}
                                            error={s.edit ? errorHandler(s[e.field], e) : null}
                                            helperText={s.edit ? helper(s[e.field], e) : null}
                                            type={e?.type}
                                            InputLabelProps={
                                                {
                                                    shrink: true,
                                                    style: {
                                                        fontWeight: 600,
                                                        fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
                                                        color: '#888'
                                                    }
                                                }}
                                            inputProps={{
                                                style: {
                                                    fontSize: '13px',
                                                    color: s.edit === true ? '#000'
                                                        : s.status === 'new' || s.outsider ? 'green'
                                                            : s.status === 'modified' ? '#FF2500'
                                                                : s.status === 'deleted' ? 'red'
                                                                    : '#888',
                                                    textDecoration: s.status === 'deleted' && !s.edit ? 'line-through' : ''
                                                }
                                            }}
                                        />
                                    </Fragment>
                                )}
                                <Button
                                    disabled={s.status === 'deleted'}
                                    component='span'
                                    className={iconButton}
                                    title='editar'
                                    onClick={() => enableEdit(i)}
                                >
                                    <EditIcon />
                                </Button>

                                <Button className={iconButton}
                                    color={s.status === 'deleted' ? 'primary' : 'secondary'}
                                    title={s.status === 'deleted' ? 'Desfazer exclusão' : 'Remover'}
                                    onClick={() => removeSocio(i)}>
                                    {s.status === 'deleted' ? <i className='material-icons'>undo</i> : <DeleteIcon />}
                                </Button>
                            </div>
                        )}
                    </section>
                </>
            }
        </>
    )
}