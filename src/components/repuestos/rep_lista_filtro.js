import React , { useState, useEffect } from "react";
import { Container, Row, Form } from 'react-bootstrap';

const RepListaFilto = ({actualizaFiltro}) => {
    const [datos, setDatos] = useState({
        nombre: ''
    });

    useEffect(()=>{
        const filtro = `?nombre__icontains=${datos.nombre}`
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
            <Row>
                <Form>
                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Nombre" />
                    </Form.Group>
                </Form>
            </Row>
        </Container>
     );
}
 
export default RepListaFilto;