import React from 'react'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'


const CustomButton2 = (
    {
        size = 'small',
        variant = 'contained',
        color = 'primary',
        style = {},
        label = 'add a label',
        iconName,
        onClick
    }) => {

    return (
        <Button
            size={size}
            variant={variant}
            color={color}
            style={{ marginTop: '1rem', ...style }}
            onClick={onClick}
        >
            {
                iconName &&
                <Icon>
                    {iconName}
                </Icon>
            }
            <span style={{ margin: '0.1rem 0 0 0.4rem' }}>
                {label}
            </span>
        </Button>
    )
}

export default CustomButton2
