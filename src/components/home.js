import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../constantes';
import Logout from './logout';
import {Container, Row, Col, Card, Button, Navbar, Form } from 'react-bootstrap';
import {Link } from "react-router-dom";
import useInterval from './utilidades/use_interval';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [token, , deleteToken] = useCookies(['tec-token']);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/administracion/roles/', {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            console.log(res.data.sort(function(a, b){
                if(a.url > b.url){
                    return 1;
                }
                if(a.url < b.url){
                    return -1;
                }
                return 0;
            }))
            setApps(res.data);
        })
    },[token]);

    const logout = () => {
        deleteToken('tec-token', {path: '/'});
    }

    useInterval(logout, 60000);

    return ( 
        <React.Fragment>
            <Navbar bg="light" fixed= 'top'>
                <Navbar.Brand>Departamento Técnico</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Form inline>
                        <Logout />
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            <Container className="pt-1 mt-5" >
                <Row className="justify-content-md-center">
                    {apps && apps.map( app => {
                        return (
                            <Col key={app.id}>
                                <Card style={{ width: '18rem' }}>
                                    <Card.Img variant="top" src={BACKEND_SERVER + app.imagen} width="500" height="140"/>
                                    <Card.Body>
                                        <Card.Title>{app.nombre}</Card.Title>
                                        <Card.Text>
                                            {app.descripcion}
                                        </Card.Text>
                                        <Link to={app.url}>
                                            <Button variant="info" block>Abrir</Button>
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col> 
                        )
                    })}
                </Row>
            </Container>
        </React.Fragment>
    )
}

export default Home;