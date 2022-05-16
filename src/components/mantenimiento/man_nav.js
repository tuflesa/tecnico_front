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
                            <NavDropdown.Item href="/mantenimiento">Página de Inicio</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/mantenimiento/listado_tareas">Listado de Trabajos</NavDropdown.Item>
                            <NavDropdown.Item href="/mantenimiento/listado_tarea">Listado de Trabajos por Equipos</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/mantenimiento/partes">Lista de partes de trabajo</NavDropdown.Item>
                            <NavDropdown.Item href="/mantenimiento/parte/nuevo">Nuevo parte de trabajo</NavDropdown.Item>   
                            <NavDropdown.Item href="/mantenimiento/parte/nuevo_mediciones">Nuevo parte de mediciones</NavDropdown.Item>                          
                  
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