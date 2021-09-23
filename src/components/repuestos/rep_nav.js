import React from 'react';
import { Navbar, NavDropdown, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const RepNavBar = () => {
    const [user] = useCookies(['tec-user']);
    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Repuestos" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/repuestos">Lista de repuestos</NavDropdown.Item>
                            <NavDropdown.Item href="/repuestos/nuevo">Nuevo repuesto</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/repuestos/almacenes">Lista de almacenes</NavDropdown.Item>
                            <NavDropdown.Item href="/repuestos/almacen/nuevo">Nuevo almacén</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/repuestos/proveedores">Lista de proveedores</NavDropdown.Item>
                            <NavDropdown.Item href="#">Nuevo proveedor</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#">Lista de pedidos</NavDropdown.Item>
                            <NavDropdown.Item href="#">Nuevo pedido</NavDropdown.Item>
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

export default RepNavBar;