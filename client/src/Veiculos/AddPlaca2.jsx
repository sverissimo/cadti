import React, { Fragment } from 'react'
//import { Grid, Paper, Typography, MenuItem, Checkbox, FormControlLabel, Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import AutoComplete from '../Utils/autoComplete'

const loop = [0, 1, 2]
export default function AddPlaca({ frota, plate, addPlates, setPlate }) {
    return (
        <Fragment>

            <div>
                <TextField
                    inputProps={{
                        list: 'placa',
                    }}
                    //className={classes.textField}
                    value={plate}
                    onChange={setPlate}
                    onBlur={addPlates}
                />
                <AutoComplete
                    collection={frota}
                    datalist='placa'
                    value={plate}
                />
            </div>
        </Fragment>
    )
}
