import React from 'react';
import { Switch, Route } from 'react-router-dom';
import GraficoEstado from './vel_grafico_estado';
import GraficoVelocidad from './vel_grafico_velocidad';
import HorarioSemanal from './vel_horario';

const Velocidad = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route path='/velocidad/horario' component={HorarioSemanal} />
                <Route path='/velocidad/estado/:id' component={GraficoEstado} />
                <Route path='/velocidad' component={GraficoVelocidad} />
            </Switch>
        </React.Fragment>
    )
}
export default Velocidad;