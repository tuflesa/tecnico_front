import React from 'react';
import Logout from '../logout';
import {Container, Navbar, Form } from 'react-bootstrap';
const Estructura = () => {
    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand>Estructura</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Form inline>
                        <Logout />
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            <Container className="mt-4" >
                <h4>Estructura</h4>
            </Container>
            </React.Fragment>
    )
}

export default Estructura;