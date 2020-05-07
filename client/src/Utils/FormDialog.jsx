import React from 'react';
import DragAndDrop from '../Reusable Components/DragAndDrop'

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog({ open, close, title, header, inputNames, inputLabels, fileInputName, confirm, handleInput, handleFiles,
  values, formData, dropDisplay, type = 'text' }) {

  let disabled = true
  const errorHandler = (inputName, value) => {
    if (inputName === 'newPlate') {
      if (value.length < 9 && value.match('[a-zA-Z]{3}?[-]\\d{1}\\w{1}\\d{2}')) {
        disabled = false
        return false
      }
      else {
        disabled = true
        return true
      }
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
        {
          inputNames.map((inputName, i) => (
            <TextField
              key={i}
              autoFocus={inputName === 'newPlate' && true}
              name={inputName}
              label={inputLabels[i]}
              onChange={handleInput}
              values={values[i]}
              type={type}
              error={errorHandler(inputName, values[i])}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          ))}
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
        <Button onClick={confirm} color="primary" disabled={disabled}>
          Confirmar
              </Button>
      </DialogActions>
    </Dialog>
  )
}