import React from 'react';
import DragAndDrop from '../Reusable Components/DragAndDrop'

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog({ open, close, title, header, inputName, inputLabel, fileInputName, confirm, handleInput, handleFiles,
  value, formData, dropDisplay, type = 'text' }) {

  const errorHandler = nPlate => {
    if (inputName === 'newPlate') {
      if (nPlate.length < 9 && nPlate.match('[a-zA-Z]{3}?[-]\\d{1}\\w{1}\\d{2}')) return false
      else return true
    }
  }
  
  return (
    <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {header}
        </DialogContentText>
        <br />
        <TextField
          autoFocus={inputName === 'newPlate' && true}
          name={inputName}
          label={inputLabel}
          onChange={handleInput}
          value={value}
          type={type}
          error={errorHandler(value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <br /><br />
        <DragAndDrop
          title='Anexar arquivo'
          name={fileInputName}
          formData={formData}
          dropDisplay={dropDisplay}
          handleFiles={handleFiles}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          Cancelar
              </Button>
        <Button onClick={confirm} color="primary" disabled={errorHandler(value)}>
          Confirmar
              </Button>
      </DialogActions>
    </Dialog>
  )
}