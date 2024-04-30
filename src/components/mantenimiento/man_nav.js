import React,{ useState, useEffect } from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const ManNavBar = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [notificacion, setnotificacion] = useState(null);

    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Técnico'&&user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?true:false;

    useEffect(()=>{        
        axios.get(BACKEND_SERVER + `/api/mantenimiento/notificaciones_sinpaginar/?revisado=${false}&finalizado=${false}&descartado=${false}&empresa__id=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setnotificacion(res.data.length);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, user]); 

    return (
            <React.Fragment>
                    <Navbar bg="light" fixed= 'top'>
                        <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {!nosoyTecnico?
                                <Nav className="mr-auto">
                                    <NavDropdown title="Mantenimiento" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/mantenimiento">Página de Inicio</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/listado_tareas">Lista de Tareas</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/listado_tarea">Mis Tareas</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/tareas_trabajador">Filtro por Trabajador</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/partes">Lista de Partes</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/parte/nuevo">Nuevo Parte</NavDropdown.Item> 
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/notificaciones">Lista de notificaciones</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/notificacion/nueva">Nueva Notificacion</NavDropdown.Item>

                                    </NavDropdown>
                                </Nav> 
                            :
                                <Nav className="mr-auto">
                                    <NavDropdown title="Mantenimiento" id="basic-nav-dropdown">
                                        <NavDropdown.Item href="/mantenimiento/listado_tarea">Mis Tareas</NavDropdown.Item> 
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item href="/mantenimiento/notificaciones">Lista de notificaciones</NavDropdown.Item>
                                        <NavDropdown.Item href="/mantenimiento/notificacion/nueva">Nueva Notificacion</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav> 
                            }   
                            {!nosoyTecnico?
                                <Navbar.Text className="mr-4" >
                                    <h5>Notificaciones sin revisar: {notificacion}</h5>
                                </Navbar.Text>
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