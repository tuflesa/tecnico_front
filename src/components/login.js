import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import {Container, Row, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { BACKEND_SERVER } from '../constantes';

const Login = () => {
    const [datos, setDatos] = useState({
        username: '',
        password: ''
    });
    const [show, setShow] = useState(false);
    const [ , setToken] = useCookies(['tec-token']);
    const [ , setUser] = useCookies(['tec-user']);

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleClose = () => setShow(false);

    const enviarDatos = (event) => {
        event.preventDefault()
        // console.log('enviando datos...' + BACKEND_SERVER + ' ' + datos.username + ' ' + datos.password)
        axios.post(BACKEND_SERVER + '/auth/', {
            username: datos.username,
            password: datos.password
        })
        .then( resp => {
            // console.log(resp.data);
            setUser('tec-user',resp.data.usuario);
            setToken('tec-token', resp.data.token);
        })
        .catch( err => {
            console.log(err);
            setDatos({
                username: '',
                password: ''
            });
            setShow(true);
        })
    }

    return (
        <Container className="vh-100">
            <Row className="justify-content-center"> 
                <h5 className="pb-3 pt-3 mt-5">Departamento técnico</h5>
            </Row>
            <Row className="justify-content-center">
                <Form>
                    <Form.Group controlId="formUsuario">
                        <Form.Label>Usuario</Form.Label>
                        <Form.Control type="text" 
                                    name='username' 
                                    value={datos.username}
                                    onChange={handleInputChange} 
                                    placeholder="Usuario" />
                    </Form.Group>

                    <Form.Group controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" 
                                    name='password' 
                                    value={datos.password}
                                    onChange={handleInputChange} 
                                    placeholder="Password" />
                    </Form.Group>
                
                    <Button variant="info" 
                            type="submit" 
                            block
                            onClick={enviarDatos}>
                        Login
                    </Button>
                </Form>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>Nombre de usuario o contraseña incorrecto</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default Login;