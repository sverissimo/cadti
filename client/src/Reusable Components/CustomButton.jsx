import React from 'react'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save';

const CustomButton = props => {
    const { action, onClick, disabled } = props
    let
        icon = () => null,
        label = ''

    if (action === 'save') {
        icon = () => <SaveIcon />
        label = 'Salvar'
    }

    return (
        <Button
            size="small"
            color='primary'
            className='saveButton'
            variant="contained"
            onClick={() => onClick()}
            disabled={disabled}
        >
            {label} <span>&nbsp;&nbsp; </span> {icon()}
        </Button>
    )
}

export default CustomButton