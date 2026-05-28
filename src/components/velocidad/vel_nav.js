import React, {} from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const VelNavBar = () => {
    const [user] = useCookies(['tec-user']);

    return (
        <React.Fragment>
            <style>{`
                .dropdown-submenu {
                    position: relative;
                }
                .dropdown-submenu .dropdown-menu {
                    display: none;
                    position: absolute;
                    left: 100%;
                    top: 0;
                }
                .dropdown-submenu:hover .dropdown-menu {
                    display: block;
                }
            `}</style>

            <Navbar bg="light" fixed='top'>
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Velocidad" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/velocidad/">Velocidad</NavDropdown.Item>
                            {/* Estadísticas con submenú hacia la derecha */}
                            <div className="dropdown-submenu">
                                <NavDropdown.Item className="dropdown-toggle">Estadísticas</NavDropdown.Item>
                                <ul className="dropdown-menu">
                                    <li>
                                        <NavDropdown.Item href="/velocidad/oee">OEE</NavDropdown.Item>
                                    </li>
                                    <li>
                                        <NavDropdown.Item href="/velocidad/paradas">Paradas</NavDropdown.Item>
                                    </li>
                                    <li>
                                        <NavDropdown.Item href="/velocidad/cambios">Cambios</NavDropdown.Item>
                                    </li>
                                </ul>
                            </div>
                            <NavDropdown.Item href="/trazabilidad/main">Trazabilidad</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Navbar.Text className="mr-4">
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
    );
}

export default VelNavBar;