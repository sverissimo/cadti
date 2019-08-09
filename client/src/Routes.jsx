import React from 'react'
import HomeTemplate from './HomeTemplate'
import Veiculos from './Veiculos/veiculosContainer'
import { Switch, Route } from 'react-router-dom'

export default props =>
    
    <Switch>
        <Route exact path='/' component={HomeTemplate} />
        <Route path='/veiculos' component = {Veiculos} />
    </Switch>
 


