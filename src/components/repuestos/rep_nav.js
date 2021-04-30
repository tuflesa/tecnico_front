import React from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RepNavBar = () => {

    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Repuestos" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/repuestos">Lista de repuestos</NavDropdown.Item>
                            <NavDropdown.Item href="#">Nuevo repuesto</NavDropdown.Item>
                            {/* <NavDropdown.Divider />
                            <NavDropdown.Item href="#">Lista de almacenes</NavDropdown.Item>
                            <NavDropdown.Item href="#">Nuevo almacén</NavDropdown.Item> */}
                        </NavDropdown>
                    </Nav>    
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

export default RepNavBar;