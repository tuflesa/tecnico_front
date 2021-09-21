import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { linkVertical } from 'd3-shape';

const RepAlmacenForm = ({nombre, empresa, almacen_id}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        almacen_id: almacen_id,
        nombre: nombre,
        empresa: empresa
    });
    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        });
        // console.log(datos);
    }
    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + almacen_id + ' ' + datos.nombre + ' ' + datos.empresa)

        axios.put(BACKEND_SERVER + `/api/repuestos/almacen/${almacen_id}/`, {
            nombre: datos.nombre,
            empresa: datos.empresa
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/repuestos/almacenes/";
        })
        .catch(err => { console.log(err);})
        
    }
    const nuevoDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + almacen_id + ' ' + datos.nombre + ' ' + datos.empresa)

        axios.post(BACKEND_SERVER + `/api/repuestos/almacen/`, {
            nombre: datos.nombre,
            empresa: datos.empresa
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/repuestos/almacenes/";
        })
        .catch(err => { console.log(err);})
        
    }


    return (
        <Container>
            <Row className="justify-content-center"> 
            {almacen_id ?
                <h5 className="pb-3 pt-1 mt-2">Almacen Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Almacen</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Form >
                    <Row>
                        <Col>
                            <Form.Group controlId="empresa">
                                <Form.Label>Empresa</Form.Label>
                                <Form.Control as="select"  
                                            name='empresa' 
                                            value={datos.empresa}
                                            onChange={handleInputChange}
                                            placeholder="Empresa">
                                            {empresas && empresas.map( empresa => {
                                                return (
                                                <option key={empresa.id} value={empresa.id}>
                                                    {empresa.nombre}
                                                </option>
                                                )
                                            })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="nombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Nombre"
                                />
                                </Form.Group>
                        </Col>
                    </Row>
                    </Form>
                </Col>
            </Row>
            <Form.Row className="justify-content-center">                
                {almacen_id ?
                    <Button variant="info" type="submit" className={'mr-1'} onClick={actualizarDatos}>Actualizar</Button> :
                    <Button variant="info" type="submit" className={'mr-1'} onClick={nuevoDatos}>Guardar</Button>
                }                       
                <Link to='/repuestos/almacenes'>
                    <Button variant="warning" className={'ml-1'} >
                        Cancelar
                    </Button>
                </Link>
            </Form.Row>
        </Container>
    )
}

export default RepAlmacenForm;