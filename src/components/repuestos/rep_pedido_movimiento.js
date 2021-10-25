import React, { useState, useEffect } from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';

const MovimientoForm = ({show, linea, handleCloseMovimiento, pedido, empresa}) => {
    
    const [token] = useCookies(['tec-token']);
 
    const [hoy] = useState(new Date);
    const [almacenes, setAlmacenes]=useState(null)
    const [datos, setDatos] = useState({  
        repuesto:  linea ? linea.repuesto.nombre : '',
        cantidad:  linea ? linea.cantidad : '',
        precio: linea ? linea.precio : '', 
        fecha: (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        recibido: null,
        albaran: null,
        almacen: ''
    });
    console.log('imprimiendo datos de la linea');
    console.log (pedido);
    const handlerCancelar = () => {      
        handleCloseMovimiento();
    } 

    useEffect(()=>{
        linea && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?almacen__empresa__id=${empresa}&repuesto=${linea.repuesto.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log('imprimiendo los datos de stock minimo');
            console.log(res.data);
            setAlmacenes(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, linea]);

    useEffect(()=>{
        setDatos({
            repuesto:  linea ? linea.repuesto.nombre : '',
            cantidad:  linea ? linea.cantidad : '',
            precio: linea ? linea.precio : '',
            almacen: almacenes
        });
    },[linea]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="lg">
                <Modal.Header closeButton>                
                    <Modal.Title>Nuevo Movimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="repuesto">
                                    <Form.Label>Repuesto</Form.Label>
                                    <Form.Control type="text"  
                                                name='repuesto' 
                                                value={datos.repuesto}
                                                disabled>  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="cantidad">
                                    <Form.Label>Cantidad Pedida</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='cantidad' 
                                                value={datos.cantidad}
                                                disabled>  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="precio">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='precio' 
                                                value={datos.precio}
                                                disabled>  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group controlId="fecha">
                                    <Form.Label>Fecha Entrega</Form.Label>
                                    <Form.Control type="date"  
                                                name='fecha' 
                                                value={datos.fecha}
                                                onChange={handleInputChange}>  
                                    </Form.Control>
                                </Form.Group>
                            </Col>                        
                            <Col>
                                <Form.Group controlId="recibido">
                                    <Form.Label>Cantida Recibida</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='recibido' 
                                                value={datos.recibido}
                                                onChange={handleInputChange}
                                                placeholder="Cantidad Recibida">  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="albaran">
                                    <Form.Label>Albarán Proveedor</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='albaran' 
                                                value={datos.albaran}
                                                onChange={handleInputChange}
                                                placeholder="Albarán Proveedor">  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="almacen">
                                    <Form.Label>Almacén</Form.Label>
                                    <Form.Control as="select"  
                                                name='almacen' 
                                                value={datos.almacen}
                                                onChange={handleInputChange}
                                                placeholder="Almacén"> 
                                                {almacenes && almacenes.map( stock => {
                                                    return (
                                                    <option key={stock.id} value={stock.almacen}>
                                                        {stock.almacen.nombre}
                                                    </option>
                                                    )
                                                })}                                                                                                 
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>                        
                <Button variant="info" > Guardar </Button>                
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
         </Modal>
    );
} 
export default MovimientoForm;