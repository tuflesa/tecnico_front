import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RodNavBar from './rod_nav';
import RodGruposListado from './rod_grupos_listado';
// import RodPlanos from './rod_planos';
import RodNuevo from './rod_rodillo_nuevo';
import RodTooling from './rod_tooling';
import RodGrupoNuevo from './rod_grupo_nuevo';
import RodLista from './rod_rodillo_lista';
import RodEditar from './rod_rodillo_editar';
import RodBancada from './rod_bancada_form';
import RodGrupoEditar from './rod_grupo_editar';
import RodBancadaCT from './rod_bancada_ct';
import RodBancadaCTListado from './rod_bancada_ct_listado';

const Rodillos = () => {
    
    return (
        <React.Fragment>
            <RodNavBar />
            <Switch>
                <Route path='/rodillos/lista' component={RodLista} />
                <Route path='/rodillos/bacada' component={RodBancada} />
                <Route path='/rodillos/lista_bancadas_ct' component={RodBancadaCTListado} />
                <Route path='/rodillos/bacada_ct' component={RodBancadaCT} />
                <Route path='/rodillos/tooling' component={RodTooling} />
                <Route path='/rodillos/grupos' component={RodGruposListado} />
                {/* <Route path='/rodillos/planos/nuevo' component={RodPlanos} /> */}
                <Route path='/rodillos/nuevo' component={RodNuevo} />
                <Route path='/rodillos/grupo_editar/:id' component={RodGrupoEditar} />
                <Route path='/rodillos/editar/:id' component={RodEditar} />
                <Route path='/rodillos/grupo/nuevo' component={RodGrupoNuevo} />
                {/* <Route path='/mantenimiento/tareas_trabajador' component={TareasTrabajador} /> */}
            </Switch>
        </React.Fragment>
    )
}
export default Rodillos;