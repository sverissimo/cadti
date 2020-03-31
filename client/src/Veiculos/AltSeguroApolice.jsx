import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog({ open, close, handleInput, updateApolice, newApolice }) {

    return (
        <div>
            <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Alterar Placa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Para alterar o número da apólice do seguro, digite o novo número e clique em confirmar. 
              </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name='newPlate'
                        label="Nova placa"
                        type="text"
                        onChange={handleInput}
                        value={newApolice}                        
                        fullWidth
                    />
                    <br /><br /><br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close} color="primary">
                        Cancelar
              </Button>
                    <Button onClick={updateApolice} color="primary" disabled={errorHandler(newPlate)}>
                        Confirmar
              </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}