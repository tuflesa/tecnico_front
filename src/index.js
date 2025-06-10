import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Home from './components/home';
import Estructura from './components/estructura/estructura';
import Repuestos from './components/repuestos/repuestos';
import Login from './components/login';
import Cargas from './components/cargas/cargas';
import GraficoVelocidad from './components/velocidad/vel_grafico_velocidad';
import Mantenimiento from './components/mantenimiento/mantenimiento';
import Rodillos from './components/rodillos/rodillos';
import { CookiesProvider, useCookies } from 'react-cookie';
import QS from './components/qs/qs';
import TR from './components/trazabilidad/tr';

const Render = () => {
  const [token] = useCookies(['tec-token']);
  // const [user] = useCookies(['tec-user']);

  return (
      <BrowserRouter>
        <Switch> 
          <Route path='/' exact >
            {token['tec-token'] ? <Redirect to="/home" /> : <Login />}
          </Route>

          <Route path='/home'> 
            {token['tec-token'] ? <Home /> : <Redirect to="/" />}
          </Route>

          <Route path='/cargas'> 
            {token['tec-token'] ? <Cargas /> : <Redirect to="/" />}
          </Route>

          <Route path='/estructura'>
            {token['tec-token'] ? <Estructura /> : <Redirect to="/" />}
          </Route>
          
          <Route path='/repuestos'>
            {token['tec-token'] ? <Repuestos /> : <Redirect to="/" />}
          </Route>

          <Route path='/mantenimiento'>
            {token['tec-token'] ? <Mantenimiento /> : <Redirect to="/" />}
          </Route>

          <Route path='/velocidad'>
            {token['tec-token'] ? <GraficoVelocidad /> : <Redirect to="/" />}
          </Route>

          <Route path='/mantenimiento'>
            {token['tec-token'] ? <Mantenimiento /> : <Redirect to="/" />}
          </Route>

          <Route path='/rodillos'>
            {token['tec-token'] ? <Rodillos /> : <Redirect to="/" />}
            </Route>

          <Route path='/qs'>
            {token['tec-token'] ? <QS /> : <Redirect to="/" />}
          </Route>

          <Route path='/trazabilidad'>
            {token['tec-token'] ? <TR /> : <Redirect to="/" />}
          </Route>
        </Switch>
      </BrowserRouter>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <Render />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
