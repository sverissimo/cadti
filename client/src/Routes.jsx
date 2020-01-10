import React from 'react'
import HomeTemplate from './HomeTemplate'
import Veiculos from './Veiculos/veiculosContainer'
import VeiculosHome from './Veiculos/VeiculosHome'
import Consultas from './Consultas/consultasContainer'
import Empresas from './Empresas/EmpresasContainer'
import EmpresasHome from './Empresas/EmpresasHome'
import Procuradores from './Empresas/AltProcuradores'
import Socios from './Empresas/AltSocios'
import { Switch, Route } from 'react-router-dom'
import UnderConstruction from './Utils/UnderConstruction'

export default props =>
    
    <Switch>
        <Route exact path='/' component={HomeTemplate} />
        <Route path='/certidoes' component = {UnderConstruction} />
        <Route path='/veiculos' exact component = {VeiculosHome} />
        <Route path='/veiculos/cadastro' component = {Veiculos} />
        <Route path='/consultas' component = {Consultas} />
        <Route path='/empresas' component = {Empresas} />     
        <Route path='/empresasHome' component = {EmpresasHome} />
        <Route path='/socios' component = {Socios} />     
        <Route path='/procuradores' component = {Procuradores} />     
        <Route path='/faleConosco' component = {UnderConstruction} />
    </Switch>

