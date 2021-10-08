import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const PedidosFiltro = ({ actualizaFiltro }) => {
    const [datos, setDatos] = useState({
        nombre: '',
        fecha_creacion_lte:'',
        fecha_creacion_gte:''

    });

    useEffect(()=>{
        const filtro = `?proveedor__nombre__icontains=${datos.nombre}&fecha_creacion__lte=${datos.fecha_creacion_lte}&fecha_creacion__gte=${datos.fecha_creacion_gte}`;
        actualizaFiltro(filtro);
    },[datos, actualizaFiltro]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre Proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre contiene" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_creacion_gte">
                            <Form.Label>Fecha Creación Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_gte' 
                                        value={datos.fecha_creacion_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_creacion_lte">
                            <Form.Label>Fecha Creación Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_lte' 
                                        value={datos.fecha_creacion_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación anterior a..." />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default PedidosFiltro;