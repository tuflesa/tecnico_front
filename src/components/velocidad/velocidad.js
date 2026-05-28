import React from 'react';
import { Switch, Route } from 'react-router-dom';
import GraficoEstado from './vel_grafico_estado';
import GraficoVelocidad from './vel_grafico_velocidad';
import HorarioSemanal from './vel_horario';
import Dashboard from '../dashboard/dashboard';
import VelNavBar from './vel_nav';
import OEE from '../dashboard/dashboard_OEE';
import Cambios from '../dashboard/dashboard_cambios';
import Paradas from '../dashboard/dashboard_paradas';

const Velocidad = () => {
    return (
        <React.Fragment>
            <VelNavBar />
            <Switch>
                <Route path='/velocidad/horario' component={HorarioSemanal} />
                <Route path='/velocidad/estado/:id' component={GraficoEstado} />
                <Route path='/velocidad/dashboard' component={Dashboard} />
                <Route path='/velocidad/oee' component={OEE} />
                <Route path='/velocidad/cambios' component={Cambios} />
                <Route path='/velocidad/paradas' component={Paradas} />
                <Route path='/velocidad' component={GraficoVelocidad} />
            </Switch>
        </React.Fragment>
    )
}
export default Velocidad;