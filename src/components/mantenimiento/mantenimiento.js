import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ManNavBar from './man_nav';
import ManLineaDetalle from './man_linea_tarea_editar';
import ManListaPartes from './man_partes_lista';
import ManParteDetalle from './man_parte_editar';
import ManParteNuevo from './man_parte_nuevo';
import ManLineasListado from './man_lineas_lista';
import ManPorEquipos from './man_equipo';
import ManParteNuevoMediciones from './man_parte_nuevo_mediciones';


const Mantenimiento = () => {
    
    return (
        <React.Fragment>
            <ManNavBar />
            <Switch> 
                <Route path='/mantenimiento/linea_tarea/:id' component={ManLineaDetalle} />                
                <Route path='/mantenimiento/parte/nuevo' component={ManParteNuevo} /> 
                <Route path='/mantenimiento/parte/nuevo_mediciones' component={ManParteNuevoMediciones} />              
                <Route path='/mantenimiento/partes' component={ManListaPartes} /> 
                <Route path='/mantenimiento/parte/:id' component={ManParteDetalle} />
                <Route path='/mantenimiento/listado_tareas' component={ManLineasListado} /> 
                <Route path='/mantenimiento/listado_tarea' component={ManPorEquipos} /> 
                
            </Switch>
        </React.Fragment>
    )
}

export default Mantenimiento;