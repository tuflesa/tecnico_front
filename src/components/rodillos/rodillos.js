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
import RodBancadaCT_Editar from './rod_bancada_ct_editar';
import RodMontaje from './rod_montaje';
import RodMontajeListado from './rod_montaje_listado';
import RodMontajeEditar from './rod_montaje_editar';
import RodRectificacionForm from './rod_rectificacion_form';
import RodListaRectificaciones from './rod_rectificaciones_listado';
import RodEditarRectificado from './rod_rectificar_editar';
import RodInstanciasRectificar from './rod_instancias_a_rectificar';
import RodInstanciasXaRectificar from './rod_instancias_xa_rectificar';
import RodRectificacion_TuflesaForm from './Rod_rectificacion_tuflesa_form';

const Rodillos = () => {
    
    return (
        <React.Fragment>
            <RodNavBar />
            <Switch>
                <Route path='/rodillos/montaje' component={RodMontaje} />
                <Route path='/rodillos/instancias_rectificar' component={RodInstanciasRectificar} />
                <Route path='/rodillos/instancias_xa_rectificar' component={RodInstanciasXaRectificar} />
                <Route path='/rodillos/montaje_lista' component={RodMontajeListado} />
                <Route path='/rodillos/montaje_editar/:id' component={RodMontajeEditar} />
                <Route path='/rodillos/lista' component={RodLista} />
                <Route path='/rodillos/bacada_ct_editar/:id' component={RodBancadaCT_Editar} />
                <Route path='/rodillos/bacada' component={RodBancada} />
                <Route path='/rodillos/lista_bancadas_ct' component={RodBancadaCTListado} />
                <Route path='/rodillos/bacada_ct' component={RodBancadaCT} />
                <Route path='/rodillos/tooling' component={RodTooling} /> {/* cambio la lista en vez de tooling a la de rodillos para subir proyect */}
                <Route path='/rodillos/grupos' component={RodGruposListado} />
                {/* <Route path='/rodillos/planos/nuevo' component={RodPlanos} /> */}
                <Route path='/rodillos/nuevo' component={RodNuevo} />
                <Route path='/rodillos/grupo_editar/:id' component={RodGrupoEditar} />
                <Route path='/rodillos/editar/:id' component={RodEditar} />
                <Route path='/rodillos/grupo/nuevo' component={RodGrupoNuevo} />
                <Route path='/rodillos/nueva_rectificacion' component={RodRectificacionForm} />
                <Route path='/rodillos/nueva_rectificacion_tuflesa' component={RodRectificacion_TuflesaForm} />
                <Route path='/rodillos/editar_rectificacion/:id' component={RodEditarRectificado} />
                <Route path='/rodillos/lista_rectificacion' component={RodListaRectificaciones} />
                {/* <Route path='/mantenimiento/tareas_trabajador' component={TareasTrabajador} /> */}
            </Switch>
        </React.Fragment>
    )
}
export default Rodillos;