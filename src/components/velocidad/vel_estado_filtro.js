import React from 'react';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Form } from 'react-bootstrap';

const EstadoFiltro = ({ actualizaFiltro, filtro }) => {
    const [user] = useCookies(['tec-user']);

    const handleInputChange = (event) => {
        actualizaFiltro({
            ...filtro,
            [event.target.name] : event.target.value
        })
    }

    return (
        <React.Fragment>
            <Container>
                <Form>
                    <Row>
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

export default EstadoFiltro;