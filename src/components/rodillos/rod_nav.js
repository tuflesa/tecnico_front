import React, {}from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RodNavBar = () => {
    const [user] = useCookies(['tec-user']);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?false:true;
    const soyTecnico = user['tec-user'].perfil.puesto.nombre==='Técnico'?true:false;
    const soySuperTecnico = user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:false;
    const soyMantenimiento = user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;

    return (
            <React.Fragment>
                    <Navbar bg="light" fixed= 'top'>
                        <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {soySuperTecnico?
                            <Nav className="mr-auto">
                                <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item>
                                    <NavDropdown title="Listados" id="listados-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/lista">Rodillos</NavDropdown.Item>
                                    <NavDropdown.Item href="/rodillos/grupos">Bancadas de grupo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista_bancadas_ct">Bancadas CT/Calibradora</NavDropdown.Item>
                                    <NavDropdown.Item href="/rodillos/montaje_lista">Montajes</NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Nuevos" id="nuevos-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/grupo/nuevo">Grupo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/nuevo">Rodillo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/grupos">Bancadas de grupo</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/bacada_ct">Bancadas CT/Calibradora</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/montaje">Montajes</NavDropdown.Item> 
                                    </NavDropdown>
                                    <NavDropdown title="Rectificados Internos" id="nuevos-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/nueva_rectificacion">Nueva Orden de Rectificado</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista_rectificacion">Lista Ordenes de Rectificados</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/instancias_rectificar">Lista Rodillos a Rectificar</NavDropdown.Item>
                                    <NavDropdown.Item href="/rodillos/instancias_xa_rectificar">Lista Rodillos para Rectificar</NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Rectificados Externos" id="nuevos-dropdown" menualign="right">
                                    <NavDropdown.Item href="/rodillos/nueva_rectificacion_tuflesa">Nueva Orden de Rectificado</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/lista_rectificacion">Lista Ordenes de Rectificados</NavDropdown.Item> 
                                    <NavDropdown.Item href="/rodillos/instancias_rectificar">Lista Rodillos a Rectificar</NavDropdown.Item>
                                    </NavDropdown>
                                </NavDropdown>
                            </Nav>
                            : 
                                soyTecnico || soyMantenimiento?
                                <Nav className="mr-auto">
                                    <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item>
                                        <NavDropdown title="Listados" id="listados-dropdown" menualign="right">
                                        <NavDropdown.Item href="/rodillos/lista">Rodillos</NavDropdown.Item>
                                        </NavDropdown>
                                        <NavDropdown title="Rectificados" id="nuevos-dropdown" menualign="right">
                                        <NavDropdown.Item href="/rodillos/nueva_rectificacion">Nueva Orden Rectificado</NavDropdown.Item> 
                                        <NavDropdown.Item href="/rodillos/lista_rectificacion">Lista Ordenes Rectificados</NavDropdown.Item> 
                                        <NavDropdown.Item href="/rodillos/instancias_xa_rectificar">Lista Rodillos para Rectificar</NavDropdown.Item>
                                        </NavDropdown>
                                    </NavDropdown>
                                </Nav>
                                :
                                <Nav className="mr-auto">
                                    <NavDropdown title="Rodillos" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/rodillos/tooling">Tooling Chart</NavDropdown.Item>
                                        <NavDropdown title="Listados" id="listados-dropdown" menualign="right">
                                        <NavDropdown.Item href="/rodillos/lista">Rodillos</NavDropdown.Item>
                                        </NavDropdown>
                                        <NavDropdown title="Rectificados" id="nuevos-dropdown" menualign="right">
                                        <NavDropdown.Item href="/rodillos/nueva_rectificacion">Nueva orden rectificado</NavDropdown.Item> 
                                        <NavDropdown.Item href="/rodillos/lista_rectificacion">Lista ordenes rectificados</NavDropdown.Item> 
                                        </NavDropdown>
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