import React, { useState, useEffect } from 'react';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const EstZonaForm = ({ zona }) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: zona.nombre,
        siglas: zona.siglas,
        empresa: zona.empresa
    });

    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.empresa + ' ' + datos.nombre + ' ' + datos.siglas)

        axios.put(BACKEND_SERVER + `/api/estructura/zona/${zona.id}/`, {
            nombre: datos.nombre,
            siglas: datos.siglas,
            empresa: datos.empresa
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
        console.log('Crear datos...' + datos.empresa + ' ' + datos.nombre + ' ' + datos.siglas)
        
        axios.post(BACKEND_SERVER + `/api/estructura/zona/`, {
            nombre: datos.nombre,
            siglas: datos.siglas,
            empresa: datos.empresa
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
            {zona.id ?
                <h5 className="pb-3 pt-3 mt-5">Editar Zona</h5>:
                <h5 className="pb-3 pt-3 mt-5">Nueva Zona</h5>}
            </Row>
            <Row className="justify-content-center">
                <Form>
                    <Form.Group controlId="empresa">
                        <Form.Label>Empresa</Form.Label>
                        <Form.Control as="select" 
                                      value={datos.empresa}
                                      name='empresa'
                                      onChange={handleInputChange}>
                            <option key={0} value={null}>-------</option>
                            {empresas && empresas.map( empresa => {
                                return (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>

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
                    {zona.id ? 
                        <Button variant="info" type="submit" onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" onClick={crearDatos}>Guardar</Button>
                    }
                    <Link to='/estructura/zonas'>
                        <Button variant="warning" >
                            Cancelar
                        </Button>
                    </Link>
                </Form>
            </Row>
        </Container>
    );
}
 
export default EstZonaForm;