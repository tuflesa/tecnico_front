import React, { useState, useEffect } from 'react';
import './repuestos.css';
import { Container, Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
//import { filter } from 'd3';
import logo from '../../assets/icono_1.svg';
//import cuchilla from '../../assets/cuchilla_1.svg';
//import logo_bor from '../../assets/bitmap.svg';


const Programadores = () => {
    const [token] = useCookies(['tec-token']);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [yearSeleccionado, setYearSeleccionado] = useState(new Date().getFullYear());
    const [cargando, setCargando] = useState(false);
    const [user] = useCookies(['tec-user']);
    const [linea_stock, setLineaStock] = useState(null);

    const abrirModalYear = () => {
        setYearSeleccionado(new Date().getFullYear());
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
    };

    /* const Listado_Stocks = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?repuesto__es_critico=${false}&almacen__id=${21}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setLineaStock(res.data);
        })
        .catch(err => { console.log(err);})
    } */

    /* const cambiar_stocks = () => {
        for(var x=0; x<linea_stock.length; x++){
            axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${linea_stock[x].id}/`,{
                cantidad: 0,
                cantidad_aconsejable: linea_stock[x].cantidad,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
            })
            .catch( err => {
                console.log(err);
            })
        }
    } */

    const generarAnual = async () => {
        if (!yearSeleccionado){
            alert("Por favor introduce un año válido");
            return;
        }
        const confirmar = window.confirm(`¿Deseas generar todos los horarios del año ${yearSeleccionado}?`);
        if (!confirmar) return;
        setCargando(true);
        try {
            const response = await axios.post(BACKEND_SERVER + `/api/velocidad/horarios/generar/`, {
                year: yearSeleccionado
            }, { 
                headers: {
                    'Authorization': `token ${token['tec-token']}` 
                }
            });
            alert("Año generado correctamente");
        } catch (error) {
            alert("Hubo un error generando el año: " + (error.response?.data?.mensaje || error.message));
        } finally {
            setCargando(false);
        }
    };

    return (
        <Container className='mt-5'>
            <Row>
                <button 
                        variant="success"
                        size="lg"
                        onClick={abrirModalYear}
                        style={{
                            marginBottom: "20px",
                            padding: "8px 16px",
                            fontWeight: "600"
                        }}
                    >
                        Generar horarios anuales
                    </button>
            </Row>
            {/* <Row>
                <Col>
                    
                    <h5 className="mb-3 mt-3">Acciones de Programadores</h5>  
                    <h5><img src = {logo}></img></h5>                 
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Crear lista precio - proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <th><Button variant="info" onClick={event =>{Listado_Stocks()}}>1- Repasar listado de stocks</Button></th>
                            <th><Button variant="info" onClick={event =>{cambiar_stocks()}}>1- Pasar stocks</Button></th>
                        </tbody>
                    </Table>
                </Col>
            </Row> */} 
            {/* Modal para seleccionar año */}
            <Modal show={mostrarModal} onHide={cerrarModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Generar Horarios Anuales</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>Selecciona el año para el que deseas generar los horarios:</p>
                    
                    <Form.Group>
                        <Form.Label>Año</Form.Label>
                        <Form.Control
                            type="number"
                            min="2025"
                            max="2200"
                            value={yearSeleccionado}
                            onChange={(e) => setYearSeleccionado(parseInt(e.target.value))}
                            disabled={cargando}
                        />
                        <Form.Text className="text-muted">
                            Se generarán horarios para todas las máquinas de tubo
                        </Form.Text>
                    </Form.Group>

                    {cargando && (
                        <div className="mt-3 text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Generando...</span>
                            </div>
                            <p className="mt-2">Generando horarios, por favor espera...</p>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModal} disabled={cargando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={generarAnual} disabled={cargando}>
                        {cargando ? 'Generando...' : 'Generar Año'}
                    </Button>
                </Modal.Footer>
            </Modal> 
        </Container>        
    )
}

export default Programadores;