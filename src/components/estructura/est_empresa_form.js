import React, { useState } from 'react';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const EstEmpresaForm = ({ empresa }) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: empresa.nombre,
        siglas: empresa.siglas
    });

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.nombre + ' ' + datos.siglas)

        axios.put(BACKEND_SERVER + `/api/estructura/empresa/${empresa.id}/`, {
            nombre: datos.nombre,
            siglas: datos.siglas
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { console.log(res);})
        .catch(err => { console.log(err);})
        
    }

    const crearDatos = (event) => {
        event.preventDefault()
        console.log('Crear datos...' + datos.nombre + ' ' + datos.siglas)
        
        axios.post(BACKEND_SERVER + `/api/estructura/empresa/`, {
            nombre: datos.nombre,
            siglas: datos.siglas
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { console.log(res);})
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
            {empresa.id ?
                <h5 className="pb-3 pt-3 mt-5">Editar Empresa</h5>:
                <h5 className="pb-3 pt-3 mt-5">Nueva Empresa</h5>}
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

                    <Form.Group controlId="formSiglas">
                        <Form.Label>Siglas</Form.Label>
                        <Form.Control type="text" 
                                    name='siglas' 
                                    value={datos.siglas}
                                    onChange={handleInputChange} 
                                    placeholder="Siglas" />
                    </Form.Group>
                    {empresa.id ? 
                        <Button variant="info" type="submit" onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" onClick={crearDatos}>Guardar</Button>
                    }
                    <Link to='/estructura/empresas'>
                        <Button variant="warning" >
                            Cancelar
                        </Button>
                    </Link>
                </Form>
            </Row>
        </Container>
    );
}
 
export default EstEmpresaForm;