import React from 'react';
import Logout from './logout';
import {Container, Row, Col, Card, Button, Navbar, Form } from 'react-bootstrap';
import {Link } from "react-router-dom";
import estructura from '../images/estructura.jpg';
import repuestos from '../images/repuestos.jpg';

const Home = () => {

    return ( 
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand>Departamento Técnico</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Form inline>
                        <Logout />
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            <Container className="mt-4" >
                <Row className="justify-content-md-center">
                    <Col>
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src={estructura} width="500" height="140"/>
                            <Card.Body>
                                <Card.Title>Estructura</Card.Title>
                                <Card.Text>
                                App que describe la estructura del Grupo Bornay: Empresas, Zonas, Secciones y Equipos ...
                                </Card.Text>
                                <Link to="/estructura">
                                    <Button variant="info" block>Abrir</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col> 
                    <Col>
                        <Card style={{ width: '18rem' }}>
                        <Card.Img variant="top" src={repuestos} width="500" height="140"/>
                            <Card.Body>
                                <Card.Title>Repuestos</Card.Title>
                                <Card.Text>
                                App de gestión de repuestos del Grupo Bornay: Repuestos, Pedidos, Almacenes ...
                                </Card.Text>
                                <Link to="/repuestos">
                                    <Button variant="info" block>Abrir</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    )
}

export default Home;