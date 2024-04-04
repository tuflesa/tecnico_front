import React from 'react';
import { Route, Switch } from 'react-router-dom';
import CargasNavBar from './cargas_nav';

import CargasAgenciaLista from './cargas_agencia_lista';
import CargasAgenciaNueva from './cargas_agencia_nueva';
import CargasAgenciaDetalle from './cargas_agencia_detalle';

import CargasLista from './cargas_carga_lista';
import CargaNueva from './cargas_carga_nueva';
import CargaDetalle from './cargas_carga_detalle';
import CargaEditar from './cargas_carga_editar';
import LlamadasLista from './cargas_llamadas_lista';

const Cargas = () => {
    return (
        <React.Fragment>
            <CargasNavBar />
                <Switch>
                    <Route path='/cargas/agencias' exact component={CargasAgenciaLista} />
                    <Route path='/cargas/agencia/nueva' exact component={CargasAgenciaNueva} />
                    <Route path='/cargas/agencia/:id' component={CargasAgenciaDetalle} />

                    <Route path='/cargas' exact component ={CargasLista} />
                    <Route path='/cargas/nueva' exact component={CargaNueva} /> 
                    <Route path='/cargas/editar/:id' component={CargaEditar} />
                    <Route path='/cargas/detalle/:id' component={CargaDetalle} />
                    
                    <Route paht='/cargas/llamadas/ultimas_llamadas' exact component={LlamadasLista} />
                 </Switch>
        </React.Fragment>
    )
}

export default Cargas;