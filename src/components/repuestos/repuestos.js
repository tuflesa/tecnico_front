import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RepNavBar from './rep_nav';
import RepLista from './rep_lista';

const Repuestos = () => {
    return (
        <React.Fragment>
            <RepNavBar />
            <Switch>
                <Route path='/repuestos' exact component={RepLista} />
                {/* <Route path='/repuesto/nuevo' exact component={RepNuevo} />
                <Route path='/repuesto/:id' component={RepDetalle} /> */}
            </Switch>
        </React.Fragment>
    )
}

export default Repuestos;