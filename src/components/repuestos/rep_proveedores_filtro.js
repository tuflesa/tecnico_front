import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';


const ProveedorFiltro = ({ actualizaFiltro }) => {
    const [datos, setDatos] = useState({
        nombre: '',
    });
    useEffect(()=>{
        const filtro = `?nombre__icontains=${datos.nombre}`;
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
                                        placeholder="Nombre contiene" 
                                        autoFocus />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default ProveedorFiltro;