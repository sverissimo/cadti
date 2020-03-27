import React from 'react';

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function ConfigAddDialog({ open, close, title, marca, marcas, selectMarca, newElement, handleInput, addNewElement }) {

    return (
        <div>
            <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Adicionar {title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Para adicionar, insira o nome no campo abaixo e clique em "Confirmar".
                    </DialogContentText>
                    <div className="editFields">
                        {marcas && <div className="configMarca">
                            <TextField
                                onChange={selectMarca}
                                value={marca}
                                label='Selecione uma marca'
                                select={true}
                                InputLabelProps={{ shrink: true }}
                                SelectProps={{
                                    style: {
                                        fontSize: '0.9rem', color: '#555', fontWeight: 400,
                                        width: 325, height: '44px'
                                    }
                                }}
                            >
                                {marcas.map(({ marca }, i) =>
                                    <MenuItem key={i} value={marca} >
                                        {marca}
                                    </MenuItem>
                                )}
                            </TextField>
                        </div>}
                        <div className="configField">
                            <TextField
                                autoFocus
                                margin="dense"
                                name='newElement'
                                label="Inserir"
                                type="text"
                                onChange={handleInput}
                                value={newElement}
                                fullWidth
                            />
                        </div>


                    </div>

                    <br /><br /><br />

                </DialogContent>
                <DialogActions>
                    <Button onClick={close} color="primary">
                        Cancelar
              </Button>
                    <Button onClick={() => addNewElement()} color="primary">
                        Confirmar
              </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}