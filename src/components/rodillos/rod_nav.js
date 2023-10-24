import React, {}from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RodNavBar = () => {
    const [user] = useCookies(['tec-user']);

    return (
            <React.Fragment>
                    <Navbar bg="light" fixed= 'top'>
                        <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mr-auto">
                                <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item>
                                    <NavDropdown title="Listados" id="listados-dropdown" menuAlign="right">
                                    <NavDropdown.Item href="/rodillos/grupos">Grupos</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista">Rodillos</NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Nuevos" id="nuevos-dropdown" menuAlign="right">
                                    <NavDropdown.Item href="/rodillos/nuevo">Rodillo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/grupo/nuevo">Grupo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/bacada">Bancada</NavDropdown.Item> 
                                    </NavDropdown>
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

export default RodNavBar;