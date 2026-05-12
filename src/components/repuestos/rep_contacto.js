import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ContactoForm = ({show, proveedor_id, handleCloseContacto, updateProveedorCont,contacto, AnularContacto}) => {

    const [token] = useCookies(['tec-token']);
    const [enviando, setEnviando] = useState(false);
    
    const [datos, setDatos] = useState({  
        nombre: '',
        departamento:'',
        telefono:'',
        correo_electronico:'',        
        proveedor: proveedor_id
    });

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{
        contacto && setDatos({
            nombre: contacto.nombre,
            departamento: contacto.departamento,
            telefono: contacto.telefono,
            correo_electronico:contacto.correo_electronico,        
            proveedor: proveedor_id
        });
    },[contacto]);
    /* eslint-disable react-hooks/exhaustive-deps */

    const handlerCancelar = () => {
        AnularContacto();
        setDatos({
            ...datos,
            nombre: '',
            departamento:'',
            telefono:'',
            correo_electronico:'',
            proveedor: proveedor_id,
        });  
        
        handleCloseContacto();
    } 

    const handlerGuardar = () => {
        if (enviando) return;
        setEnviando(true);
        axios.post(BACKEND_SERVER + `/api/repuestos/contacto/`,{
            nombre: datos.nombre,
            telefono: datos.telefono,
            departamento: datos.departamento,
            correo_electronico: datos.correo_electronico,
            proveedor: datos.proveedor,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            updateProveedorCont();    
            handlerCancelar();
        })
        .catch( err => {   
            console.log(err);
            setEnviando(false);        
            handlerCancelar();
        });
    }
    const ActualizarContacto = (id) =>{
        if (enviando) return;
        setEnviando(true);
        axios.put(BACKEND_SERVER + `/api/repuestos/contacto/${contacto.id}/`,{              
            nombre: datos.nombre,
            departamento: datos.departamento,
            telefono: datos.telefono,
            correo_electronico: datos.correo_electronico,
            proveedor: proveedor_id,},
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            } 
        })
        .then(res =>{
            updateProveedorCont();
            handlerCancelar();
        })
        .catch (err=>{
            console.log((err));
            setEnviando(false);
        });
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    {contacto ?                    
                        <Modal.Title>Actualizar Contacto</Modal.Title> : <Modal.Title>Añadir Contacto</Modal.Title>
                    }
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="nombre">
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
                                                value={datos.correo_electronico}
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
                    {contacto ?  
                        <Button variant="info" onClick={ActualizarContacto} disabled={enviando} > Actualizar </Button> :
                        <Button variant="info" onClick={handlerGuardar} disabled={enviando} > Guardar </Button>
                    }                    
                    <Button variant="warning" onClick={handlerCancelar} disabled={enviando} >
                        Cancelar
                    </Button>
                    {/* </Link> */}
                </Modal.Footer>
        </Modal>

    );
}

export default ContactoForm;