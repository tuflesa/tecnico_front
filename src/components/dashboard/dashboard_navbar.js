// dashboard/dashboard_navbar.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const DashboardNavBar = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand>
                    📊 Dashboard de Producción
                </Navbar.Brand>
                <Nav className="ms-auto">
                    <Nav.Item>
                        <span className="navbar-text text-success">
                            ● En vivo
                        </span>
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default DashboardNavBar;