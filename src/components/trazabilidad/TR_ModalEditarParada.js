import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form } from 'react-bootstrap';

const ModalEditarParada = ({ show, onHide, observacion, showObs, onHideObs, parada }) => {
    // Estado local para las observaciones
    const [nuevaObs, setNuevaObs] = useState('');

    // Sincronizar el estado local cuando cambia la parada seleccionada
    useEffect(() => {
        if (parada) {
            setNuevaObs(parada.observaciones || '');
        }
    }, [parada]);

    if (!parada && show) return null; // Por si no hay parada seleccionada que no de error
    
    const handleGuardar = () => {
        console.log("Guardando modificación");
        onHide(); // Cierra el modal tras guardar
    };

    const handleIncidencia = () => {
        console.log("Añadiendo incidencia a parada:");
    };

    const handleAveria = () => {
        console.log("Añadiendo avería a parada:");
    };

    return (
        <Container>
           <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edición de la Parada</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                            {/* Ahora estas propiedades sí existirán */}
                            <span><strong>Inicio:</strong> {parada?.fechaInicio} {parada?.horaInicio}</span>
                            <span><strong>Fin:</strong> {parada?.fechaFin} {parada?.horaFin}</span>
                        </div>
                        
                        <svg width="100%" height="40">
                            <rect
                                x="0"
                                y="5"
                                width="100%"
                                height="30"
                                fill={parada?.color || "#2e2cba"}
                                stroke="#333"
                                strokeWidth="1"
                                rx="4"
                            />
                        </svg>
                        <div style={{ textAlign: 'center', marginTop: '5px' }}>
                            <small className="text-muted">
                                Duración: {Number(parada?.duracion).toFixed(2)}
                            </small>
                        </div>
                    </div>

                    <p><strong>Observaciones:</strong></p>
                    <p>{parada?.observaciones || "Sin observaciones"}</p>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={onHide}>
                        Cerrar
                    </Button>
                    <div>
                        <Button variant="outline-warning" className="me-2" onClick={handleIncidencia}>
                            Añadir Incidencia
                        </Button>
                        <Button variant="outline-danger" className="me-2" onClick={handleAveria}>
                            Añadir Avería
                        </Button>
                        <Button variant="primary" onClick={handleGuardar}>
                            Guardar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal show={showObs} onHide={onHideObs} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Observaciones de la Parada</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{observacion}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHideObs}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalEditarParada;