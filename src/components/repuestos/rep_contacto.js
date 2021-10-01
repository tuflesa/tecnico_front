import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ContactoForm = ({show, proveedor_id}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: '',
        departamento:'',
        telefono:'',
        email:'',

    });
    const [contactos, setContactos] = useState(null);
   
    useEffect(()=>{
        axios.put(BACKEND_SERVER + `/api/repuestos/proveedor/${proveedor_id}/`,{
            nombre: datos.nombre,
            telefono: datos.telefono,
            departamento: datos.departamento,
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            console.log('esto es res de contacto' + res);
            window.location.href="/repuestos/proveedores/";
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);
    console.log('cogiendo nuevos datos');
    console.log(datos);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }
    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Añadir Contacto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="nombre2">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange}
                                                placeholder="Nombre">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="departamento">
                                    <Form.Label>Departamento</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='departamento' 
                                                value={datos.departamento}
                                                onChange={handleInputChange}
                                                placeholder="Departamento">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='correo_electronico' 
                                                value={datos.email}
                                                onChange={handleInputChange}
                                                placeholder="Email">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="telefono">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='telefono' 
                                                value={datos.telefono}
                                                onChange={handleInputChange}
                                                placeholder="Telefono">  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" 
                        /* onClick={handlerGuardar} */>
                        Guardar
                    </Button>
                    <Button variant="waring" /* onClick={handlerCancelar} */>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    );
}

export default ContactoForm;