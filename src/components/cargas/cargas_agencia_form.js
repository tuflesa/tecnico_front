import React, { useState } from 'react';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const CargasAgenciaForm = ({ agencia }) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: agencia.nombre,
        telefono: agencia.telefono,
        contacto: agencia.contacto,
        observaciones: agencia.observaciones
    });

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.nombre + ' ' + datos.contacto)

        axios.put(BACKEND_SERVER + `/api/cargas/agencia/${agencia.id}/`, {
            nombre: datos.nombre,
            telefono: datos.telefono,
            contacto: datos.contacto,
            observaciones: datos.observaciones
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/cargas/agencias";
        })
        .catch(err => { console.log(err);})
        
    }

    const crearDatos = (event) => {
        event.preventDefault()
        // console.log('Crear datos...' + datos.nombre + ' ' + datos.contacto)
        
        axios.post(BACKEND_SERVER + `/api/cargas/agencia/`, {
            nombre: datos.nombre,
            telefono: datos.telefono,
            contacto: datos.contacto,
            observaciones: datos.observaciones
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/cargas/agencias";
        })
        .catch(err => { console.log(err);})
    }

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return ( 
        <Container>
            <Row className="justify-content-center"> 
            {agencia.id ?
                <h5 className="pb-3 pt-3 mt-5">Editar Agencia</h5>:
                <h5 className="pb-3 pt-3 mt-5">Nueva Agencia</h5>}
            </Row>
            <Row className="justify-content-center">
                <Form>
                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Nombre" />
                    </Form.Group>

                    <Form.Group controlId="telefono">
                        <Form.Label>Telefono</Form.Label>
                        <Form.Control type="text" 
                                    name='telefono' 
                                    value={datos.telefono}
                                    onChange={handleInputChange} 
                                    placeholder="Telefono" />
                    </Form.Group>

                    <Form.Group controlId="contacto">
                        <Form.Label>Contacto</Form.Label>
                        <Form.Control type="text" 
                                    name='contacto' 
                                    value={datos.contacto}
                                    onChange={handleInputChange} 
                                    placeholder="Persona de contacto" />
                    </Form.Group>

                    <Form.Group controlId="observaciones">
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control type="text" 
                                    name='observaciones' 
                                    value={datos.observaciones}
                                    onChange={handleInputChange} 
                                    placeholder="Observaciones" />
                    </Form.Group>

                    {agencia.id ? 
                        <Button variant="info" type="submit" onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" onClick={crearDatos}>Guardar</Button>
                    }
                    <Link to='/cargas/agencias'>
                        <Button variant="warning" >
                            Cancelar
                        </Button>
                    </Link>
                </Form>
            </Row>
        </Container>
    );
}
 
export default CargasAgenciaForm;