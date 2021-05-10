import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';

const AgenciaFiltro = ({ actualizaFiltro }) => {
    const [datos, setDatos] = useState({
        nombre: '',
        observaciones: ''
    });

    useEffect(()=>{
        const filtro = `?nombre__icontains=${datos.nombre}&observaciones__icontains=${datos.observaciones}`;
        actualizaFiltro(filtro);
        console.log(filtro);
    },[datos, actualizaFiltro]);

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
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre contiene" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="observaciones">
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control type="text" 
                                        name='observaciones' 
                                        value={datos.observaciones}
                                        onChange={handleInputChange} 
                                        placeholder="Observaciones contiene" />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default AgenciaFiltro;