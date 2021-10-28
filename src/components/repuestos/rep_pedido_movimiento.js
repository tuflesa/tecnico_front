import React, { useState, useEffect } from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';

const MovimientoForm = ({show, updateLinea, linea, handleCloseMovimiento, empresa}) => {
    
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
 
    const [hoy] = useState(new Date);
    const [almacenes, setAlmacenes]=useState(null)
    const [movimiento, setMovimiento]=useState(null)
    const [datos, setDatos] = useState({  
        linea_pedido:linea ? linea.id : '',
        inventario: '',
        repuesto:  linea ? linea.repuesto.nombre : '',
        cantidad:  linea ? linea.cantidad : '',
        precio: linea ? linea.precio : '', 
        fecha: (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        recibido: null,
        albaran: null,
        almacen: '',
        usuario: user['tec-user'],
    });

    const handlerCancelar = () => {      
        handleCloseMovimiento();
        datos.recibido= '';
        datos.albaran = '';
        datos.almacen = '';
    } 

    useEffect(()=>{
        linea && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?almacen__empresa__id=${empresa}&repuesto=${linea.repuesto.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            //console.log('imprimiendo los datos de stock minimo ----- linea');
            //console.log(linea);
            setAlmacenes(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, linea]);

    useEffect(()=>{
        setDatos({
            linea_pedido:linea ? linea.id : '',
            inventario: '',
            repuesto:  linea ? linea.repuesto.nombre : '',
            cantidad:  linea ? linea.cantidad : '',
            precio: linea ? linea.precio : '', 
            fecha: (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
            recibido: datos ? datos.recibido : '',
            albaran: datos ? datos.albaran : '',
            almacen: datos ? datos.almacen : '',
            usuario: user['tec-user'].id,
        });
    },[linea]);

    const actualizarRecibir = () =>{
        axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`, {
            por_recibir: linea.por_recibir - datos.recibido,            
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {    
            updateLinea();
        })
        .catch(err => { console.log(err);})
    }

    const guardarMovimiento = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
            fecha: datos.fecha,
            cantidad: datos.recibido,
            almacen: datos.almacen,
            usuario: user['tec-user'].id,
            linea_pedido: datos.linea_pedido,
            linea_inventario: datos.inventario,
            albaran: datos.albaran
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setMovimiento(res.data);            
            handlerCancelar();
            actualizarRecibir();
        })
        .catch(err => { console.log(err);})
    }

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
                                                <option key={0} value={''}>
                                                        ----
                                                </option>
                                                {almacenes && almacenes.map( stock => {
                                                    return (
                                                    <option key={stock.id} value={stock.almacen.id}>
                                                        {stock.almacen.nombre}
                                                    </option>
                                                    )
                                                })}                                                                                                 
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            {/* <Col>
                                <Form.Group controlId="localizacion">
                                    <Form.Label>Localización en Almacén</Form.Label>
                                    <Form.Control type="text"  
                                                name='localizacion' 
                                                value={almacenes.localizacion}
                                                onChange={handleInputChange}
                                                placeholder="Localizacion">  
                                    </Form.Control>
                                </Form.Group>
                            </Col> */}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>                        
                <Button variant="info" onClick={guardarMovimiento}> Guardar </Button>                
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
         </Modal>
    );
} 
export default MovimientoForm;