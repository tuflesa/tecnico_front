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
    const [tipoSiglas, setTipoSiglas] = useState('');
    const [listado_ordenes, setListadoOrdenes] = useState(null);
    const [IdOF, setIdOF] = useState(null);
    const [idPos, setIdPos] = useState(null);
    const [codigo_R_ProdDB, setCodigo_R_ProdDB] = useState('');
    const [descripcionProdDB, setdescripcionProdDB] = useState('');

    useEffect(() => {
        if (!seleTipoParada || !parada?.zona_id) return;

        Promise.all([
            axios.get(BACKEND_SERVER + `/api/velocidad/buscar_montajes_of/?zona_id=${parada.zona_id}&tipo_parada_siglas=${tipoSiglas}`, {
                headers: { 'Authorization': `token ${token['tec-token']}` }
            }),
            axios.get(BACKEND_SERVER + `/api/velocidad/parada_produccion_db/?parada=${parada.id}`, {
                headers: { 'Authorization': `token ${token['tec-token']}` }
            })
        ])
        .then(([resMontajes, resProdDB]) => {
            setListadoOrdenes(resMontajes.data.montajes);
            setIdOF(resMontajes.data.xIdOF);
            setIdPos(resMontajes.data.xIdPos);

            const ordenOf = resProdDB.data?.[0]?.orden_of;
            if (ordenOf && resMontajes.data.montajes) {
                const ordenExistente = resMontajes.data.montajes.find(o => o.xIdParada === ordenOf);
                if (ordenExistente) {
                    setCodigo_R_ProdDB(ordenExistente.xIdParada);
                    setdescripcionProdDB(ordenExistente.xDescripcion);
                }
            }
        })
        .catch(err => console.log(err));
    }, [seleTipoParada, tipoSiglas]);

    useEffect(() => {
        if (show && parada) {
            setNuevaObs(parada.observaciones || '');
            setCodigoSel(parada.codigo_id || '');
            setseleTipoParada(parada.tipo_parada_id || '');
            setPalabraSeleccionada(parada.palabraclave_id || '');
            setTipoNombre(parada.tipo_parada_nombre);
            setTipoSiglas(parada.tipo_parada_nombre === 'Incidencia'?'I':parada.tipo_parada_nombre === 'Avería'?'A':parada.tipo_parada_nombre === 'Cambio'?'R':'');
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
        await axios.put( BACKEND_SERVER + `/api/velocidad/actualizar_parada/`,{
            parada: parada.id,
            parada_nombre: parada.tipo_parada_nombre,
            tipoSiglas: tipoSiglas,
            codigo: parseInt(codigoSel),
            nuevaObs: nuevaObs,
            codigoSel: codigoSel,
            xIdParada_R: codigo_R_ProdDB,
            nueva_parada_nombre: tipoNombre,
            },
            { headers: { Authorization: `token ${token["tec-token"]}` } }
        )
        .then(res => {
            console.log('patch hecho: ', res.data);
        })
        .catch (err => {
            console.log(err);
        })
        axios.patch(BACKEND_SERVER + `/api/velocidad/paradas/${parada.id}/`, {
            observaciones: nuevaObs,
            codigo: parseInt(codigoSel),
            of: IdOF
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
        setTipoSiglas(null);
        setseleTipoParada(null);
        setPalabraSeleccionada(null);
        setPalabrasClave(null);
        setCodigoParada(null);
        onHide();
        setListadoOrdenes(null);
        setIdOF(null);
        setIdPos(null);
        setCodigo_R_ProdDB('');
        setdescripcionProdDB('');
    }

    const handleInputChangeTipo = (e) => {
        const { value } = e.target;
        if (value) {
            const [id, nombre, siglas] = value.split('|');
            setseleTipoParada(id);
            setTipoNombre(nombre);
            setTipoSiglas(siglas);
        };
        
        setPalabraSeleccionada(null);
        setPalabrasClave(null);
        setCodigoParada(null);
        setListadoOrdenes(null);
        setIdOF(null);
        setIdPos(null);
        setCodigo_R_ProdDB('');
        setdescripcionProdDB('');
    }

    const handleInputChangeOrdenes = (e) => {
        const { value } = e.target;
        if (value) {
            const [codigoBD, descripcionBD] = value.split('|');
            setCodigo_R_ProdDB(codigoBD);
            setdescripcionProdDB(descripcionBD);
        }
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
                                                value={`${seleTipoParada}|${tipoNombre}|${tipoSiglas}`}
                                                onChange={handleInputChangeTipo}
                                                disabled={tipoNombre==='Cambio'?true:false}>
                                                <option key={-0} value={''}>Selecciona una opción</option>
                                                {tipoParadas && tipoParadas.map( tipo => {
                                                    return (
                                                    <option
                                                        key={tipo.id}
                                                        value={`${tipo.id}|${tipo.nombre}|${tipo.siglas}`}
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
                                :tipoNombre === 'Cambio' ? 
                                    <Col>
                                        <Form.Group controlId="ordenes">
                                            <Form.Label>Listado de Ordenes</Form.Label>
                                            <Form.Control as="select"
                                                        name='ordenes'
                                                        value={`${codigo_R_ProdDB}|${descripcionProdDB}`}
                                                        onChange={handleInputChangeOrdenes}
                                                        disabled={!seleTipoParada}>
                                                        <option key="__default__" value=''>Selecciona una opción</option>
                                                        {Array.isArray(listado_ordenes) && listado_ordenes.map(orden => (
                                                            <option key={orden.xIdParada} value={`${orden.xIdParada}|${orden.xDescripcion}`}>
                                                                {orden.xDescripcion}
                                                            </option>
                                                        ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                : ''}
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