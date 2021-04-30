import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const EstEquipoForm = ({ equipo }) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        nombre: equipo.nombre,
        seccion: equipo.seccion,
        zona: equipo.zona_id,
        empresa: equipo.empresa_id,
        fabricante: equipo.fabricante,
        modelo: equipo.modelo,
        numero: equipo.numero,
        imagen: equipo.imagen
    });

    const [empresas, setEmpresas] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);

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
        if (datos.empresa === '' || datos.empresa === undefined) {
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

    useEffect(()=>{
        // console.log(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`);
        // console.log('empresa: ' + datos.empresa + ' zona: ' + datos.zona + ' seccion: ' + datos.seccion + ' nombre: ' + datos.nombre);
        if (datos.zona === '' || datos.zona===undefined) {
            setSecciones([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //console.log(res.data);
                setSecciones(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    const actualizarDatos = (event) => {
        event.preventDefault()
        // console.log('Actualizar datos...' datos.empresa + datos.zona + datos.seccion + ' ' + datos.nombre)
        const updateData = new FormData();
        updateData.append('nombre', datos.nombre);
        updateData.append('seccion', datos.seccion);
        updateData.append('fabricante', datos.fabricante);
        updateData.append('modelo', datos.modelo);
        updateData.append('numero', datos.numero);
        if (datos.file){
            updateData.append('imagen', datos.file);
        }

        axios.put(BACKEND_SERVER + `/api/estructura/equipo/${equipo.id}/`, updateData, {
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
        const updateData = new FormData();
        updateData.append('nombre', datos.nombre);
        updateData.append('seccion', datos.seccion);
        updateData.append('fabricante', datos.fabricante);
        updateData.append('modelo', datos.modelo);
        updateData.append('numero', datos.numero);
        if (datos.file){
            updateData.append('imagen', datos.file);
        }
        axios.post(BACKEND_SERVER + `/api/estructura/equipo/`, updateData, {
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

    const fileInputHandler = event => {
        console.log(event.target.files[0]);
        setDatos({
            ...datos,
            file: event.target.files[0],
            imagen: URL.createObjectURL(event.target.files[0])
        })

    }

    return ( 
        <Container>
            <Row className="justify-content-center"> 
            {equipo.id ?
                <h5 className="pb-1 pt-1 mt-1">Editar Equipo</h5>:
                <h5 className="pb-1 pt-1 mt-1">Nuevo Eqquipo</h5>}
            </Row>
            <Row className="justify-content-center">
                {datos.imagen ?
                    <Image src={datos.imagen} width="200" height="150" /> :
                    null}
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

                    <Form.Group controlId="seccion">
                        <Form.Label>Seccion</Form.Label>
                        <Form.Control as="select" 
                                      value={datos.seccion}
                                      name='seccion'
                                      onChange={handleInputChange}>
                            <option key={0} value={null}>-------</option>
                            {secciones && secciones.map( seccion => {
                                return (
                                <option key={seccion.id} value={seccion.id}>
                                    {seccion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Row>
                        <Col>
                            <Form.Group controlId="formNombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Nombre" />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="fabricante">
                                <Form.Label>Fabricante</Form.Label>
                                <Form.Control type="text" 
                                            name='fabricante' 
                                            value={datos.fabricante ? datos.fabricante : ''}
                                            onChange={handleInputChange} 
                                            placeholder="Fabricante" />
                            </Form.Group>
                        </Col>
                    </Form.Row>

                    <Form.Row>
                        <Col>
                            <Form.Group controlId="modelo">
                                <Form.Label>Modelo</Form.Label>
                                <Form.Control type="text" 
                                            name='modelo' 
                                            value={datos.modelo ? datos.modelo : ''}
                                            onChange={handleInputChange} 
                                            placeholder="Modelo" />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="numero">
                                <Form.Label>Nº Serie</Form.Label>
                                <Form.Control type="text" 
                                            name='numero' 
                                            value={datos.numero ? datos.numero : ''}
                                            onChange={handleInputChange} 
                                            placeholder="Nº Serie" />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Group>
                        <Form.File id="imagen" 
                                   label="Imagen"
                                   onChange={fileInputHandler} />
                    </Form.Group>
                    <Form.Row className="justify-content-center">
                        {equipo.id ? 
                            <Button variant="info" type="submit" onClick={actualizarDatos}>Actualizar</Button> :
                            <Button variant="info" type="submit" onClick={crearDatos}>Guardar</Button>
                        }
                        <Link to='/estructura/equipos'>
                            <Button variant="warning" >
                                Cancelar
                            </Button>
                        </Link>
                    </Form.Row>
                </Form>
            </Row>
        </Container>
    );
}
 
export default EstEquipoForm;