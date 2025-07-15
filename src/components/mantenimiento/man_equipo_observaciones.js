import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';

const ObservacionesModal = ({ show, onHide, linea, filtro, parte, onUpdateTarea, showFinalizar = true, showConsumibles = true, // prop para mostrar/ocultar botón consumibles
    
}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date());
    const [linea_completa, setLinea_completa] = useState(linea);
    
    const [datos, setDatos] = useState({
        fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        observaciones: linea_completa?linea_completa.observaciones_trab:'',
        trabajador: user['tec-user'].perfil.usuario,
    });

    // Actualizar observaciones cuando cambie linea_completa
    useEffect(() => {
        setLinea_completa(linea);
        if (linea) {
            setDatos(prev => ({
                ...prev,
                observaciones: linea.observaciones_trab || ''
            }));
        }
    }, [linea]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name]: event.target.value
        });
    };

    const GuardarComentarios = () => {
        if (linea_completa && datos.observaciones) {
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_contrabajador/${linea_completa.id}/`, {
                observaciones_trab: datos.observaciones,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then(r => {
                if (onUpdateTarea) {
                    onUpdateTarea();
                }
                setLinea_completa(r.data);
            })
            .catch(err => {
                console.log(err);
            });
        }
    };

    const FinalizarTarea = () => {
        var Finalizar_Tarea = window.confirm('Vas a finalizar la tarea ¿Desea continuar?');
        if (Finalizar_Tarea && linea_completa) {
            // Finalizar trabajadores
            for (var x = 0; x < linea_completa.lineas.length; x++) {
                axios.patch(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/${linea_completa.lineas[x].id}/`, {
                    fecha_fin: datos.fecha_fin,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then(r => {
                    console.log('Trabajador finalizado', r.data);
                })
                .catch(err => {
                    console.log(err);
                });
            }

            // Finalizar línea
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${linea_completa.id}/`, {
                fecha_fin: datos.fecha_fin,
                estado: 3,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then(re => {
                if (re.data.parte.tipo === 1 || re.data.parte.tipo === 7) {
                    // Lógica para crear nueva línea preventiva
                    var fechaString = null;
                    var diaEnMilisegundos = 1000 * 60 * 60 * 24;
                    var fecha = Date.parse(re.data.fecha_fin);
                    var suma = fecha + (diaEnMilisegundos * re.data.tarea.periodo * re.data.tarea.tipo_periodo.cantidad_dias);
                    var fechaPorSemanas = new Date(suma);
                    fechaString = fechaPorSemanas.getFullYear() + '-' + ('0' + (fechaPorSemanas.getMonth() + 1)).slice(-2) + '-' + ('0' + fechaPorSemanas.getDate()).slice(-2);

                    if (fechaString) {
                        axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`, {
                            parte: re.data.parte.id,
                            tarea: re.data.tarea.id,
                            fecha_inicio: null,
                            fecha_fin: null,
                            fecha_plan: fechaString,
                            estado: 1,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        })
                        .then(r => {
                            console.log('Nueva línea creada');
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    }
                } else {
                    // Lógica para verificar si todas las líneas del parte están terminadas
                    axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${re.data.parte.id}`, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then(res => {
                        var contador = 0;
                        for (var x = 0; x < res.data.length; x++) {
                            if (res.data[x].estado === 3) {
                                contador = contador + 1;
                                if (contador === res.data.length) {
                                    axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${res.data[0].parte}/`, {
                                        estado: 3,
                                    }, {
                                        headers: {
                                            'Authorization': `token ${token['tec-token']}`
                                        }
                                    })
                                    .then(re => {
                                        alert('Parte finalizado');
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                                }
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
                handleClose();
                /* // actualizar datos
                if (onUpdateTarea) {
                    onUpdateTarea();
                }
                
                // Cerrar modal
                onHide(); */
            })
            .catch(err => {
                console.log(err);
            });
        }
    };

    const handlerConsumibles = () => {
        // Guardar datos en sessionStorage para RepSalidas
        const dataToStore = {
            parte,
            linea_completa,
            volverConObservacion: true,
            observaciones_temp: datos.observaciones,
            filtro: filtro
        };
        sessionStorage.setItem('datos_salida', JSON.stringify(dataToStore));
        window.location.href = `/repuestos/salidas/`;
    };

    const handleClose = () => {
        if (onUpdateTarea) {
            onUpdateTarea();
        }
        onHide();
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            backdrop="static" 
            keyboard={false} 
            animation={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Conclusiones de la tarea</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        <Col>
                            <Form.Group id="observaciones">
                                <Form.Label>Conclusiones Personal Mantenimiento</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    name='observaciones' 
                                    value={datos.observaciones}
                                    onChange={handleInputChange} 
                                    placeholder="Conclusiones"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                {showConsumibles && (
                    <Button variant="info" onClick={handlerConsumibles}>
                        Consumibles
                    </Button>
                )}
                <Button variant="info" onClick={GuardarComentarios}>
                    Guardar Comentarios
                </Button>
            </Modal.Footer>
            <Modal.Footer>
                {showFinalizar && (
                    <Button variant="secondary" onClick={FinalizarTarea}>
                        Finalizar Tarea
                    </Button>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ObservacionesModal;