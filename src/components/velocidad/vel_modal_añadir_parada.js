import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import moment from 'moment';

const ModalAñadirParada = ({ show, onHide, parada }) => {
    const [token] = useCookies(['tec-token']);
    const [tipoRegistro, setTipoRegistro] = useState(null); 
    const [fechaInicioReg, setFechaInicioReg] = useState('');
    const [fechaFinReg, setFechaFinReg] = useState('');
    const [horaInicioReg, setHoraInicioReg] = useState('');
    const [horaFinReg, setHoraFinReg] = useState('');
    const [codigoSel, setCodigoSel] = useState('');
    const [codigoParada, setCodigoParada] = useState(null);
    const [nuevaObs, setNuevaObs] = useState('');
    const [periodos, setPeriodos] = useState('');

    let tipo_nuevaparada = '';

    // --- FUNCIÓN DE UTILIDAD PARA EL INPUT DATE ---
    const convertirAFormatoISO = (fechaEspanol) => {
        if (!fechaEspanol || !fechaEspanol.includes('/')) return '';
        const [dia, mes, año] = fechaEspanol.split('/');
        return `${año}-${mes}-${dia}`;
    };

    useEffect(() => {
        parada && axios.get(BACKEND_SERVER + `/api/velocidad/periodo/?parada=${parada.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPeriodos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [parada]);

    useEffect(() => {
        if (parada) {
            // Convertimos las fechas de la parada al formato (YYYY-MM-DD)
            setFechaInicioReg(convertirAFormatoISO(parada.fechaInicio));
            setFechaFinReg(convertirAFormatoISO(parada.fechaFin));
            setHoraInicioReg('');
            setHoraFinReg('');
            setTipoRegistro(null);
        }
    }, [parada]);

    useEffect(()=>{ //recogemos los códigos de parada según elijamos avería o incidencia
        if(tipoRegistro==='averia'){
            tipo_nuevaparada=2;
        }
        else if(tipoRegistro==='incidencia'){
            tipo_nuevaparada=3;
        }
        tipo_nuevaparada && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos/?tipo_parada=${tipo_nuevaparada}&zona=${parada?.zona_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setCodigoParada(res.data);
        })
        .catch( err => {
            console.log(err);
        });  
    },[tipoRegistro]);

    if (!parada && show) return null;

    const handleGuardar = async () => {
        let T_u_inicio, T_u_fin, pContenedor;
        
        //<-------------------VALIDACIONES ------------------------>
        if (tipoRegistro) {
            if (!horaInicioReg || !horaFinReg) {
                alert("Por favor, indique las horas de inicio y fin.");
                return;
            }

            if (!codigoSel) {
                alert("Por favor, seleccione un código de parada.");
                return;
            }

            // 1. Convertir la fecha UTC
            T_u_inicio = moment.utc(`${fechaInicioReg}T${horaInicioReg}`).valueOf();
            T_u_fin = moment.utc(`${fechaFinReg}T${horaFinReg}`).valueOf();

            if (T_u_inicio >= T_u_fin) {
                alert("La hora de inicio debe ser anterior a la de fin.");
                return;
            }

            // 2. BUSCAR EL PERIODO DE INACTIVIDAD QUE CONTIENE ESTE RANGO
            pContenedor = periodos.find(p => {
                const tP_inicio = moment.utc(p.inicio).valueOf();
                const tP_fin = moment.utc(p.fin).valueOf();
                return (
                    p.velocidad <= 0 && 
                    T_u_inicio >= tP_inicio && 
                    T_u_fin <= tP_fin
                );
            });

            if (!pContenedor) {
                alert("El rango seleccionado debe estar totalmente dentro de un periodo de INACTIVIDAD.");
                return;
            }
            
        } else {
            alert("Por favor, seleccione si desea añadir una Avería o Incidencia.");
            return;
        }

        // Convertimos horas del periodo contenedor
        const tP_inicio = moment.utc(pContenedor.inicio).valueOf();
        const tP_fin = moment.utc(pContenedor.fin).valueOf();
        
        // Verificar si coincide exactamente con los límites
        const esInicioExacto = T_u_inicio === tP_inicio;
        const esFinExacto = T_u_fin === tP_fin;

        try {
            const config = { headers: { 'Authorization': `token ${token['tec-token']}` } };

            // --- CASO 1: TODO EL PERIODO ES UNA AVERÍA/INCIDENCIA ---
            if (esInicioExacto && esFinExacto) {                
                // 1. Crear la nueva parada CON el periodo
                await axios.post(`${BACKEND_SERVER}/api/velocidad/paradas_crear/`, {
                    codigo: parseInt(codigoSel),
                    zona: parada.zona_id,
                    observaciones: nuevaObs || "",
                    periodos: [{
                        inicio: moment.utc(T_u_inicio).toISOString(),
                        fin: moment.utc(T_u_fin).toISOString(),
                        velocidad: 0
                    }]
                }, config);

                console.log("Nueva parada creada con su periodo");

                // 2. Eliminar el periodo contenedor (ahora pertenece a la nueva parada)
                await axios.delete(`${BACKEND_SERVER}/api/velocidad/periodo/${pContenedor.id}/`, config);

                console.log("Periodo antiguo eliminado");
            }

            // --- CASO 2: AVERÍA AL PRINCIPIO O AL FINAL DE UN PERIODO---
            else if (esInicioExacto || esFinExacto) {
                console.log("CASO 2: Avería al principio o al final");
                
                // 1. Crear la nueva parada CON su periodo
                await axios.post(`${BACKEND_SERVER}/api/velocidad/paradas_crear/`, {
                    codigo: parseInt(codigoSel),
                    zona: parada.zona_id,
                    observaciones: nuevaObs || "",
                    periodos: [{
                        inicio: moment.utc(T_u_inicio).toISOString(),
                        fin: moment.utc(T_u_fin).toISOString(),
                        velocidad: 0
                    }]
                }, config);

                // 2. Actualizar el periodo contenedor (solo cambiamos las horas, NO TOCAMOS LA PARADA)
                const nuevoInicio = esInicioExacto ? T_u_fin : tP_inicio;
                const nuevoFin = esInicioExacto ? tP_fin : T_u_inicio;

                await axios.patch(`${BACKEND_SERVER}/api/velocidad/periodo/${pContenedor.id}/`, {
                    inicio: moment.utc(nuevoInicio).toISOString(),
                    fin: moment.utc(nuevoFin).toISOString()
                }, config);
            }

            // --- CASO 3: AVERÍA EN EL MEDIO (DIVIDIR EN 3) ---
            else {                
                // 1. Crear la nueva parada CON su periodo (la parte del medio)
                await axios.post(`${BACKEND_SERVER}/api/velocidad/paradas_crear/`, {
                    codigo: parseInt(codigoSel),
                    zona: parada.zona_id,
                    observaciones: nuevaObs || "",
                    periodos: [{
                        inicio: moment.utc(T_u_inicio).toISOString(),
                        fin: moment.utc(T_u_fin).toISOString(),
                        velocidad: 0
                    }]
                }, config);

                // 2. Crear el periodo para la parte final (poniendo como parada la PARADA ORIGINAL del periodoContenedor)
                await axios.post(`${BACKEND_SERVER}/api/velocidad/periodo/`, {
                    inicio: moment.utc(T_u_fin).toISOString(),
                    fin: moment.utc(tP_fin).toISOString(),
                    velocidad: 0,
                    parada: pContenedor.parada
                }, config);

                // 3. Actualizar el periodo contenedor, el inicial, solo actualizamos horas sin cambiar parada.
                await axios.patch(`${BACKEND_SERVER}/api/velocidad/periodo/${pContenedor.id}/`, {
                    inicio: moment.utc(tP_inicio).toISOString(),
                    fin: moment.utc(T_u_inicio).toISOString()
                }, config);
            }

            alert("Parada dividida y guardada correctamente.");
            cerrar_limpiar();
            window.location.reload(); // O puedes usar un callback prop si prefieres
            
        } catch (error) {
            console.error("Error en el proceso:", error.response?.data || error.message);
            alert("Hubo un error al guardar los cambios: " + (error.response?.data?.detail || error.message));
        }
    };

    // --- DIBUJO DEL TRAMO DE LA NUEVA PARADA ---
    let xUsuario = 0;
    let anchoUsuario = 0;

    if (tipoRegistro && fechaInicioReg && horaInicioReg && fechaFinReg && horaFinReg) {
        // Usamos momento para cambiar las horas de formato UTC
        const T_inicio_parada = moment.utc(parada.inicio).valueOf();
        const T_fin_parada = moment.utc(parada.fin).valueOf();
        const T_total = T_fin_parada - T_inicio_parada;

        const T_inicio_usuario = moment.utc(`${fechaInicioReg}T${horaInicioReg}`).valueOf();
        const T_fin_usuario = moment.utc(`${fechaFinReg}T${horaFinReg}`).valueOf();

        if (T_total > 0 && T_fin_usuario >= T_inicio_usuario) {
            xUsuario = ((T_inicio_usuario - T_inicio_parada) / T_total) * 100;
            anchoUsuario = ((T_fin_usuario - T_inicio_usuario) / T_total) * 100;
            
            xUsuario = Math.max(0, xUsuario);
            anchoUsuario = Math.min(anchoUsuario, 100 - xUsuario);
        }
    }

    const renderizarPeriodosBase = () => {
        if (!parada || !periodos || periodos.length === 0) return null;

        const T_inicio_parada = moment.utc(parada.inicio).valueOf();
        const T_fin_parada = moment.utc(parada.fin).valueOf();
        const T_total = T_fin_parada - T_inicio_parada;

        if (T_total <= 0 || isNaN(T_total)) return null;

        return periodos.map((p, index) => {
            const T_p_inicio = moment.utc(p.inicio).valueOf();
            const T_p_fin = moment.utc(p.fin).valueOf();
            
            const x = ((T_p_inicio - T_inicio_parada) / T_total) * 100;
            const ancho = ((T_p_fin - T_p_inicio) / T_total) * 100;

            const horaI = moment.utc(p.inicio).format('HH:mm:ss');
            const horaF = moment.utc(p.fin).format('HH:mm:ss');
            
            const estaEnMarcha = p.velocidad > 0;

            return (
                <g key={p.id || index}>
                    <rect 
                        x={`${Math.max(0, x)}%`} 
                        y="5" 
                        width={`${Math.max(0.5, ancho)}%`} 
                        height="30" 
                        // Si hay velocidad: Verde. Si no: Gris o transparente
                        fill={estaEnMarcha ? "#28a745" : "#adb0bd"} 
                        fillOpacity={estaEnMarcha ? "0.8" : "0.3"}
                        stroke={estaEnMarcha ? "#1e7e34" : "#6c757d"}
                        strokeWidth="0.5"
                        rx="2"
                        style={{ cursor: 'pointer' }}
                    >
                        <title>
                            {`${estaEnMarcha ? 'ESTADO: MARCHA' : 'ESTADO: PARADA'}\n` +
                            `Inicio: ${horaI}\n` +
                            `Fin: ${horaF}\n` +
                            `Velocidad: ${p.velocidad} m/min`}
                        </title>
                    </rect>
                </g>
            );
        });
    };

    const cerrar_limpiar = () => {
        setNuevaObs('');
        tipo_nuevaparada='';
        setTipoRegistro(null);
        setCodigoSel('');
        setFechaInicioReg('');
        setFechaFinReg('');
        setHoraInicioReg('');
        setHoraFinReg('');
        onHide();
    };

    const esAveria = tipoRegistro === 'averia';
    const esIncidencia = tipoRegistro === 'incidencia';
    const colorBorde = esAveria ? '#dc3545' : '#ffc107';
    const tituloForm = esAveria ? 'Datos de la Avería' : 'Datos de la Incidencia';

    return (
        <Container>
            <Modal show={show} onHide={cerrar_limpiar} centered size="lg">
                <Modal.Header closeButton>
                    <div>
                        <Modal.Title>Añadir Parada</Modal.Title>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                            La Avería o Incidencia debe estar dentro de un tramo de inactividad
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    
                    {/* SVG CON DIBUJO DINÁMICO */}
                    <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                            <span><strong>Inicio:</strong> {parada?.fechaInicio} {parada?.horaInicio}</span>
                            <span><strong>Fin:</strong> {parada?.fechaFin} {parada?.horaFin}</span>
                        </div>
                        <svg width="100%" height="40" style={{ background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                            {/* Fondo base para ver el área total */}
                            <rect x="0" y="5" width="100%" height="30" fill="#dee2e6" rx="4" />

                            {/* 1. Dibujamos los periodos existentes */}
                            {renderizarPeriodosBase()}
                            
                            {/* 2. Dibujamos la selección actual del usuario encima */}
                            {tipoRegistro && anchoUsuario > 0 && (
                                <rect 
                                    x={`${Math.max(0, xUsuario)}%`} 
                                    y="2" // Lo subimos un poco (y=2 en vez de 5)
                                    width={`${Math.min(100 - xUsuario, anchoUsuario)}%`} 
                                    height="36" // Lo hacemos más alto para que "abrace" a los periodos
                                    fill={esAveria ? "#dc3545" : "#ffc107"} 
                                    fillOpacity="0.8"
                                    stroke="#000" 
                                    strokeWidth="1.5" 
                                    rx="2" 
                                />
                            )}
                        </svg>
                    </div>

                    {tipoRegistro && (
                        <div style={{ marginTop: '20px', padding: '15px', border: `2px solid ${colorBorde}`, borderRadius: '8px', background: esAveria ? '#fff5f5' : '#fffdf5' }}>
                            <h6 style={{ color: colorBorde }}>{tituloForm}</h6>
                            <Row>
                                <Col>
                                    <Form.Group controlId="codigoparada">
                                        <Form.Label>Codigo Parada</Form.Label>
                                        <Form.Control as="select"  
                                                    name='codigoparada' 
                                                    value={codigoSel}
                                                    onChange={(e) => setCodigoSel(e.target.value)}
                                                    placeholder="Codigo parada"
                                                    >
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
                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Observaciones:</strong></Form.Label>
                                        <Form.Control as="textarea" rows={2} value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Fecha Inicio</Form.Label>
                                        <Form.Control type="date" value={fechaInicioReg} onChange={(e) => setFechaInicioReg(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Inicio</Form.Label>
                                        <Form.Control type="time" step="1" value={horaInicioReg} onChange={(e) => setHoraInicioReg(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Fecha Fin</Form.Label>
                                        <Form.Control type="date" value={fechaFinReg} onChange={(e) => setFechaFinReg(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Fin</Form.Label>
                                        <Form.Control type="time" step="1" value={horaFinReg} onChange={(e) => setHoraFinReg(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={cerrar_limpiar}>Cerrar</Button>
                    <div>
                        <Button 
                            variant={esIncidencia ? "warning" : "outline-warning"} 
                            className="me-2"
                            onClick={() => setTipoRegistro(esIncidencia ? null : 'incidencia')}
                        >
                            {esIncidencia ? "Quitar Incidencia" : "Añadir Incidencia"}
                        </Button>
                        <Button 
                            variant={esAveria ? "danger" : "outline-danger"} 
                            className="me-2"
                            onClick={() => setTipoRegistro(esAveria ? null : 'averia')}
                        >
                            {esAveria ? "Quitar Avería" : "Añadir Avería"}
                        </Button>
                        <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalAñadirParada;