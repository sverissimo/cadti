import React from 'react'
import { FormControlLabel, Checkbox } from '@material-ui/core'

export default function AddEquipa({ data, equipamentos, handleCheck }) {

    return <div className="row">
        {
            equipamentos.map((eq, i) =>
                <FormControlLabel
                    key={i}
                    control={
                        <Checkbox
                            checked={data[eq.item]}
                            value={eq.item}
                            onChange={() => handleCheck(eq.item)} />
                    }
                    label={eq.item}
                />
            )
        }
    </div>
}
