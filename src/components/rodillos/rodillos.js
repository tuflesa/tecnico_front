import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RodNavBar from './rod_nav';
import RodGruposListado from './rod_grupos_listado';

const Rodillos = () => {
    
    return (
        <React.Fragment>
            <RodNavBar />
            <Switch>
                <Route path='/rodillos/grupos' component={RodGruposListado} />
                {/* <Route path='/mantenimiento/tareas_trabajador' component={TareasTrabajador} /> */}
            </Switch>
        </React.Fragment>
    )
}
export default Rodillos;