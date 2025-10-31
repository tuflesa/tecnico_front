import React ,{ useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { BACKEND_SERVER } from '../../constantes';
import VelocidadNavBar from './vel_nav_bar';
import { Container, Row, Col } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import EstadoFiltro from './vel_estado_filtro';
import useInterval from '../utilidades/use_interval';
import StateChart from './state_chart ';
import FlejesAcu from "../trazabilidad/TR_FlejesAcu";

const GraficoEstado = () => {
    const [token] = useCookies(['tec-token']);
    const { id } = useParams();

    const [estado, setEstado] = useState(null);
    const [registrosVelocidad, setRegistrosVelocidad] = useState(null);
    const [flejes, setFlejes] = useState(null);
    const hoy = new Date();
    const [filtro, setFiltro] = useState({
            fecha: moment(hoy).format('YYYY-MM-DD'),
            hora_inicio: '06:00',
            hora_fin: '22:00'
        });
    const [actualizar, setActualizar] = useState(true);

    useEffect(()=>{
        // console.log('Leer estado de la máquina id=', id);
        axios.get(BACKEND_SERVER + `/api/velocidad/estado/${id}`,{
            params: {
                fecha: filtro.fecha,
                hora_inicio: filtro.hora_inicio,
                hora_fin: filtro.hora_fin
            },
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
            console.log(res.data);
            setEstado(res.data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[filtro, actualizar]);

    useEffect(()=>{
        if (!estado) return;
        console.log(estado);
        const datosVelocidad = (estado) => {
            const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
            const fin = moment(filtro.fecha + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
            const ahora = moment();
            const siglas = estado.maquina.siglas;
            const color = 'red';
            const puntos = estado.velocidad.map( dato => {
                const fecha = dato.fecha.split('-');
                const hora = dato.hora.split(':');
                let x = new Date(fecha[0], fecha[1]-1, fecha[2], hora[0], hora[1], hora[2]);
                if (moment(x).isBefore(inicio)) {
                    x = inicio.toDate();
                }
                const y = dato.velocidad;

                return ({
                    x: x,
                    y: y
                });
            });

            if (puntos.length>0){
                if(ahora.isAfter(inicio) && ahora.isBefore(fin)) {
                    // console.log('Añadir punto ahora ...');
                    puntos.push({
                        x: new Date(),
                        y: puntos[puntos.length -1].y
                    });
                }
                else {
                    puntos.push({
                        x: new Date(fin.format("YYYY-MM-DD HH:mm:ss")),
                        y: puntos[puntos.length -1].y
                    });
                }
            }

            return (
                [{
                    siglas: siglas,
                    color: estado.maquina.color,
                    datos: puntos
                }]
            )
        }

        const datosFlejes = (estado) => {
            const puntos = estado.flejes.map( f => {
                // console.log(f);
                const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
                const fin = moment(filtro.fecha + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
                const ahora = moment();
                const fecha_entrada = f.fecha_entrada.split('-');
                const hora_entrada = f.hora_entrada.split(':');
                let x_in = moment(new Date(fecha_entrada[0], fecha_entrada[1]-1, fecha_entrada[2], hora_entrada[0], hora_entrada[1], hora_entrada[2]));
                if (x_in.isBefore(inicio)) {
                    x_in = inicio;
                }
                const y_in = -20;
                let x_out;
                const y_out = -10;
                if (f.fecha_salida) {
                    const fecha_salida = f.fecha_salida.split('-');
                    const hora_salida = f.hora_salida.split(':');
                    x_out = moment(new Date(fecha_salida[0], fecha_salida[1]-1, fecha_salida[2], hora_salida[0], hora_salida[1], hora_salida[2]));
                    if (x_out.isAfter(fin)) {
                        x_out = fin;
                    }
                }
                else {
                    if(ahora.isAfter(inicio) && ahora.isBefore(fin)) {
                        console.log('Añadir punto ahora ...');
                        x_out = new Date();
                    }
                    else {
                        x_out = new Date(fin.format("YYYY-MM-DD HH:mm:ss"));
                    }
                }

                // Color
                let color = 'orange';
                if ((f.metros_medido>f.metros_teorico) && (f.metros_medido<=f.metros_teorico*1.1)){
                    color = 'green';
                }
                if (f.metros_medido > f.metros_teorico*1.1) {
                    color = 'red';
                }
                
                return ({
                    x_in: x_in,
                    y_in: y_in,
                    x_out: x_out,
                    y_out: y_out,
                    color: color,
                    descripcion: f.descripcion,
                    pos: f.pos
                });
            });

            return puntos
        }

        // console.log(datosLinea(estado))
        setRegistrosVelocidad(datosVelocidad(estado));
        setFlejes(datosFlejes(estado));
    },[estado]);

    const actualizarGrafico = () => {
        setActualizar(!actualizar);
    }

    useInterval(actualizarGrafico, 5000);

    return (
        <React.Fragment>
            <VelocidadNavBar />
            <Container>
                <Row>
                    <EstadoFiltro actualizaFiltro={setFiltro}
                                filtro = {filtro}/>
                </Row> 
                <Row>
                    <Col className="col-12">
                        <StateChart data={registrosVelocidad}
                                flejes={flejes}
                                fecha={filtro.fecha}
                                hora_inicio={filtro.hora_inicio}
                                hora_fin={filtro.hora_fin}
                                maquina = {estado&&estado.maquina} />
                    </Col>
                </Row> 
                <Row>
                    <Col>
                        <div style={{ height: '200px', overflowY: 'auto' }}>
                            <FlejesAcu Flejes={estado && estado.flejes} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    )
}

export default GraficoEstado;