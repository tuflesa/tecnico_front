import React from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const TR_NavBar = () => {
    const [user] = useCookies(['tec-user']);

    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="m-auto">
                        <Navbar.Text>Trazabilidad</Navbar.Text>
                    </Nav> 
                    <Navbar.Text className="mr-4" >
                        Usuario: {user['tec-user'].get_full_name}
                    </Navbar.Text>   
                    <Form inline>
                        <Link to="/home">
                            <Button variant="info">Home</Button>
                        </Link>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
        </React.Fragment>
    )
}

export default TR_NavBar;