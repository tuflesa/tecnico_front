import React from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EstNavBar = () => {

    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Estructura" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/estructura/empresas/">Lista de empresas</NavDropdown.Item>
                            <NavDropdown.Item href="/estructura/empresa/nueva">Nueva empresa</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/estructura/zonas">Lista de zonas</NavDropdown.Item>
                            <NavDropdown.Item href="/estructura/zona/nueva">Nueva zona</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/estructura/secciones">Lista de secciones</NavDropdown.Item>
                            <NavDropdown.Item href="/estructura/seccion/nueva">Nueva sección</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/estructura/equipos">Lista de equipos</NavDropdown.Item>
                            <NavDropdown.Item href="/estructura/equipo/nuevo">Nuevo equipo</NavDropdown.Item>
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

export default EstNavBar;