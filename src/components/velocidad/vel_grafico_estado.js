import React ,{ useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { BACKEND_SERVER } from '../../constantes';
import VelocidadNavBar from './vel_nav_bar';
import { Container, Row, Col, Form, Tab, Button, Nav, Modal, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import EstadoFiltro from './vel_estado_filtro';
import useInterval from '../utilidades/use_interval';
import StateChart from './state_chart ';
import FlejesAcu from "../trazabilidad/TR_FlejesAcu";
import ParadasAcu from '../trazabilidad/TR_ParadasAcu';
import '../../index';
import ordenarLista from '../utilidades/ordenar_paradas';

const GraficoEstado = () => {
    const [token] = useCookies(['tec-token']);
    const { id } = useParams();

    const [estado, setEstado] = useState(null);
    const [paradas, setParadas] = useState(null);
    const [tipoParadas, setTipoParadas] = useState(null);
    const [codigoParada, setCodigoParada] = useState(null);
    const [paradasSeleccionadas, setParadasSeleccionadas] = useState([]);
    const [registros, setRegistros] = useState(null);
    const [flejes, setFlejes] = useState(null);
    const [tabActiva, setTabActiva] = useState('flejes');
    const hoy = new Date();
    const [filtro, setFiltro] = useState({
            fecha: moment(hoy).format('YYYY-MM-DD'),
            hora_inicio: '06:00',
            hora_fin: '22:00'
        });
    const [ver, setVer] = useState({
        velocidad: true,
        potencia: false,
        frecuencia: false,
        fuerza: false
    })
    const [actualizar, setActualizar] = useState(true);
    const [existeDesconocido, setExisteDesconocido] = useState(false);
    const [mostrarModalTramos, setMostrarModalTramos] = useState(false);
    const [seleTipoParada, setseleTipoParada] = useState(null);
    const [codigo_seleccionado, setCodigoSeleccionado] = useState(null);

    const abrirModalTramos = () => {
        setMostrarModalTramos(true);
    };

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
            // console.log(res.data);
            setEstado(res.data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[filtro, actualizar]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/velocidad/tipoparada/?para_informar=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setTipoParadas(res.data);
        })
        .catch( err => {
            console.log(err);
        });  
    },[token]);

    useEffect(()=>{
        seleTipoParada && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos/?tipo_parada=${seleTipoParada}&zona=${id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setCodigoParada(res.data);
            // console.log('Estos son los codigos de los tipos de paradas: ', res.data);
        })
        .catch( err => {
            console.log(err);
        });  
    },[seleTipoParada]);

    useEffect(()=>{
        if (!estado) return;
        // console.log(estado);
        const datosRegistros = (estado) => {
            const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
            const fin = moment(filtro.fecha + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
            const ahora = moment();
            const siglas = estado.maquina.zona.siglas;

            // Registros de velocidad
            const datos = estado.registros.map( dato => {
                const fecha = dato.fecha.split('-');
                const hora = dato.hora.split(':');
                let x = new Date(fecha[0], fecha[1]-1, fecha[2], hora[0], hora[1], hora[2]);
                if (moment(x).isBefore(inicio)) {
                    x = inicio.toDate();
                }
                const y = dato.velocidad;
                const potencia = dato.potencia?dato.potencia:0.0;
                const frecuencia = dato.frecuencia?dato.frecuencia:0.0;
                const fuerza = dato.presion?dato.presion:0.0;

                return ({
                    x: x,
                    y: y,
                    potencia: potencia,
                    frecuencia: frecuencia,
                    fuerza: fuerza
                });
            });

            if (datos.length>0){
                if(ahora.isAfter(inicio) && ahora.isBefore(fin)) {
                    // console.log('Añadir punto ahora ...');
                    datos.push({
                        x: new Date(),
                        y: datos[datos.length -1].y,
                        potencia: datos[datos.length -1].potencia,
                        frecuencia: datos[datos.length -1].frecuencia,
                        fuerza: datos[datos.length -1].fuerza
                    });
                }
                else {
                    datos.push({
                        x: new Date(fin.format("YYYY-MM-DD HH:mm:ss")),
                        y: datos[datos.length -1].y,
                        potencia: datos[datos.length -1].potencia,
                        frecuencia: datos[datos.length -1].frecuencia,
                        fuerza: datos[datos.length -1].fuerza
                    });
                }
            }

            return (
                [{
                    siglas: siglas,
                    color: estado.maquina.color,
                    registros: datos
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
                const y_in = -15;
                let x_out;
                const y_out = -5;
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
                        // console.log('Añadir punto ahora ...');
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

        const datosParadas = (estado) => {
            const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
            const fin = moment(filtro.fecha + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');

            const puntos = estado.paradas.map( p => {
                let x_in = moment(p.inicio);
                if (x_in.isBefore(inicio)) {
                    x_in = inicio;
                }
                const y_in = -30;
                let x_out = moment(p.fin);
                if (x_out.isAfter(fin)) {
                    x_out = fin;
                }
                const y_out = -20;
                const seleccionado = paradasSeleccionadas.some(el => el.id == p.id);
                const color = seleccionado ? 'gold' : p.color;

                return ({
                    id: p.id,
                    x_in: x_in,
                    y_in: y_in,
                    x_out: x_out,
                    y_out: y_out,
                    color: color,
                });
            });

            return puntos
        }
        setParadas(datosParadas(estado));
        setRegistros(datosRegistros(estado));
        setFlejes(datosFlejes(estado));
        const existe = estado.paradas.some(p => p.codigo === 'Desconocido');
        setExisteDesconocido (existe);
        // console.log('Estado paradas: ', estado.paradas)
    },[estado, paradasSeleccionadas]);

    const actualizarGrafico = () => {
        setActualizar(!actualizar);
    }

    useInterval(actualizarGrafico, 5000);

    const handleSwitchChange = (event) => {
        setVer({
            ...ver,
            [event.target.id] : event.target.checked
            });
    };

    const handleInputChangeTipo = (event) => {
        setseleTipoParada(event.target.value);
        const nombre = event.target.options[event.target.selectedIndex].dataset.nombre;

        const fecha_inicio = moment(paradasSeleccionadas[0].fechaInicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const hora_inicio = paradasSeleccionadas[0].horaInicio;
        const fin = paradasSeleccionadas.length - 1;
        const fecha_fin = moment(paradasSeleccionadas[fin].fechaInicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const hora_fin = paradasSeleccionadas[fin].horaFin;

        const params = {
            fecha_inicio,
            hora_inicio,
            fecha_fin,
            hora_fin,
            zona: id
        };

        const headers = {
            'Authorization': `token ${token['tec-token']}`
        };

        axios.get(`${BACKEND_SERVER}/api/velocidad/leer_paradas_run/`, { params, headers })
            .then(res => {
                const paradas = res.data;

                if (nombre === 'Cambio') {
                    const nuevas_paradas = paradas.map(p => {
                        const inicio_dt = new Date(p.inicio);
                        const fin_dt = new Date(p.fin);
                        return {
                            id: p.id.toString(),
                            checked: true,
                            fechaInicio: inicio_dt.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            fechaFin: fin_dt.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            horaInicio: p.inicio.split("T")[1].replace("Z", ""),
                            horaFin: p.fin.split("T")[1].replace("Z", ""),
                            duracion: p.duracion
                        };
                    });

                    const nuevas_paradas_seleccionadas = [...paradasSeleccionadas, ...nuevas_paradas];
                    setParadasSeleccionadas(ordenarLista(nuevas_paradas_seleccionadas));

                } else {
                    const ids = paradas.map(p => p.id.toString());
                    const nuevas_paradas_seleccionadas = paradasSeleccionadas.filter(p => !ids.includes(p.id));
                    setParadasSeleccionadas(ordenarLista(nuevas_paradas_seleccionadas));
                }
            });
    };

    const handleInputChangeCodigo = (event) => {
        setCodigoSeleccionado(event.target.value)
    }

    const guardartipoparada = () => {
        console.log('paradasSeleccionadas: ', paradasSeleccionadas);
        if (!seleTipoParada) {
            alert('Debe seleccionar un tipo de parada');
            return;
        }
        
        if (!codigo_seleccionado) {
            alert('Debe seleccionar un código de parada');
            return;
        }

        if (paradasSeleccionadas.length === 0) {
            alert('No hay paradas seleccionadas');
            return;
        }
        try {
            // Revisar si podemos mandar directamente paradasSeleccionadas
            const datos = {
                zona_id: id,
                tipo_parada_id: seleTipoParada,
                codigo_parada_id: codigo_seleccionado,
                paradas: paradasSeleccionadas.map(p => ({
                    id: p.id,
                    fecha_inicio: p.fechaInicio,
                    hora_inicio: p.horaInicio,
                    fecha_fin: p.fechaFin,
                    hora_fin: p.horaFin,
                    duracion: p.duracion
                }))
            };
            axios.post(
                `${BACKEND_SERVER}/api/velocidad/guardar_paradas_agrupadas/`,
                datos,
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            .then(res => {
                console.log(res);
                if (res.status === 200) {
                    // Limpiar variables
                    setParadasSeleccionadas([]);
                    setseleTipoParada(null);
                    setCodigoSeleccionado(null);
                    setMostrarModalTramos(false);
                    setActualizar(!actualizar);
                }
            });
            
        } catch (error) {
            console.error('Error al guardar paradas:', error);
            alert('Error al guardar las paradas: ' + (error.response?.data?.error || error.message));
        }
    }

    const cerrar_modal =()=>{
        // Limpiar variables
            setParadasSeleccionadas([]);
            setseleTipoParada(null);
            setCodigoSeleccionado(null);
            setActualizar(!actualizar);
            
            setMostrarModalTramos(false);

    }

    return (
        <React.Fragment>
            <VelocidadNavBar />
            <Container>
                <Row className="mt-3 mb-3">
                    <Col sm={1}>
                        <Row>
                            <Col>
                                Máquina:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">{estado && estado.maquina.zona.siglas}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={1}>
                        <Row>
                            <Col>
                                m/min:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.velocidad.toFixed(1)}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={1}>
                        <Row>
                            <Col>
                                Kw:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.potencia.toFixed(0)}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={1}>
                        <Row>
                            <Col>
                                KHz:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.frecuencia.toFixed(0)}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={1}>
                        <Row>
                            <Col>
                                KN:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.fuerza.toFixed(0)}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={2}>
                        <Row>
                            <Col>
                                OF:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.of}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <Col>
                                Bobina:
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span className="destacado">
                                    {estado && estado.estado_act.fleje_descripcion}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                
                <Row>
                    <EstadoFiltro actualizaFiltro={setFiltro}
                                filtro = {filtro}/>
                </Row>

                <Row className="mb-2">
                    <Col className="d-flex justify-content-center">
                        <Form.Check
                            inline
                            type="switch"
                            id="velocidad"
                            label="velocidad"
                            checked={ver.velocidad}
                            onChange={handleSwitchChange}

                        />
                        <Form.Check
                            inline
                            type="switch"
                            id="potencia"
                            label="potencia"
                            checked={ver.potencia}
                            onChange={handleSwitchChange}
                        />
                        <Form.Check
                            inline
                            type="switch"
                            id="frecuencia"
                            label="frecuencia"
                            checked={ver.frecuencia}
                            onChange={handleSwitchChange}
                        />
                        <Form.Check
                            inline
                            type="switch"
                            id="fuerza"
                            label="fuerza"
                            checked={ver.fuerza}
                            onChange={handleSwitchChange}
                        />
                    </Col>
                </Row> 
                <Row>
                    <Col className="col-12">
                        <StateChart data={registros}
                                paradas={paradas}
                                flejes={flejes}
                                fecha={filtro.fecha}
                                hora_inicio={filtro.hora_inicio}
                                hora_fin={filtro.hora_fin}
                                ver={ver}
                                maquina = {estado&&estado.maquina} />
                    </Col>
                </Row> 
                {/* ================================================================================= */}
                <Tab.Container defaultActiveKey="flejes" activeKey={tabActiva} onSelect={(k)=> setTabActiva(k)}>
                    <div className="d-flex align-items-center mb-3">
                        <Nav variant="tabs" className="flex-grow-1">
                            <Nav.Item>
                                <Nav.Link eventKey="flejes">Flejes</Nav.Link>
                            </Nav.Item>

                            <Nav.Item>
                                <Nav.Link eventKey="paradas">
                                {existeDesconocido ? (
                                    <span>Paradas</span>
                                ) : (
                                    'Paradas'
                                )}
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item>
                                <Nav.Link eventKey="paradas_pendientes">
                                {existeDesconocido ? (
                                    <span className="glow-green">Paradas Pendientes</span>
                                ) : (
                                    'Paradas Pendientes'
                                )}
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        {tabActiva === 'paradas_pendientes' && (
                            <Button
                                variant="primary"
                                className="ms-2"
                                onClick={abrirModalTramos}
                                disabled={paradasSeleccionadas.length === 0}
                                >
                                Agrupar tramos
                            </Button>
                        )}
                    </div>
                    <Tab.Content>
                        <Tab.Pane eventKey="flejes" title="Flejes">
                            <Row>
                                <Col>
                                    <div style={{ height: '200px', overflowY: 'auto' }}>
                                        <FlejesAcu Flejes={estado && estado.flejes}/>
                                    </div>
                                </Col>
                            </Row>
                        </Tab.Pane>
                        {existeDesconocido?(
                            <Tab.Pane eventKey="paradas_pendientes" title={<span className="glow-green">paradas Pendientes</span>}>
                                <Row>
                                    <Col>
                                        <div style={{ height: '200px', overflowY: 'auto' }}>
                                            <ParadasAcu Paradas={estado && estado.paradas.filter(p => p.codigo === 'Desconocido')} 
                                                        paradasSeleccionadas={paradasSeleccionadas}
                                                        setParadasSeleccionadas={setParadasSeleccionadas}
                                                        acciones={true}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                        ):(
                            <Tab.Pane eventKey="paradas_pendientes" title="paradas_pendientes">
                                <Row>
                                    <Col>
                                        <div style={{ height: '200px', overflowY: 'auto' }}>
                                            <ParadasAcu Paradas={estado && estado.paradas.filter(p => p.codigo !== 'Running')}
                                                        paradasSeleccionadas={paradasSeleccionadas}
                                                        setParadasSeleccionadas={setParadasSeleccionadas}
                                                        acciones={true}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                        )}
                        <Tab.Pane eventKey="paradas" title={<span className="glow-green">paradas</span>}>
                            <Row>
                                <Col>
                                    <div style={{ height: '200px', overflowY: 'auto' }}>
                                        <ParadasAcu Paradas={estado && estado.paradas} 
                                                    paradasSeleccionadas={paradasSeleccionadas}
                                                    setParadasSeleccionadas={setParadasSeleccionadas}
                                                    acciones={false}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
                <Modal show={mostrarModalTramos} onHide={() => setMostrarModalTramos(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tramos Agrupados</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col>
                            <Form.Group controlId="tipoparada">
                                <Form.Label>Tipo Parada</Form.Label>
                                <Form.Control as="select"  
                                            name='tipoparada' 
                                            value={seleTipoParada}
                                            onChange={handleInputChangeTipo}
                                            placeholder="Tipo parada">
                                            <option key={0} value={''}>Selecciona una opción</option>
                                            {tipoParadas && tipoParadas.map( tipo => {
                                                return (
                                                <option
                                                    key={tipo.id}
                                                    value={tipo.id}
                                                    data-nombre={tipo.nombre}   // 👈 atributo extra
                                                >
                                                    {tipo.nombre}
                                                </option>
                                                )
                                            })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="codigoparada">
                                <Form.Label>Codigo Parada</Form.Label>
                                <Form.Control as="select"  
                                            name='codigoparada' 
                                            value={codigo_seleccionado}
                                            onChange={handleInputChangeCodigo}
                                            placeholder="Codigo parada"
                                            disabled={seleTipoParada?false:true}>
                                            <option key={0} value={''}>Selecciona una opción</option>
                                            {codigoParada && codigoParada.map( codigo => {
                                                return (
                                                <option key={codigo.id} value={codigo.id}>
                                                    {codigo.nombre}
                                                </option>
                                                )
                                            })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
            
                    <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Fecha Inicio - Hora Inicio</th>
                        <th>Fecha Fin - Hora Fin</th>
                        <th>Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paradasSeleccionadas.length > 0 ? (
                        paradasSeleccionadas.map((tramo, index) => (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{tramo.fechaInicio + ' - ' + tramo.horaInicio} </td>
                            <td>{tramo.fechaFin + ' - ' + tramo.horaFin}</td>
                            <td>{Number(tramo.duracion).toFixed(2)}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="5" className="text-center">
                            No hay tramos disponibles
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrar_modal}>
                    Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => guardartipoparada()}>
                    Guardar
                    </Button>
                </Modal.Footer>
                </Modal>
            </Container>
        </React.Fragment>
    )
}

export default GraficoEstado;