import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ManNavBar from './man_nav';
import ManTarea from './man_tareas_lista';
import ManDetalle from './man_tarea_editar';
import ManNuevo from './man_tarea_nueva';
import ManListaPartes from './man_partes_lista';
import ManParteDetalle from './man_parte_editar';
import ManParteNuevo from './man_parte_nuevo';
import ManLineasListado from './man_lineas_lista';


const Mantenimiento = () => {
    
    return (
        <React.Fragment>
            <ManNavBar />
            <Switch>                
                <Route path='/mantenimiento/tarea/nueva' component={ManNuevo} />
                <Route path='/mantenimiento/tareas' exact component={ManTarea}/>
                <Route path='/mantenimiento/tarea/:id' component={ManDetalle} /> 
                <Route path='/mantenimiento/parte/nuevo' component={ManParteNuevo} />               
                <Route path='/mantenimiento/partes' component={ManListaPartes} /> 
                <Route path='/mantenimiento/parte/:id' component={ManParteDetalle} />
                <Route path='/mantenimiento/listado_tareas' component={ManLineasListado} /> 
            </Switch>
        </React.Fragment>
    )
}

export default Mantenimiento;