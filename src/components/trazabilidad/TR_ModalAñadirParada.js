import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';

const ModalEditarParada = ({ show, onHide, parada }) => {
    const [tipoRegistro, setTipoRegistro] = useState(null); 
    const [fechaInicioReg, setFechaInicioReg] = useState('');
    const [fechaFinReg, setFechaFinReg] = useState('');
    const [horaInicioReg, setHoraInicioReg] = useState('');
    const [horaFinReg, setHoraFinReg] = useState('');

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

    if (!parada && show) return null;

    const generarTramosParaBD = (datos, paradaOriginal) => {
        // Usamos 'paradaOriginal.inicio' porque es donde viene el string "2025-12-09 15:55:20"
        // Añadimos una validación de seguridad (el ?)
        const tInicioTotal = new Date(paradaOriginal.inicio?.replace(' ', 'T')).getTime();
        const tFinTotal = new Date(paradaOriginal.fin?.replace(' ', 'T')).getTime();

        if (!tInicioTotal || !tFinTotal) {
            console.error("Error: Las fechas de la parada original no son válidas");
            return [];
        }

        if (!datos.detallesTiempo) {
            return [{ 
                inicio: paradaOriginal.inicio, 
                fin: paradaOriginal.fin, 
                tipo: 'normal', 
                observaciones: datos.observaciones 
            }];
        }

        // Convertir detalles de la incidencia (vienen en DD/MM/YYYY)
        const transformarISO = (f, h) => {
            if(!f || !h) return null;
            return `${f.split('/').reverse().join('-')}T${h}`;
        };

        const isoIncInicio = transformarISO(datos.detallesTiempo.fechaInicio, datos.detallesTiempo.horaInicio);
        const isoIncFin = transformarISO(datos.detallesTiempo.fechaFin, datos.detallesTiempo.horaFin);

        const tInicioInc = new Date(isoIncInicio).getTime();
        const tFinInc = new Date(isoIncFin).getTime();

        // Array de puntos temporales ordenados
        const puntos = [tInicioTotal, tInicioInc, tFinInc, tFinTotal].sort((a, b) => a - b);

        const tramos = [];
        for (let i = 0; i < puntos.length - 1; i++) {
            const inicio = puntos[i];
            const fin = puntos[i + 1];

            if (inicio === fin) continue; 

            let tipoTramo = 'normal';
            // Si el tramo coincide con el rango de la incidencia, le asignamos su tipo
            if (inicio >= tInicioInc && fin <= tFinInc) {
                tipoTramo = datos.tipo;
            }

            tramos.push({
                idPadre: paradaOriginal.id,
                zona_id: paradaOriginal.zona_id, // Añadimos la zona que necesitas para el backend
                inicio: new Date(inicio).toLocaleString('sv-SE').replace('T', ' '),
                fin: new Date(fin).toLocaleString('sv-SE').replace('T', ' '),
                tipo: tipoTramo,
                observaciones: tipoTramo === datos.tipo ? datos.observaciones : 'Tramo recuperado'
            });
        }
        return tramos;
    };

    const handleGuardar = () => {
        //<-------------------VALIDACIONES ------------------------>
        if (tipoRegistro) { 
            // Límites originales de la parada
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
            codigo_id: parada.codigo_id,  // El código (averia, inicidencia....?????)
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
        console.log("Tramos que enviamos para generar nueva parada:", tramosFinales);
        console.log("Datos que enviamos para generar nueva parada:", datosBase);
        console.log("parada:", parada);
        onHide();
    };

    // --- DIBUJO DEL TRAMO DE LA NUEVA PARADA ---
    let xUsuario = 0;
    let anchoUsuario = 0;

    if (tipoRegistro && fechaInicioReg && horaInicioReg && fechaFinReg && horaFinReg) {
        const [dI, mI, aI] = parada.fechaInicio.split('/');
        const [dF, mF, aF] = parada.fechaFin.split('/');
        
        const T_inicio_parada = new Date(`${aI}-${mI}-${dI}T${parada.horaInicio}`).getTime();
        const T_fin_parada = new Date(`${aF}-${mF}-${dF}T${parada.horaFin}`).getTime();
        const T_total = T_fin_parada - T_inicio_parada;

        const T_inicio_usuario = new Date(`${fechaInicioReg}T${horaInicioReg}`).getTime();
        const T_fin_usuario = new Date(`${fechaFinReg}T${horaFinReg}`).getTime();

        if (T_total > 0) {
            xUsuario = ((T_inicio_usuario - T_inicio_parada) / T_total) * 100;
            anchoUsuario = ((T_fin_usuario - T_inicio_usuario) / T_total) * 100;
        }
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