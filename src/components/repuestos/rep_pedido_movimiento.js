import React, { useState, useEffect } from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';

const MovimientoForm = ({show, updatePedido, linea, handleCloseMovimiento, empresa}) => {
    
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
 
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [almacenes, setAlmacenes]=useState(null)
    const [movimiento, setMovimiento]=useState(null)

    const [datos, setDatos] = useState({  
        linea_pedido:linea ? linea.id : '',
        inventario: '',
        repuesto:  linea ? linea.repuesto.nombre : '',
        cantidad:  linea ? linea.cantidad : '',
        precio: linea ? linea.precio : '', 
        //fecha: (('0'+hoy.getDay()) + '-'+(hoy.getMonth()+1)+'-'+ hoy.getFullYear()),
        fecha: fechaString,
        recibido: '',
        albaran: null,
        almacen: '',
        localizacion: '',
        usuario: user['tec-user'],
        entregadoAnterior: linea? (linea.cantidad - linea.por_recibir) : 0,
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
            fecha: fechaString,
            recibido: datos ? datos.recibido : '',
            albaran: datos ? datos.albaran : '',
            almacen: datos ? datos.almacen : '',
            localizacion: datos ? datos.localizacion : '',
            usuario: user['tec-user'].id,
            entregadoAnterior: linea? (linea.cantidad - linea.por_recibir) : 0,
        });
    },[linea]);

    useEffect(()=>{
        if(datos.recibido<0){
            var confirmacion = window.alert('No se pueden hacer entradas en negativo, modifica la cantidad. Gracias');
            datos.recibido=0;
        }
    },[datos.recibido])

    const actualizarRecibir = () =>{
        if((datos.entregadoAnterior + parseInt(datos.recibido))>linea.cantidad){
            var igualar = window.confirm("Se ha recibido una cantidad mayor a la indicada, ¿Deseas cambiar la cantidad pedida?");
            if(igualar){
                datos.por_recibir = 0;
                datos.cantidad = datos.entregadoAnterior + parseInt(datos.recibido);
            }
            else{
                datos.por_recibir = linea.por_recibir - datos.recibido;
            }
        }
        else{
            datos.por_recibir = linea.por_recibir - datos.recibido;
        }
        axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`, {
            por_recibir: datos.por_recibir,  
            cantidad: datos.cantidad,    

        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {    
            //actualizarStock();            
            //modificarCantidad();
            updatePedido();
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

    const handleInputChange2 = (event) => {
        if(event.target.value<0){
            alert('No se pueden poner numeros negativos');
            event.target.value='';
            setDatos({
                ...datos,
                [event.target.name] : event.target.value
            })
        }
        else{
            setDatos({
                ...datos,
                [event.target.name] : event.target.value
            })
        }
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
                <Modal.Header>                
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
                                                onChange={handleInputChange2}
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
                                                        {stock.almacen.nombre + ' / Cant: ' + stock.stock_act + ' / En: ' + stock.localizacion }                                                       
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
                <Button variant="info" onClick={guardarMovimiento}> Guardar </Button>                
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
         </Modal>
    );
} 
export default MovimientoForm;