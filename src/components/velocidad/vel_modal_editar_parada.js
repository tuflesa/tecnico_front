import React ,{ useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ModalEditarParada = ({ show, onHide, parada}) => {
    const [token] = useCookies(['tec-token']);
    const [nuevaObs, setNuevaObs] = useState('');
    const [codigoSel, setCodigoSel] = useState('');
    const [seleTipoParada, setseleTipoParada] = useState('');
    const [tipoParadas, setTipoParadas] = useState(null);
    const [codigoParada, setCodigoParada] = useState(null);
    const [palabra_seleccionada, setPalabraSeleccionada] = useState(null);
    const [palabrasClave, setPalabrasClave] = useState(null);
    const [tipoNombre, setTipoNombre] = useState('');

    useEffect(() => {
        if (show && parada) {
            setNuevaObs(parada.observaciones || '');
            setCodigoSel(parada.codigo_id || '');
            setseleTipoParada(parada.tipo_parada_id || '');
            setPalabraSeleccionada(parada.palabraclave_id || '');
            setTipoNombre(parada.tipo_parada_nombre);
        }
    }, [parada, show]);

    useEffect(()=>{
        seleTipoParada && palabra_seleccionada && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos/?tipo_parada=${seleTipoParada}&zona=${parada.zona_id}&palabra_clave=${palabra_seleccionada}`,{
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
    },[palabra_seleccionada]);

    useEffect(()=>{ //recogemos las palabras clave   
        (tipoNombre==='Incidencia' || tipoNombre==='Avería') && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_palabraclave/?zona=${parada.zona_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPalabrasClave(res.data);
        })
        .catch( err => {
            console.log(err);
        });
        tipoNombre!=='Incidencia' && tipoNombre!=='Avería' && seleTipoParada && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos_resto/?tipo_parada=${seleTipoParada}&zona=${parada.zona_id}`,{
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

    },[seleTipoParada]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/velocidad/tipoparada`,{
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

    const handleCerrar = () => {
        setTipoNombre('');
        setseleTipoParada('');
        setPalabraSeleccionada(null);
        setPalabrasClave(null);
        setCodigoParada(null);
        onHide();
    }

    const handleInputChangeTipo = (e) => {
        const { value } = e.target;
        if (value) {
            const [id, nombre] = value.split('|');
            setseleTipoParada(id);
            setTipoNombre(nombre);
        };
        
        setPalabraSeleccionada(null);
        setPalabrasClave(null);
        setCodigoParada(null);
    }

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
                                                value={`${seleTipoParada}|${tipoNombre}`}
                                                onChange={handleInputChangeTipo}>
                                                <option key={-0} value={''}>Selecciona una opción</option>
                                                {tipoParadas && tipoParadas.map( tipo => {
                                                    return (
                                                    <option
                                                        key={tipo.id}
                                                        value={`${tipo.id}|${tipo.nombre}`}
                                                    >
                                                        {tipo.nombre}
                                                    </option>
                                                    )
                                                })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                {(tipoNombre==='Incidencia' || tipoNombre==='Avería')?
                                    <Col>
                                        <Form.Group controlId="palabraclave">
                                            <Form.Label>Palabra clave</Form.Label>
                                            <Form.Control as="select"  
                                                        name='palabraclave' 
                                                        value={palabra_seleccionada}
                                                        onChange={(e) => setPalabraSeleccionada(e.target.value)}
                                                        placeholder="Palabra clave"
                                                        disabled={seleTipoParada?false:true}>
                                                        <option key={0} value={''}>Selecciona una opción</option>
                                                        {palabrasClave && palabrasClave.map( codigo => {
                                                            return (
                                                            <option key={codigo.id} value={codigo.id}>
                                                                {codigo.nombre}
                                                            </option>
                                                            )
                                                        })}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                :''}
                                <Col>
                                    <Form.Group controlId="codigoparada">
                                        <Form.Label>Codigo Parada</Form.Label>
                                        <Form.Control as="select"  
                                                    name='codigoparada' 
                                                    value={codigoSel}
                                                    onChange={(e) => setCodigoSel(e.target.value)}
                                                    placeholder="Codigo parada">
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
                    <Button variant="secondary" onClick={handleCerrar}>Cerrar</Button>
                    <div>
                        <Button variant="primary" onClick={handleGuardar}>Guardar cambios</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalEditarParada;