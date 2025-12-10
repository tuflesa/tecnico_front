import React from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const VelocidadNavBar = () => {
    const [user] = useCookies(['tec-user']);
    const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);

    return (
        <React.Fragment>
            <Navbar bg="light">
                <Navbar.Brand href="/home">Dep.Técnico</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="m-auto">
                        <Navbar.Text>Control de velocidad</Navbar.Text>
                    </Nav> 
                    {soyProgramador?
                        <Form inline>
                            <Link to="/velocidad/horario">
                                <Button variant="info">Horarios</Button>
                            </Link>
                        </Form>
                    :''}
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

export default VelocidadNavBar;