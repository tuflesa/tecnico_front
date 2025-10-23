import React ,{ useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import LineChart from './vel_line_chart';
import VelocidadFiltro from './vel_filtro';
import { Container, Row, Col } from 'react-bootstrap';
import useInterval from '../utilidades/use_interval';
import EstadoActual from './vel_estado_actual';
import VelocidadNavBar from './vel_nav_bar';

const GraficoVelocidad = () => {
    const hoy = new Date();
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [filtro, setFiltro] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        fecha: moment(hoy).format('YYYY-MM-DD'),
        hora_inicio: '06:00',
        hora_fin: '22:00'
    });
    const [lineas, setLineas] = useState(null);
    const [registros, setRegistros] = useState(null);
    const [actualizar, setActualizar] = useState(true);
    const [estados, setEstados] = useState(null);

    useEffect(() => {
        // console.log('Leer empresas');
        filtro && axios.get(BACKEND_SERVER + `/api/velocidad/lineas/?zona__empresa=${filtro.empresa}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
            const states = res.data
                .map(linea => ({
                    ...linea,
                    seleccion: true,
                    velocidad_actual: null
                }))
                .sort((a, b) => {
                    const siglaA = a.zona?.siglas?.toUpperCase() || '';
                    const siglaB = b.zona?.siglas?.toUpperCase() || '';
                    return siglaA.localeCompare(siglaB);
                });

            console.log(states);
            setEstados(states);
            setLineas(res.data);
        });
    }, [filtro, token]);

    useEffect(()=>{
        // console.log('Leer registros');
        filtro && axios.get(BACKEND_SERVER + '/api/velocidad/registro/' +
                 `?zona__empresa=${filtro.empresa}&fecha=${filtro.fecha}&hora__gte=${filtro.hora_inicio}&hora__lte=${filtro.hora_fin}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            const datos = [];
            const raw_data = res.data;
            const datosLinea = (estado) => {
                const siglas = estado.zona.siglas;
                const color = estado.color;
                const datos = raw_data.filter( reg => reg.zona === estado.zona.id);
                const puntos = datos.map( dato => {
                    const fecha = dato.fecha.split('-');
                    const hora = dato.hora.split(':');
                    const x = new Date(fecha[0], fecha[1]-1, fecha[2], hora[0], hora[1], hora[2]);
                    const y = dato.velocidad;

                    return ({
                        x: x,
                        y: y
                    });
                });
                const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
                const fin = moment(filtro.fecha + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
                const ahora = moment();
                if (puntos.length>0){
                    if(ahora.isAfter(inicio) && ahora.isBefore(fin)) {
                        console.log('Añadir punto ahora ...');
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
                    {
                        siglas: siglas,
                        color: color,
                        datos: puntos
                    }
                )
            }

            estados && estados.map( estado => {
                if (estado.seleccion){
                    datos.push(datosLinea(estado));
                }
                
                return 0;
                });
            // console.log(datos);   
            setRegistros(datos);
        });
    },[filtro, actualizar, token, estados]);

    useEffect(()=>{
        const hoy = moment().format('YYYY-MM-DD');
        filtro && axios.get(BACKEND_SERVER + '/api/velocidad/registro/' +
                 `?zona__empresa=${filtro.empresa}&fecha=${hoy}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            // console.log('actualizando estados');
            if(estados){
                const newEstados = estados.map( e => {
                    const regs = res.data.filter(r => r.zona === e.zona.id);
                    let v = 0;
                    if (regs.length>0){
                        v = regs[regs.length - 1].velocidad;
                    }
                    return (
                        {
                            ...e,
                            velocidad_actual: v
                        }
                    )
                });
                // console.log(newEstados);
                setEstados(newEstados);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[token, filtro.empresa, lineas, actualizar]);

    useEffect(()=>{
        console.log('cambio de fecha, hora inicio o hora fin');

    },[filtro.fecha, filtro.hora_inicio, filtro.hora_fin]);

    const actualizarGrafico = () => {
        // console.log(actualizar);
        setActualizar(!actualizar);
    }

    useInterval(actualizarGrafico, 5000);

    const seleccionLinea = (e)  => {
        // console.log('seleccion linea')
        const siglas=e.target.value;
        const newEstados = estados.map(estado => {
            if (estado.zona.siglas === siglas){
                return ({
                    ...estado,
                    seleccion: !estado.seleccion
                });
            }
            else return estado;
        });
        setEstados(newEstados);
    }

    return (
        <React.Fragment>
            <VelocidadNavBar />
            <Container>
                <Row>
                    <VelocidadFiltro actualizaFiltro={setFiltro}
                                filtro = {filtro}/>
                </Row>
                <Row>
                    {estados && estados.map( estado => {
                        return (
                            <Col  key={estado.zona.id}>
                                <EstadoActual estado={estado} 
                                            seleccionLinea={seleccionLinea}/>
                            </Col>
                        )
                    })}
                </Row>
                <Row>
                    <Col className="col-12">
                        <LineChart data={registros}
                                fecha={filtro.fecha}
                                hora_inicio={filtro.hora_inicio}
                                hora_fin={filtro.hora_fin} />
                    </Col>
                </Row> 
            </Container>
        </React.Fragment>
    )
}

export default GraficoVelocidad;