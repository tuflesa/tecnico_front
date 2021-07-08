import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RepNavBar from './rep_nav';
import RepLista from './rep_lista';
import RepNuevo from './rep_nuevo';
import RepDetalle from './rep_editar';

const Repuestos = () => {
    
    return (
        <React.Fragment>
            <RepNavBar />
            <Switch>
                <Route path='/repuestos' exact component={RepLista} />
                <Route path='/repuestos/nuevo' component={RepNuevo} />
                <Route path='/repuestos/:id' component={RepDetalle} />
            </Switch>
        </React.Fragment>
    )
}

export default Repuestos;