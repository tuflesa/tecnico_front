//son entregas de lineas adicionales.
import React, { useState, useEffect } from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';

const EntregaForm = ({show, updatePedido, linea_adicional, handleCloseEntrega}) => {
    
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
 
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [, setEntrega]=useState(null)

    const [datos, setDatos] = useState({  
        linea_adicional:linea_adicional ? linea_adicional.id : '',
        descripcion:  linea_adicional ? linea_adicional.descripcion : '',
        cantidad:  linea_adicional ? linea_adicional.cantidad : '',
        precio: linea_adicional ? linea_adicional.precio : '',         
        fecha: fechaString,
        recibido: null,
        albaran: null,
        //almacen: '',
        usuario: user['tec-user'],
    });

    const handlerCancelar = () => {      
        handleCloseEntrega();
        datos.recibido= '';
        datos.albaran = '';
    } 

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{
        setDatos({
            linea_adicional:linea_adicional ? linea_adicional.id : '',
            descripcion:  linea_adicional ? linea_adicional.descripcion : '',
            cantidad:  linea_adicional ? linea_adicional.cantidad : '',
            precio: linea_adicional ? linea_adicional.precio : '', 
            fecha: fechaString,
            recibido: datos ? datos.recibido : '',
            albaran: datos ? datos.albaran : '',
           // almacen: datos ? datos.almacen : '',
            usuario: user['tec-user'].id,
        });
    },[linea_adicional]);
    /* eslint-disable react-hooks/exhaustive-deps */

    const actualizarRecibir = () =>{
        axios.patch(BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/${linea_adicional.id}/`, {
            por_recibir: linea_adicional.por_recibir - datos.recibido,            
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {    
            updatePedido();
        })
        .catch(err => { console.log(err);})
    }

    const guardarMovimiento = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/repuestos/entrega/`, {
            fecha: datos.fecha,
            cantidad: datos.recibido,
            //almacen: datos.almacen,
            usuario: user['tec-user'].id,
            linea_adicional: datos.linea_adicional,            
            albaran: datos.albaran
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setEntrega(res.data); 
            actualizarRecibir();           
            handlerCancelar();
            
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
                <Modal.Header>                
                    <Modal.Title>Nuevo Movimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="descripcion">
                                    <Form.Label>Descripcion</Form.Label>
                                    <Form.Control type="text"  
                                                name='descripcion' 
                                                value={datos.descripcion}
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
                            {/* <Col>
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
export default EntregaForm;