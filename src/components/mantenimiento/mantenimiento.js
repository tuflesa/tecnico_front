import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ManNavBar from './man_nav';
import NotificacionesLista from './man_notificaciones_lista';
import NotificacionNueva from './man_notificacion_nueva';

const Mantenimiento = () => {
    
    return (
        <React.Fragment>
            <ManNavBar />
            <Switch>
                <Route path='/mantenimiento' exact component={NotificacionesLista} />
                <Route path='/mantenimiento/notificaciones' component={NotificacionesLista} />
                <Route path='/mantenimiento/notificacion/nueva' component={NotificacionNueva} />
            </Switch>
        </React.Fragment>
    )
}

export default Mantenimiento;