import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';

const VelocidadFiltro = ({ actualizaFiltro, filtro }) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
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

    const handleInputChange = (event) => {
        actualizaFiltro({
            ...filtro,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    return (
        <React.Fragment>
            <Container>
                <Form>
                    <Row>
                        <Col sm='12' md='3' >
                            <Form.Group controlId="empresa">
                                <Form.Label>Empresa</Form.Label>
                                <Form.Control as="select" 
                                                value={filtro.empresa}
                                                name='empresa'
                                                onChange={handleInputChange}
                                                disabled={handleDisabled()}>
                                    <option key={0} value={''}>-------</option>
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
                        <Col sm='6' md='3'>
                            <Form.Group controlId="fecha_inicio">
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control type="date" 
                                                name='fecha'
                                                value={filtro.fecha}
                                                onChange={handleInputChange}  />
                            </Form.Group>
                        </Col>
                        <Col xs='6' sm='3' md='3'>
                            <Form.Group controlId="hora_inicio">
                                <Form.Label>Hora inicio</Form.Label>
                                <Form.Control type="time" 
                                                name='hora_inicio'
                                                value={filtro.hora_inicio}
                                                onChange={handleInputChange}  />
                            </Form.Group>
                        </Col>
                        <Col xs='6' sm='3' md='3'>
                            <Form.Group controlId="hora_fin">
                                <Form.Label>Hora fin</Form.Label>
                                <Form.Control type="time" 
                                                name='hora_fin'
                                                value={filtro.hora_fin}
                                                onChange={handleInputChange}  />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </React.Fragment>
    )
}

export default VelocidadFiltro;