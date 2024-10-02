import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodModificarInstancia = ({show, handlerClose, instancia}) => {
    const [token] = useCookies(['tec-token']);
    const [materiales, setMateriales] = useState([]);
    const [datos, setDatos] = useState({
        id: instancia.id? instancia.id:null,
        nombre: instancia.id?instancia.nombre:'',
        rodillo: instancia.id?instancia.rodillo.id:'',
        material: instancia.id?instancia.material.id:'',
        especial: instancia.id?instancia.especial:'',
        diametroFG: instancia.id?instancia.diametro:'',
        diametroEXT: instancia.id?instancia.diametro_ext:'',
        activa_qs:instancia.id?instancia.activa_qs:'',
        obsoleta: instancia.id?instancia.obsoleta:'',
    });
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/materiales/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setMateriales(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const ModificarInstancia = () => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/instancia_nueva/${instancia.id}/`, {
            material: datos.material,
            especial: datos.especial,
            diametro: datos.diametroFG,
            diametro_ext: datos.diametroEXT,
            activa_qs: datos.activa_qs,
            obsoleta: datos.obsoleta,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then(r => {
            window.location.href = `/rodillos/editar/${instancia.rodillo.id}`;
        })
        .catch(err => { 
            alert('NO SE ACTUALIZA LA INSTANCIA, REVISAR');
            console.log(err);
        });
    }   

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_qs = (event) => {
        setDatos({
            ...datos,
            activa_qs:!datos.activa_qs
        })
    }

    const handleInputChange_obsoleta = (event) => {
        setDatos({
            ...datos,
            obsoleta:!datos.obsoleta
        })
    }

    const cerrarInstancia = () => {
        window.location.href = `/rodillos/editar/${instancia.rodillo.id}`;
    }

    return(
        <Modal show={show} onHide={handlerClose} backdrop="static" keyboard={false} animation={false}>
            <Modal.Body>
                <Row>
                    <Col>
                        <h5>Modificar instancia al rodillo</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formSelectTrueFalse">
                            <Form.Label>¿La instancia del rodillo es especial?</Form.Label>
                            <Form.Control as="select" onChange={handleInputChange} name='especial'>
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formSelectFromVariable">
                            <Form.Label>Selecciona el material</Form.Label>
                            <Form.Control as="select" value={datos.material} name="material" onChange={handleInputChange}>
                                <option value="">Selecciona una opción</option> {/* Opción predeterminada */}
                                {materiales.map((opcion, index) => (
                                    <option key={index} value={opcion.id}>
                                        {opcion.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro">
                            <Form.Label>Introduce el diámetro de FG</Form.Label>
                            <Form.Control
                                name="diametroFG"
                                type="text"
                                placeholder="Introduce el Ø FG"
                                value={datos.diametroFG}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro_ext">
                            <Form.Label>Introduce el diámetro de EXT</Form.Label>
                            <Form.Control
                                name="diametroEXT"
                                type="text"
                                placeholder="Introduce el Ø EXT"
                                value={datos.diametroEXT}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="activa_qs">
                            <Form.Check type="checkbox" 
                                        name='activa_qs'
                                        label="¿Activa en QS?"
                                        checked = {datos.activa_qs}
                                        onChange = {handleInputChange_qs} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="obsoleta">
                            <Form.Check type="checkbox" 
                                        label="obsoleta"
                                        checked = {datos.obsoleta}
                                        onChange = {handleInputChange_obsoleta} />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={ModificarInstancia}>Modificar</Button>
                <Button variant="warning" onClick={cerrarInstancia}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodModificarInstancia;