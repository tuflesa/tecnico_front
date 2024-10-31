import React, {}from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RodNavBar = () => {
    const [user] = useCookies(['tec-user']);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?false:true;

    return (
            <React.Fragment>
                    <Navbar bg="light" fixed= 'top'>
                        <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {nosoyTecnico?
                            <Nav className="mr-auto">
                                <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item>
                                    <NavDropdown title="Listados" id="listados-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/lista">Rodillos</NavDropdown.Item>
                                    <NavDropdown.Item href="/rodillos/grupos">Bancadas RD</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista_bancadas_ct">Bancadas CT</NavDropdown.Item>
                                    <NavDropdown.Item href="/rodillos/montaje_lista">Montajes</NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Nuevos" id="nuevos-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/grupo/nuevo">Grupo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/nuevo">Rodillo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/grupos">Bancadas RD</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/bacada_ct">Bancada CT</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/montaje">Montaje Bancadas</NavDropdown.Item> 
                                    </NavDropdown>
                                    <NavDropdown title="Rectificados" id="nuevos-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/nueva_rectificacion">Nueva Ficha Rectificado</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista_rectificacion">Lista Fichas Rectificados</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/instancias_rectificar">Lista Instancias a Rectificar</NavDropdown.Item>
                                    </NavDropdown>
                                </NavDropdown>
                            </Nav>
                            :
                            <Nav className="mr-auto">
                                <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item> */}
                                    <NavDropdown.Item href="/rodillos/montaje_lista">Montajes</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            }
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