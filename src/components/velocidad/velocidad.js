import React from 'react';
import { Switch, Route } from 'react-router-dom';
import GraficoEstado from './vel_grafico_estado';
import GraficoVelocidad from './vel_grafico_velocidad';

const Velocidad = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/velocidad/estado' component={GraficoEstado} />
                <Route path='/velocidad' component={GraficoVelocidad} />
            </Switch>
        </React.Fragment>
    )
}
export default Velocidad;