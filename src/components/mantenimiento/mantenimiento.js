import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ManNavBar from './man_nav';
import ManTarea from './man_list_tarea';


const Mantenimiento = () => {
    
    return (
        <React.Fragment>
            <ManNavBar />
            <Switch>
                <Route path='/mantenimiento/tareas' exact component={ManTarea}/>
            </Switch>
        </React.Fragment>
    )
}

export default Mantenimiento;