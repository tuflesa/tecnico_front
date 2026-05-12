import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const RepPrecioEdit = ({show_modificar, updateRepuesto, setShowModificarProveedor, datos_precio}) => {
    const [token] = useCookies(['tec-token']);
    const [enviando, setEnviando] = useState(false);

    const [datos, setDatos] = useState({
        proveedor: datos_precio? datos_precio.proveedor.nombre:'',
        precio:datos_precio? datos_precio.precio:0,
        descuento:datos_precio? datos_precio.descuento:0,
        descripcion_proveedor: datos_precio? datos_precio.descripcion_proveedor: '',
        modelo_proveedor: datos_precio? datos_precio.modelo_proveedor: '',
        fabricante: datos_precio? datos_precio.fabricante: '',
    });

    useEffect(()=>{
        setDatos({
            proveedor: datos_precio? datos_precio.proveedor.nombre:'',
            precio:datos_precio? datos_precio.precio:0,
            descuento:datos_precio? datos_precio.descuento:0,
            descripcion_proveedor: datos_precio? datos_precio.descripcion_proveedor: '',
            modelo_proveedor: datos_precio? datos_precio.modelo_proveedor: '',
            fabricante: datos_precio? datos_precio.fabricante: '',
        })
    },[token, datos_precio]);

    const handlerActualizar = (event) => {
        event.preventDefault();
        if (enviando) return;// Bloquear doble clic
        setEnviando(true);
        axios.patch(BACKEND_SERVER + `/api/repuestos/precio/${datos_precio.id}/`, {
            precio: datos.precio,
            descuento: datos.descuento,
            descripcion_proveedor: datos.descripcion_proveedor,
            modelo_proveedor: datos.modelo_proveedor,
            fabricante: datos.fabricante,

        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            updateRepuesto(); 
            setShowModificarProveedor(false);
            handlerCancelar();
        })
        .catch(err => { 
            console.log(err);
            setEnviando(false);
        });
    }

    const handlerCancelar = () => {
        setShowModificarProveedor(false);
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Modal show={show_modificar} onHide={setShowModificarProveedor} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    <Modal.Title>Modificar Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group id="proveedor">
                                    <Form.Label>Proveedor</Form.Label>
                                    <Form.Control type="text" 
                                                name='proveedor' 
                                                value={datos.proveedor}
                                                onChange={handleInputChange} 
                                                placeholder="Proveedor"
                                                disabled="true"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="precio">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control type="text" 
                                                name='precio' 
                                                value={datos.precio}
                                                onChange={handleInputChange} 
                                                placeholder="Precio"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="descuento">
                                    <Form.Label>Descuento</Form.Label>
                                    <Form.Control type="text" 
                                                name='descuento' 
                                                value={datos.descuento}
                                                onChange={handleInputChange} 
                                                placeholder="Descuento"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="fabricante">
                                    <Form.Label>Fabricante</Form.Label>
                                    <Form.Control type="text" 
                                                name='fabricante' 
                                                value={datos.fabricante}
                                                onChange={handleInputChange} 
                                                placeholder="Fabricante"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="descripcion_proveedor">
                                    <Form.Label>Descirpción Proveedor</Form.Label>
                                    <Form.Control as="textarea"
                                                rows={2}
                                                name='descripcion_proveedor' 
                                                value={datos.descripcion_proveedor}
                                                onChange={handleInputChange} 
                                                placeholder="Descirpción proveedor"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="modelo_proveedor">
                                    <Form.Label>Modelo Proveedor</Form.Label>
                                    <Form.Control type="text" 
                                                name='modelo_proveedor' 
                                                value={datos.modelo_proveedor}
                                                onChange={handleInputChange} 
                                                placeholder="Modelo proveedor"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" onClick={handlerActualizar} disabled={enviando}>Actualizar</Button>
                    <Button variant="warning" onClick={handlerCancelar} disabled={enviando}>Cancelar</Button>
                </Modal.Footer>
        </Modal>
    );
}
export default RepPrecioEdit;