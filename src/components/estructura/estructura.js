import React from 'react';
import EstNavBar from './est_nav';
import { Route, Switch } from 'react-router-dom';
import EstEmpresaLista from './est_empresa_lista';
import EstEmpresaDetalle from './est_empresa_editar';
import EstEmpresaNueva from './est_empresa_nueva';
import EstZonaLista from './est_zona_lista';
import EstZonaDetalle from './est_zona_editar';
import EstZonaNueva from './est_zona_nueva';

const Estructura = () => {

    return (
        <React.Fragment>
            <EstNavBar />
            <Switch>
                <Route path='/estructura/empresas' exact>
                    <EstEmpresaLista/>
                </Route>
                <Route path='/estructura/empresa/nueva' exact component={EstEmpresaNueva} />
                <Route path='/estructura/empresa/:id' component={EstEmpresaDetalle} />

                <Route path='/estructura/zonas' component={EstZonaLista} />
                <Route path='/estructura/zona/nueva' exact component={EstZonaNueva} />
                <Route path='/estructura/zona/:id' component={EstZonaDetalle} />
                
                
                <Route path='/estructura' exact>
                    <h1>Estructura</h1>
                </Route>
            </Switch>
        </React.Fragment>
    )
}

export default Estructura;