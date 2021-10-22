import React from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ManNavBar = () => {
    const [user] = useCookies(['tec-user']);
    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Mantenimiento" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/mantenimiento/notificaciones">Lista de notificaciones</NavDropdown.Item>
                            <NavDropdown.Item href="/mantenimiento/notificacion/nueva">Nueva notificación</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/mantenimiento/partes">Lista de partes</NavDropdown.Item>
                            <NavDropdown.Item href="/mantenimiento/parte/nuevo">Nuevo parte</NavDropdown.Item>
                        </NavDropdown>
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

export default ManNavBar;