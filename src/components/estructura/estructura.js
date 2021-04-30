import React from 'react';
import EstNavBar from './est_nav';
import { Route, Switch } from 'react-router-dom';
import EstEmpresaLista from './est_empresa_lista';
import EstEmpresaDetalle from './est_empresa_editar';
import EstEmpresaNueva from './est_empresa_nueva';
import EstZonaLista from './est_zona_lista';
import EstZonaDetalle from './est_zona_editar';
import EstZonaNueva from './est_zona_nueva';
import EstSeccionLista from './est_seccion_lista';
import EstSeccionNueva from './est_seccion_nueva';
import EstSeccionDetalle from './est_seccion_editar';
import EstEquipoLista from './est_equipo_lista';
import EstEquipoDetalle from './est_equipo_editar';
import EstEquipoNuevo from './est_equipo_nuevo';

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
                
                <Route path='/estructura/secciones' component={EstSeccionLista} />
                <Route path='/estructura/seccion/nueva' exact component={EstSeccionNueva} />
                <Route path='/estructura/seccion/:id' component={EstSeccionDetalle} />

                <Route path='/estructura/equipos' component={EstEquipoLista} />
                <Route path='/estructura/equipo/nuevo' component={EstEquipoNuevo} />
                <Route path='/estructura/equipo/:id' component={EstEquipoDetalle} />
                
                <Route path='/estructura' exact>
                    <h1>Estructura</h1>
                </Route>
            </Switch>
        </React.Fragment>
    )
}

export default Estructura;