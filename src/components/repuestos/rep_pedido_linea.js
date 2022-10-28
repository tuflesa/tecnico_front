import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { locales } from 'moment';
import BuscarRepuestosPedido from './rep_pedido_linea_buscar';

const LineaForm = ({show, pedido_id, handleCloseLinea, proveedor_id, updatePedido, linea}) => {    
    const [token] = useCookies(['tec-token']);

    const [repuestos, setRepuestos]= useState(null);
    const [show_listrepuestos, setShowListRepuestos] = useState(null);
    
    const [datos, setDatos] = useState({  
        repuesto: linea ? linea.repuesto : '',
        cantidad: linea ? linea.cantidad : 0,
        precio:linea ? linea.precio : 0,
        descuento: linea ? linea.descuento : 0,
        total: linea ? linea.total : 0,
        pedido: pedido_id,
        por_recibir: linea ? linea.por_recibir : '',
    });   

    useEffect(()=>{
        setDatos({  
            repuesto: linea ? linea.repuesto.id : 0,
            cantidad: linea ? linea.cantidad : 0,
            precio: linea ? linea.precio : 0,
            descuento: linea ? linea.descuento : 0,
            total: linea ? linea.total : 0,
            pedido: pedido_id,
            por_recibir: linea ? linea.por_recibir : 0,
        });
    },[linea, pedido_id]);

    useEffect(()=>{ 
        datos.cantidad=Number.parseFloat(datos.cantidad).toFixed(2);
        datos.precio=Number.parseFloat(datos.precio).toFixed(4);
        datos.descuento=Number.parseFloat(datos.descuento).toFixed(2);
        datos.total = Number.parseFloat((datos.precio*datos.cantidad)-(datos.precio*datos.cantidad*datos.descuento/100)).toFixed(2);
        datos.por_recibir = linea ? (linea.por_recibir+(datos.cantidad-linea.cantidad)) : datos.cantidad;     
    },[datos.cantidad, datos.precio, datos.descuento]);

    useEffect(()=>{
        datos.id && proveedor_id && axios.get(BACKEND_SERVER + `/api/repuestos/lista/?proveedores__id=${proveedor_id}&descatalogado=${false}&id=${datos.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }));
        })
        .catch(err => { console.log(err);})
    },[token, proveedor_id, datos.repuesto]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handlerCancelar = () => {      
        handleCloseLinea();
    } 

    const handlerGuardar = () => {      
        axios.post(BACKEND_SERVER + `/api/repuestos/linea_pedido/`,{
            repuesto: datos.repuesto,
            cantidad: datos.cantidad,
            precio: datos.precio,
            descuento: datos.descuento,
            total: datos.total,
            pedido: datos.pedido,
            por_recibir: datos.cantidad,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            updatePedido();
            handlerCancelar();
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
    }
     
    const handlerEditar = async () => {   
        if (datos.cantidad<(linea.cantidad - linea.por_recibir) || datos.por_recibir<0){            
            alert('Cantidad erronea, revisa cantidad recibida');            
            handlerCancelar();
        }
        else{              
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`,{
                cantidad: datos.cantidad,
                precio: datos.precio,
                descuento: datos.descuento,
                total: datos.total,
                pedido: datos.pedido,
                por_recibir: datos.por_recibir,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                updatePedido();
                handlerCancelar();
            })
            .catch( err => {           
                handlerCancelar();
            });
        }
    }

    const handleRepuestoEnabled = () => {
        if (linea) {
            return true
        }
        else return false
    }

    const abrirListRepuestos = () => {
        setShowListRepuestos(true);
    }

    const cerrarListRepuestos = () => {
        setShowListRepuestos(false);
    }

    const elegirRepuesto = (r) => { 
        datos.repuesto=r.id;
        datos.nombre=r.nombre;
        datos.modelo=r.modelo;
        cerrarListRepuestos();      
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>  
                { linea ?               
                    <Modal.Title>Rectificar Linea</Modal.Title> :
                    <Modal.Title>Nueva Linea</Modal.Title>
                }
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                            
                            <Button variant="info" tabIndex={1} className={'btn-lg'} autoFocus onClick={event => {abrirListRepuestos()}}>Buscar Repuesto</Button>                 
                            <Form.Group controlId="nombre">
                                <Form.Label>Repuesto</Form.Label>
                                <Form.Control imput type="text"  
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange}
                                            placeholder="Nombre Repuesto"
                                            disabled>  
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="modelo">
                                <Form.Label>Modelo Repuesto</Form.Label>
                                <Form.Control imput type="text"  
                                            name='modelo' 
                                            value={datos.modelo}
                                            onChange={handleInputChange}
                                            placeholder="Modelo Repuesto"
                                            disabled>  
                                </Form.Control>
                            </Form.Group>
                            {/* <Form.Group controlId="repuesto">
                                    <Form.Label>Repuesto</Form.Label>
                                    <Form.Control as="select"  
                                                name='repuesto' 
                                                value={datos.repuesto}
                                                onChange={handleInputChange}
                                                disabled={handleRepuestoEnabled()}
                                                placeholder="Repuesto">
                                                    <option key={0} value={''}>
                                                        ----
                                                    </option>
                                                {repuestos && repuestos.map( repuesto => {
                                                    return (
                                                    <option key={repuesto.id} value={repuesto.id}>
                                                        {repuesto.nombre + ' - ' + repuesto.modelo}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group> */}
                                {/* <Form.Group controlId="repuesto">
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Control as="select"  
                                                name='repuesto' 
                                                value={datos.repuesto}
                                                onChange={handleInputChange}
                                                disabled={handleRepuestoEnabled()}
                                                placeholder="Repuesto">
                                                    <option key={0} value={''}>
                                                        ----
                                                    </option>
                                                {repuestos && repuestos.map( repuesto => {
                                                    return (
                                                    <option key={repuesto.id} value={repuesto.id}>
                                                        {repuesto.modelo}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group> */}
                                <Form.Group controlId="cantidad">
                                    <Form.Label>Cantidad</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='cantidad' 
                                                value={datos.cantidad}
                                                onChange={handleInputChange}
                                                placeholder="Cantidad"
                                                tabIndex={2}
                                                >  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="precio">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='precio' 
                                                value={datos.precio}
                                                onChange={handleInputChange}
                                                placeholder="Precio"
                                                tabIndex={3}>  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="descuento">
                                    <Form.Label>Descuento</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='descuento' 
                                                value={datos.descuento}
                                                onChange={handleInputChange}
                                                placeholder="Descuento"
                                                tabIndex={4}
                                                >  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    { linea ?                     
                        <Button variant="info" onClick={handlerEditar}> Editar </Button> :
                        <Button variant="info" tabIndex={5} onClick={handlerGuardar}> Guardar </Button>
                    }        
                    <Button variant="waring" tabIndex={6} onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
                <BuscarRepuestosPedido      show={show_listrepuestos}
                                            cerrarListRepuestos={cerrarListRepuestos}
                                            proveedor_id={proveedor_id}
                                            elegirRepuesto={elegirRepuesto}/> 
         </Modal>
    );
}

export default LineaForm;