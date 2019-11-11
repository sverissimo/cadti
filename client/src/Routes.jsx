import React from 'react'
import HomeTemplate from './HomeTemplate'
import Veiculos from './Veiculos/veiculosContainer'
import Consultas from './Consultas/consultasContainer'
import { Switch, Route } from 'react-router-dom'
import UnderConstruction from './Utils/UnderConstruction'

export default props =>
    
    <Switch>
        <Route exact path='/' component={HomeTemplate} />
        <Route path='/certidoes' component = {UnderConstruction} />
        <Route path='/veiculos' component = {Veiculos} />
        <Route path='/consultas' component = {Consultas} />
        <Route path='/delegatarios' component = {UnderConstruction} />
        <Route path='/faleConosco' component = {UnderConstruction} />
    </Switch>

