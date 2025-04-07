import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ManNavBar from './man_nav';
import ManLineaDetalle from './man_linea_tarea_editar';
import ManListaPartes from './man_partes_lista';
import ManParteDetalle from './man_parte_editar';
import ManParteNuevo from './man_parte_nuevo';
import ManLineasListado from './man_lineas_lista';
import ManPorEquipos from './man_equipo';
import ManNotificacionesNuevas from './man_notificaciones_nuevas';
import ManNotificacionesLista from './man_notificaciones_lista';
import ManNotificacionDetalle from './man_notificacion_editar';
import ManPendientes from './man_pendientes';
import ManParteDetalleOp from './man_parte_editar_op';
import TareasTrabajador from './man_tareas_trabajador';
import ManProgramadores from './man_programadores';

const Mantenimiento = () => {
    const [user] = useCookies(['tec-user']);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Técnico'&&user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?true:false;
    
    return (
        <React.Fragment>
            <ManNavBar />
            <Switch>
                <Route path='/mantenimiento/programadores' component={ManProgramadores} />
                <Route path='/mantenimiento/parte_op/:id' component={ManParteDetalleOp} />
                <Route path='/mantenimiento/tareas_trabajador' component={TareasTrabajador} />
                <Route path='/mantenimiento/linea_tarea/:id' component={ManLineaDetalle} /> 
                <Route path='/mantenimiento/parte/nuevo' component={ManParteNuevo} /> 
                <Route path='/mantenimiento/notificaciones' component={ManNotificacionesLista} />                  
                <Route path='/mantenimiento/notificacion/nueva' component={ManNotificacionesNuevas} />   
                <Route path='/mantenimiento/notificacion/:id' component={ManNotificacionDetalle} />                                         
                <Route path='/mantenimiento/partes' component={ManListaPartes} /> 
                <Route path='/mantenimiento/parte/:id' component={ManParteDetalle} />
                <Route path='/mantenimiento/listado_tareas' component={ManLineasListado} /> 
                <Route path='/mantenimiento/listado_tarea' component={ManPorEquipos} /> 
                {!nosoyTecnico?<Route path='/mantenimiento/' component={ManPendientes} /> : <Route path='/mantenimiento/' component={ManPorEquipos} /> }
            </Switch>
        </React.Fragment>
    )
}
export default Mantenimiento;