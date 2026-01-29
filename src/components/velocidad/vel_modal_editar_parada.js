import React ,{ useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ModalEditarParada = ({ show, onHide, parada}) => {
    const [token] = useCookies(['tec-token']);
    const [nuevaObs, setNuevaObs] = useState('');
    const [codigoSel, setCodigoSel] = useState('');
    const [tipoSel, setTipoSel] = useState('');
    const [tipoParadas, setTipoParadas] = useState(null);
    const [codigoParada, setCodigoParada] = useState(null);

    useEffect(() => {
        if (show && parada) {
            setNuevaObs(parada.observaciones || '');
            setCodigoSel(parada.codigo_id || '');
            setTipoSel(parada.tipo_parada_id || '');
        }
    }, [parada, show]);

    useEffect(()=>{
        tipoSel && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos/?tipo_parada=${tipoSel}&zona=${parada.zona_id}`,{
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
    },[tipoSel]);

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

    if (!parada) return null;

    const handleGuardar = async () => {
        axios.patch(BACKEND_SERVER + `/api/velocidad/paradas/${parada.id}/`, {
            observaciones: nuevaObs,
            codigo: parseInt(codigoSel)
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(r => {
            onHide();
        })
        .catch(err => {
            console.error("Error al actualizar la parada", err);
        });
        
    };

    return (
        <Container>
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Editar Parada</Modal.Title>
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
                        </svg>
                    </div>
                    <Form>
                        <Row>
                            <Col>
                                    <Form.Group controlId="tipoparada">
                                        <Form.Label>Tipo Parada</Form.Label>
                                        <Form.Control as="select"  
                                                    name='tipoparada' 
                                                    value={tipoSel}
                                                    //onChange={handleInputChangeTipo}
                                                    onChange={(e) => setTipoSel(e.target.value)}
                                                    placeholder="Tipo parada">
                                                    <option key={0} value={''}>Selecciona una opción</option>
                                                    {tipoParadas && tipoParadas.map( tipo => {
                                                        return (
                                                        <option
                                                            key={tipo.id}
                                                            value={tipo.id}
                                                            data-nombre={tipo.nombre}
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
                                                    value={codigoSel}
                                                    onChange={(e) => setCodigoSel(e.target.value)}
                                                    placeholder="Codigo parada"
                                                    disabled={tipoSel?false:true}>
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
                        <Form.Group className="mb-3">
                            <Form.Label><strong>Observaciones:</strong></Form.Label>
                            <Form.Control as="textarea" rows={2} value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                    <div>
                        <Button variant="primary" onClick={handleGuardar}>Guardar cambios</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalEditarParada;