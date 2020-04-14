import React from 'react'
import HomeTemplate from './HomeTemplate'

import VeiculosHome from './Veiculos/VeiculosHome'
import CadVeiculos from './Veiculos/CadVeiculo'
import AltVeiculos from './Veiculos/AltDados'
import AltSeguro from './Veiculos/AltSeguro'
import BaixaVeiculo from './Veiculos/BaixaVeiculo'
import Config from './Veiculos/Config'

import Consultas from './Consultas/ConsultasContainer'
import Empresas from './Empresas/EmpresasContainer'
import EmpresasHome from './Empresas/EmpresasHome'
import Procuradores from './Empresas/AltProcuradores'
import Socios from './Empresas/AltSocios'
import Relatorios from './Relatorios/Relatorios'
import { Switch, Route } from 'react-router-dom'
import UnderConstruction from './Utils/UnderConstruction'
import PdfTest from './Veiculos/Certificate'

export default () =>

    <Switch>
        <Route exact path='/' component={HomeTemplate} />
        <Route path='/veiculos' exact component={VeiculosHome} />
        <Route path='/veiculos/cadastro' exact component={CadVeiculos} />
        <Route path='/veiculos/altDados' exact component={AltVeiculos} />
        <Route path='/veiculos/altSeguro' exact component={AltSeguro} />
        <Route path='/veiculos/baixaVeiculo' exact component={BaixaVeiculo} />
        <Route path='/veiculos/config' exact component={Config} />
        <Route path='/consultas' component={Consultas} />
        <Route path='/empresas' exact component={EmpresasHome} />
        <Route path='/empresas/cadastro' component={Empresas} />
        <Route path='/empresas/socios' component={Socios} />
        <Route path='/empresas/procuradores' component={Procuradores} />
        <Route path='/relatorios' component={Relatorios} />
        <Route path='/crv' component={PdfTest} />
        <Route path='/faleConosco' component={UnderConstruction} />
    </Switch>

