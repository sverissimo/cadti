import React from 'react';
import clsx from 'clsx';
//import { ErrorIcon, InfoIcon, Close, WarningIcon } from '@material-ui/icons/';
import { amber, green } from '@material-ui/core/colors';
import { Snackbar, SnackbarContent, Icon } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

const useStyles1 = makeStyles(theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.main,
    },
    warning: {
        backgroundColor: amber[700],
    },
    message: {
        display: 'flex',
        alignItems: 'center'
    },
}));

function MySnackbarContentWrapper(props) {
    const classes = useStyles1();
    const { className, message, onClose, variant, ...other } = props;

    return (
        <SnackbarContent
            className={clsx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                message &&
                <span id="client-snackbar" className={classes.message}>
                    <Icon>{props.variant === 'error' ?
                        'close' :
                        props.variant === 'warning' ?
                            'error_outlined' :
                            'check'}</Icon>    {message}
                </span>
            }
            {...other}
        />
    );
}

export default function CustomizedSnackbars(props) {

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={props.open}
                autoHideDuration={1500}
                onClose={props.close}
            >
                <MySnackbarContentWrapper
                    variant={props.status || "success"}
                    message={props.msg}
                />
            </Snackbar>
        </div>
    );
}