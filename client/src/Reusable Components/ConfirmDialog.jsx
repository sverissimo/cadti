import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Fragment } from 'react';

export default function ConfirmDialog({ open, type, close, confirm, element, id, index, customTitle = '', customMessage = '' }) {

    let title, message
    if (type === 'delete') {
        title = 'Confirmar exclusão'
        message = 'Tem certeza que deseja excluir esse registro?'
        if (element) message = message.replace('?', ': ')
    }
    if (type === 'deactivateEmpresa') {
        title = 'Desativar empresa'
        message = `Tem certeza que deseja desativar a empresa `
    }

    if (title && message) return (
        <div>
            <Dialog
                open={open}
                onClose={close}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {element ?
                            <Fragment>
                                {message}<strong>  {element}    </strong>?
                            </Fragment>
                            : message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close} autoFocus> Cancelar </Button>
                    <Button onClick={() => confirm(id || index)} color="primary"> Confirmar </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
    else return null
}
