import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import HomeTemplate from './HomeTemplate'

import VeiculosHome from './Veiculos/VeiculosHome'
import CadVeiculos from './Veiculos/CadVeiculo'
import AltDados from './Veiculos/AltDados'
import Seguros from './Veiculos/Seguros'
import Laudos from './Veiculos/Laudos'
import BaixaVeiculo from './Veiculos/BaixaVeiculo'
import Config from './Veiculos/Config'

import Consultas from './Consultas/Consultas'
import Empresas from './Empresas/EmpresasContainer'
import EmpresasHome from './Empresas/EmpresasHome'
import { Procuracoes } from './Empresas/Procuracoes'
import Socios from './Empresas/Socios'
import Relatorios from './Relatorios/Relatorios'
import Solicitacoes from './Solicitacoes/Solicitacoes'
import PdfTest from './Veiculos/Certificate'
import AltContratoTemplate from './Empresas/AltContrato/AltContratoTemplate'
import Parametros from './Parametros/Parametros'
import UserAuth from './Auth/UserAuth'
import Users from './Users/Users'
import EditAccount from './Users/EditAccount'
import Compartilhamento from './Veiculos/Compartilhamento'
import Avisos from './Avisos/Avisos'
import RelatoriosTemplate from './Relatorios/RelatoriosTemplate'

const Routes = ({ user }) => {
    return (
        <Switch>
            <Route exact path='/' component={HomeTemplate} />
            <Route path='/veiculos' exact component={VeiculosHome} />
            <Route path='/veiculos/cadastro' exact component={CadVeiculos} />
            <Route path='/veiculos/altDados' exact component={AltDados} />
            <Route path='/veiculos/seguros' exact component={Seguros} />
            <Route path='/veiculos/compartilhamento' exact component={Compartilhamento} />
            <Route path='/veiculos/laudos' exact component={Laudos} />
            <Route path='/veiculos/baixaVeiculo' exact component={BaixaVeiculo} />
            <Route path='/veiculos/config' exact component={Config} />
            <Route path='/consultas' component={Consultas} />
            <Route path='/empresas' exact component={EmpresasHome} />
            <Route path='/altContrato' exact component={AltContratoTemplate} />
            <Route path='/empresas/cadastro' component={Empresas} />
            <Route path='/empresas/socios' component={Socios} />
            <Route path='/empresas/procuracoes' component={Procuracoes} />
            <Route path='/relatorios' component={RelatoriosTemplate} />
            <Route path='/crv' component={PdfTest} />
            <Route path='/solicitacoes' exact component={Solicitacoes} />
            <Route path='/solicitacoes/cadastro' exact component={CadVeiculos} />
            <Route path='/solicitacoes/altDados' exact component={AltDados} />
            <Route path='/solicitacoes/seguros' exact component={Seguros} />
            <Route path='/solicitacoes/compartilhamento' exact component={Compartilhamento} />
            <Route path='/solicitacoes/baixaVeiculo' exact component={BaixaVeiculo} />
            <Route path='/solicitacoes/laudos' exact component={Laudos} />
            <Route path='/solicitacoes/altContrato' exact component={AltContratoTemplate} />
            <Route path='/solicitacoes/socios' exact component={Socios} />
            <Route path='/solicitacoes/procuracoes' exact component={Procuracoes} />
            <Route path='/userAuth' exact component={UserAuth} />
            <Route path='/editAccount' exact component={EditAccount} />
            <Route path='/avisos' exact component={Avisos} />

            <Route path='/parametros'>
                {user.role === 'admin' ? <Parametros /> : <Redirect to='/' />}
            </Route>
            <Route path='/users'>
                {user.role === 'admin' ? <Users /> : <Redirect to='/' />}
            </Route>
        </Switch>
    )
}

export default Routes
