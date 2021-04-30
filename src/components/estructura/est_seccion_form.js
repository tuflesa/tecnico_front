import React, { useState, useEffect } from 'react';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const EstSeccionForm = ({ seccion }) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: seccion.nombre,
        zona: seccion.zona,
        empresa: seccion.empresa_id
    });

    const [empresas, setEmpresas] = useState([]);
    const [zonas, setZonas] = useState([]);

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

    useEffect(()=>{
        // console.log(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`);
        // console.log('empresa: ' + datos.empresa + ' zona: ' + datos.zona + ' nombre: ' + datos.nombre);
        if (datos.empresa === '') {
            setZonas([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //console.log(res.data);
                setZonas(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.empresa + ' ' + datos.nombre + ' ' + datos.siglas)

        axios.put(BACKEND_SERVER + `/api/estructura/seccion/${seccion.id}/`, {
            nombre: datos.nombre,
            zona: datos.zona
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
        // console.log('Crear datos...' + datos.zona + ' ' + datos.nombre);
        
        axios.post(BACKEND_SERVER + `/api/estructura/seccion/`, {
            nombre: datos.nombre,
            zona: datos.zona
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
            {seccion.id ?
                <h5 className="pb-3 pt-3 mt-5">Editar Seccion</h5>:
                <h5 className="pb-3 pt-3 mt-5">Nueva Seccion</h5>}
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

                    <Form.Group controlId="zona">
                        <Form.Label>Zona</Form.Label>
                        <Form.Control as="select" 
                                      value={datos.zona}
                                      name='zona'
                                      onChange={handleInputChange}>
                            <option key={0} value={null}>-------</option>
                            {zonas && zonas.map( zona => {
                                return (
                                <option key={zona.id} value={zona.id}>
                                    {zona.nombre}
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

                    {seccion.id ? 
                        <Button variant="info" type="submit" onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" onClick={crearDatos}>Guardar</Button>
                    }
                    <Link to='/estructura/secciones'>
                        <Button variant="warning" >
                            Cancelar
                        </Button>
                    </Link>
                </Form>
            </Row>
        </Container>
    );
}
 
export default EstSeccionForm;