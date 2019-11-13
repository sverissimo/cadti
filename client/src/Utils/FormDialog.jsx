import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const link = (id) => {
  document.getElementById(id).click()
}

export default function AlertDialog({ open, close, handleInput, handleFiles, updatePlate, newPlate }) {

  const errorHandler = nPlate => {

    if (nPlate.length < 9 && nPlate.match('[a-zA-Z]{3}?[-]\\d{1}\\w{1}\\d{2}')) return false
    else return true

  }

  return (
    <div>
      <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Alterar Placa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para alterar a placa do veículo para o padrãop Mercosul, digite a placa no campo abaixo e anexe o CRLV atualizado do veículo.
              </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name='newPlate'
            label="Nova placa"
            type="text"
            onChange={handleInput}
            value={newPlate}
            error={errorHandler(newPlate)}            
            fullWidth
          />
          <br /><br /><br />
          <TextField
            id='newPlateDoc'
            fullWidth={true}
            placeholder='Nenhum arquivo selecionado'
            onChange={handleFiles}
            onClick={() => link('newPlate')}
            disabled={true}
            label='Anexar CRLV atualizado do veículo'
            InputLabelProps={{
              shrink: true,
              style: { fontWeight: 500, color: '#3F51B5', marginBottom: '5%' }
            }}
          />
          <br /><br />
          <Button
            variant="outlined"
            component='label'
            color='primary'
          >
            Procurar
            <input
              id='newPlateDoc'
              name='newPlateDoc'
              type="file"
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            Cancelar
              </Button>
          <Button onClick={updatePlate} color="primary" disabled={errorHandler(newPlate)}>
            Confirmar
              </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}