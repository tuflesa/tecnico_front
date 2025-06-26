import React from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RepNavBar = () => {
    const [user] = useCookies(['tec-user']);
    const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Mantenimiento'&&user['tec-user'].perfil.puesto.nombre!=='Operador'?false:true;

    return (
        <React.Fragment>
                <Navbar bg="light" fixed= 'top'>
                    <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        {!nosoyTecnico?
                            <Nav className="mr-auto">
                                <NavDropdown title="Repuestos" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/repuestos">Página de Inicio</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/prl">Página de Inicio PRL</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/listado">Lista de repuestos</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/nuevo">Nuevo repuesto</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/precio">Precio repuestos</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/traspasos">Traspaso de almacen</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/almacenes">Lista de almacenes</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/almacen/nuevo">Nuevo almacén</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/proveedores">Lista de proveedores</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/proveedor/nuevo">Nuevo proveedor</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/pedidos">Lista de pedidos</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/pedido/nuevo">Nuevo pedido</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/lineas_adicionales">Lineas Adicionales</NavDropdown.Item>
                                    <NavDropdown.Item href="/repuestos/lineas_por_albaran">Pedidos Por Albarán</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/salidas">Salidas</NavDropdown.Item>  
                                    <NavDropdown.Divider />  
                                    <NavDropdown.Item href="/repuestos/inventario">Inventario</NavDropdown.Item> 
                                    <NavDropdown.Divider />  
                                    {soyProgramador[0]===7?
                                        <NavDropdown.Item href="/repuestos/programadores">Programadores</NavDropdown.Item>                     
                                    :null}
                                </NavDropdown>
                            </Nav> 
                        :
                            <Nav className="mr-auto">
                                <NavDropdown title="Repuestos" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/repuestos/listado">Lista de repuestos</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/repuestos/salidas">Salidas</NavDropdown.Item>  
                                    <NavDropdown.Divider />  
                                    <NavDropdown.Item href="/repuestos/inventario">Inventario</NavDropdown.Item> 
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

export default RepNavBar;