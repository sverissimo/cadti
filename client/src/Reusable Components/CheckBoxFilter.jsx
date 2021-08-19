import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default function CheckBoxFilter({ title, checked, toggleChecked }) {
    return (
        <>
            <FormControlLabel
                style={{ marginTop: '20px' }}
                control={
                    <Checkbox
                        checked={checked === true}
                        onChange={() => toggleChecked(!checked)}
                        value={checked}
                    />
                }
                label={
                    <p style={{ color: '#2979ff', fontSize: '0.7rem', float: 'right' }}>
                        {title}
                    </p>
                }
            />
        </>
    )
}
