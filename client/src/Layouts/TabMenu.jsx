import React from 'react'
import { Paper, Tabs, Tab } from '@material-ui/core'

export default ({items, tab, changeTab}) =>

    <Paper style={{backgroundColor:'#e1f5fe'}}> 
        <Tabs value={tab}
            indicatorColor="primary"
            textColor="primary"
            centered 
            onChange={changeTab}>
            {items.map((item, i)=> <Tab key={i} label={item} />)}
        </Tabs>
    </Paper>


