import React from 'react'
import { Tabs, Tab } from '@material-ui/core'

export default ({items, tab, changeTab}) =>

    <div className='tabMenu'> 
        <Tabs value={tab}
            indicatorColor="primary"
            textColor="primary"
            centered 
            onChange={changeTab}>
            {items.map((item, i)=> <Tab key={i} label={item} />)}
        </Tabs>
    </div>


