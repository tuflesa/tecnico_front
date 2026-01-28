import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ModalEditarParada = ({ show, onHide, parada }) => {
    const [token] = useCookies(['tec-token']);
    const [tipoRegistro, setTipoRegistro] = useState(null); 
    const [fechaInicioReg, setFechaInicioReg] = useState('');
    const [fechaFinReg, setFechaFinReg] = useState('');
    const [horaInicioReg, setHoraInicioReg] = useState('');
    const [horaFinReg, setHoraFinReg] = useState('');
    const [codigoSel, setCodigoSel] = useState('');
    const [codigoParada, setCodigoParada] = useState(null);
    const [nuevaObs, setNuevaObs] = useState('');

    let tipo_nuevaparada = '';

    // --- FUNCIÓN DE UTILIDAD PARA EL INPUT DATE ---
    const convertirAFormatoISO = (fechaEspanol) => {
        if (!fechaEspanol || !fechaEspanol.includes('/')) return '';
        const [dia, mes, año] = fechaEspanol.split('/');
        return `${año}-${mes}-${dia}`;
    };

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

    useEffect(()=>{
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

    const generarTramosParaBD = (datos, paradaOriginal) => {
        if (!paradaOriginal || !paradaOriginal.inicio) return [];

        const timestampAString = (ts) => {
            const d = new Date(ts);
            return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
        };

        const tInicioOrig = new Date(paradaOriginal.inicio.replace(' ', 'T') + 'Z').getTime();
        const tFinOrig = new Date(paradaOriginal.fin.replace(' ', 'T') + 'Z').getTime();
        const tInicioInc = new Date(`${datos.detallesTiempo.fechaInicio.split('/').reverse().join('-')}T${datos.detallesTiempo.horaInicio}Z`).getTime();
        const tFinInc = new Date(`${datos.detallesTiempo.fechaFin.split('/').reverse().join('-')}T${datos.detallesTiempo.horaFin}Z`).getTime();

        const tramos = [];

        // TRAMO 1: Trozo inicial (mantiene el ID original para el PATCH)
        if (tInicioInc > tInicioOrig) {
            tramos.push({
                id: paradaOriginal.id, // Mantenemos el ID para saber que este es el que se actualiza
                inicio: timestampAString(tInicioOrig),
                fin: timestampAString(tInicioInc),
                codigo: parseInt(paradaOriginal.codigo_id || paradaOriginal.codigo),
                zona: parseInt(paradaOriginal.zona_id || paradaOriginal.zona),
                observaciones: paradaOriginal.observaciones || ""
            });
        }

        // TRAMO 2: La nueva incidencia/avería (Sin ID para el POST)
        tramos.push({
            inicio: timestampAString(tInicioInc),
            fin: timestampAString(tFinInc),
            codigo: parseInt(datos.codigo_nuevo), // ID numérico limpio
            zona: parseInt(paradaOriginal.zona_id || paradaOriginal.zona),
            observaciones: datos.observaciones || ""
        });

        // TRAMO 3: Trozo final (Sin ID para el POST)
        if (tFinInc < tFinOrig) {
            tramos.push({
                inicio: timestampAString(tFinInc),
                fin: timestampAString(tFinOrig),
                codigo: parseInt(paradaOriginal.codigo_id || paradaOriginal.codigo),
                zona: parseInt(paradaOriginal.zona_id || paradaOriginal.zona),
                observaciones: paradaOriginal.observaciones || ""
            });
        }

        return tramos.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
    };
    const handleGuardar = async () => {
        //<-------------------VALIDACIONES ------------------------>
        if (tipoRegistro) { 
            // Horas originales de la parada
            const [dI, mI, aI] = parada.fechaInicio.split('/');
            const limiteInicio = new Date(`${aI}-${mI}-${dI}T${parada.horaInicio}`);
            const [dF, mF, aF] = parada.fechaFin.split('/');
            const limiteFin = new Date(`${aF}-${mF}-${dF}T${parada.horaFin}`);

            // Valores introducidos por el usuario
            const usuarioInicio = new Date(`${fechaInicioReg}T${horaInicioReg || "00:00:00"}`);
            const usuarioFin = new Date(`${fechaFinReg}T${horaFinReg || "00:00:00"}`);

            if (!horaInicioReg || !horaFinReg) {
                alert("Por favor, indique las horas de inicio y fin.");
                return;
            }
            if (usuarioInicio < limiteInicio || usuarioFin > limiteFin) {
                alert(`El rango debe estar dentro de la parada: ${parada.fechaInicio} ${parada.horaInicio} hasta ${parada.fechaFin} ${parada.horaFin}`);
                return;
            }
            if (usuarioInicio >= usuarioFin) {
                alert("La hora de inicio debe ser anterior a la de fin.");
                return;
            }
        }

        const datosBase = {
            idParada: parada.id, 
            zona_id: parada.zona_id,
            codigo_id: parada.codigo_id,  // El código del tramo principal (averia, inicidencia....?????)
            tipo_nuevo: tipo_nuevaparada,
            codigo_nuevo: codigoSel,
            observaciones: nuevaObs,
            tipoAccion: tipoRegistro,     // averia o incidencia nueva metida por el usuario
            
            inicioOriginal: parada.inicio, 
            finOriginal: parada.fin,
            
            detallesTiempo: tipoRegistro ? {
                fechaInicio: fechaInicioReg.split('-').reverse().join('/'),
                horaInicio: horaInicioReg,
                fechaFin: fechaFinReg.split('-').reverse().join('/'),
                horaFin: horaFinReg
            } : null
        };
        // Función para ordenar todos las fechas y horas
        const tramosFinales = generarTramosParaBD(datosBase, parada);
        // Guardamos en la BD
        if (tramosFinales.length === 0) return; 
        try {
            const config = { headers: { 'Authorization': `token ${token['tec-token']}` } };

            // 1. TRAMO 1: PATCH a la parada actual (ID original)
            const t1 = tramosFinales[0];
            await axios.patch(`${BACKEND_SERVER}/api/velocidad/paradas_crear/${parada.id}/`, {
                codigo: t1.codigo,
                zona: t1.zona,
                observaciones: t1.observaciones,
                periodos: [{ inicio: t1.inicio, fin: t1.fin, velocidad: 0 }] 
            }, config);

            // 2. TRAMOS RESTANTES: POST para nuevas paradas
            if (tramosFinales.length > 1) {
                const promesas = tramosFinales.slice(1).map(t => {
                    return axios.post(`${BACKEND_SERVER}/api/velocidad/paradas_crear/`, {
                        codigo: t.codigo,
                        zona: t.zona,
                        observaciones: t.observaciones,
                        periodos: [{ inicio: t.inicio, fin: t.fin, velocidad: 0 }]
                    }, config);
                });
                await Promise.all(promesas);
            }

            alert("Parada y periodos actualizados correctamente");
            cerrar_limpiar();
        } catch (error) {
            console.error("Error al guardar:", error.response?.data || error.message);
            alert("Error al guardar.");
        }
    };

    // --- DIBUJO DEL TRAMO DE LA NUEVA PARADA (CORREGIDO) ---
    let xUsuario = 0;
    let anchoUsuario = 0;

    if (tipoRegistro && fechaInicioReg && horaInicioReg && fechaFinReg && horaFinReg) {
        // 1. Convertimos los límites de la parada original (usando el formato ISO para evitar errores)
        const T_inicio_parada = new Date(parada.inicio.replace(' ', 'T')).getTime();
        const T_fin_parada = new Date(parada.fin.replace(' ', 'T')).getTime();
        const T_total = T_fin_parada - T_inicio_parada;

        // 2. Tiempos que el usuario está marcando en el modal
        const T_inicio_usuario = new Date(`${fechaInicioReg}T${horaInicioReg}`).getTime();
        const T_fin_usuario = new Date(`${fechaFinReg}T${horaFinReg}`).getTime();

        // 3. Solo calculamos si el tiempo total es válido
        if (T_total > 0 && T_fin_usuario >= T_inicio_usuario) {
            // Calculamos posición relativa
            xUsuario = ((T_inicio_usuario - T_inicio_parada) / T_total) * 100;
            anchoUsuario = ((T_fin_usuario - T_inicio_usuario) / T_total) * 100;

            // --- PROTECCIONES ---
            // Evitamos que el rectángulo se salga por la izquierda (x < 0)
            xUsuario = Math.max(0, xUsuario);
            
            // Evitamos que el ancho sea negativo o que se salga por la derecha
            anchoUsuario = Math.max(0, anchoUsuario);
            if (xUsuario + anchoUsuario > 100) {
                anchoUsuario = 100 - xUsuario;
            }
        } else {
            // Si el usuario pone una hora de fin menor a la de inicio, reseteamos a 0
            xUsuario = 0;
            anchoUsuario = 0;
        }
    }

    const cerrar_limpiar =()=>{
        setNuevaObs('');
        tipo_nuevaparada='';
        setTipoRegistro('');
        setCodigoSel('');
        onHide();
    }

    const esAveria = tipoRegistro === 'averia';
    const esIncidencia = tipoRegistro === 'incidencia';
    const colorBorde = esAveria ? '#dc3545' : '#ffc107';
    const tituloForm = esAveria ? 'Datos de la Avería' : 'Datos de la Incidencia';

    return (
        <Container>
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Añadir Parada</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    
                    {/* SVG CON DIBUJO DINÁMICO */}
                    <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                            <span><strong>Inicio:</strong> {parada?.fechaInicio} {parada?.horaInicio}</span>
                            <span><strong>Fin:</strong> {parada?.fechaFin} {parada?.horaFin}</span>
                        </div>
                        <svg width="100%" height="40" style={{ background: '#eee', borderRadius: '4px' }}>
                            {/* Rectángulo parada */}
                            <rect x="0" y="5" width="100%" height="30" fill={parada?.color || "#2e2cba"} fillOpacity="0.3" stroke="#333" strokeWidth="1" rx="4" />
                            
                            {/* Rectángulo de la nueva parada (Solo si hay datos y tipo seleccionado) */}
                            {tipoRegistro && anchoUsuario > 0 && (
                                <rect 
                                    x={`${Math.max(0, xUsuario)}%`} 
                                    y="5" 
                                    width={`${Math.min(100 - xUsuario, anchoUsuario)}%`} 
                                    height="30" 
                                    fill={esAveria ? "#dc3545" : "#ffc107"} 
                                    stroke="#000" strokeWidth="1" rx="2" 
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
                                                    //disabled={tipoSel?false:true}
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
                                        <Form.Label>Fecha Inicioooo</Form.Label>
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
                    <Button variant="secondary" onClick={onHide}>Cerrar</Button>
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

export default ModalEditarParada;