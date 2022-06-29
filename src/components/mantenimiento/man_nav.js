import React,{ useState, useEffect } from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ManNavBar = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [mantenimiento, setMantenimiento] = useState(false);
    useEffect(() => {
        if(user['tec-user'].perfil.puesto.nombre==='Mantenimiento'){
            setMantenimiento(true);
        }
        if(user['tec-user'].perfil.puesto.nombre==='Operador'){
            setMantenimiento(true);
        }
    }, [token]);

    return (
        
            <React.Fragment>
                    <Navbar bg="light" fixed= 'top'>
                        <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {!mantenimiento?
                                <Nav className="mr-auto">
                                    <NavDropdown title="Mantenimiento" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/mantenimiento">Página de Inicio</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/listado_tareas">Lista de Tareas</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/listado_tarea">Lista de Tareas por Equipos</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/partes">Lista de Partes</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/parte/nuevo">Nuevo Parte</NavDropdown.Item> 
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/notificaciones">Lista de notificaciones</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/notificacion/nueva">Nueva Notificacion</NavDropdown.Item>

                                    </NavDropdown>
                                </Nav> 
                            :null}   
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