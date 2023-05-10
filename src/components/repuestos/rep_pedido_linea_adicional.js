import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaAdicionalForm = ({show, pedido_id, handleCloseLineaAdicional, updatePedido, linea_adicional}) => {
    
    const [token] = useCookies(['tec-token']);

    //const [repuestos, setRepuestos]= useState(null);
    //const[unidades, setUnidades]=useState(null);
    
    const [datos, setDatos] = useState({  
        descripcion: linea_adicional ? linea_adicional.descripcion : '',
        cantidad: linea_adicional ? linea_adicional.cantidad : 0,
        precio:linea_adicional ? linea_adicional.precio : 0,
        descuento: linea_adicional ? linea_adicional.descuento : 0,
        total: linea_adicional ? linea_adicional.total : 0,
        pedido: pedido_id,
        por_recibir:linea_adicional ? linea_adicional.por_recibir : '',
    });   

    useEffect(()=>{
        setDatos({  
            descripcion: linea_adicional ? linea_adicional.descripcion : '',
            cantidad: linea_adicional ? linea_adicional.cantidad : 0,
            precio: linea_adicional ? linea_adicional.precio : 0,
            descuento: linea_adicional ? linea_adicional.descuento : 0,
            total: linea_adicional ? linea_adicional.total : 0,
            pedido: pedido_id,
            pedido: pedido_id,
            por_recibir: linea_adicional ? linea_adicional.por_recibir : 0,
        });
    },[linea_adicional, pedido_id]);

    useEffect(()=>{ 
        datos.cantidad=Number.parseFloat(datos.cantidad).toFixed(2);
        datos.precio=Number.parseFloat(datos.precio).toFixed(4);
        datos.descuento=Number.parseFloat(datos.descuento).toFixed(2);
        datos.total = Number.parseFloat((datos.precio*datos.cantidad)-(datos.precio*datos.cantidad*datos.descuento/100)).toFixed(4);
        //datos.total=Number.parseFloat(datos.total).toFixed(2);
        datos.por_recibir = linea_adicional ? (linea_adicional.por_recibir+(datos.cantidad-linea_adicional.cantidad)) : datos.cantidad;
    },[datos.cantidad, datos.precio, datos.descuento]);
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handlerCancelar = () => {      
        handleCloseLineaAdicional();
    } 

    const handlerGuardar = () => {
        axios.post(BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/`,{
            descripcion: datos.descripcion,
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

    function total (unidades,fn){
        return unidades.map(d => d[fn]).reduce((a,v)=> a + v,0);
    }   
    
    const handlerEditar = async () => {   
        if (datos.cantidad<(linea_adicional.cantidad - linea_adicional.por_recibir) || datos.por_recibir<0){            
            alert('Cantidad erronea, revisa cantidad recibida');            
            handlerCancelar();
        }
        else{  
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/${linea_adicional.id}/`,{
                descripcion: datos.descripcion,
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

    const formatNumber = (numero) =>{
        return new Intl.NumberFormat("ES-ES", {
            style: 'currency',
            currency: 'EUR',
        }).format(numero)
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>  
                { linea_adicional ?               
                    <Modal.Title>Rectificar Linea</Modal.Title> :
                    <Modal.Title>Nueva Linea</Modal.Title>
                }
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="descripcion">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='descripcion' 
                                                value={datos.descripcion}
                                                onChange={handleInputChange}
                                                placeholder="Descripcion">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="cantidad">
                                    <Form.Label>Cantidad</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='cantidad' 
                                                value={datos.cantidad}
                                                onChange={handleInputChange}
                                                placeholder="Cantidad">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="precio">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='precio' 
                                                value={datos.precio}
                                                onChange={handleInputChange}
                                                placeholder="Precio">  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="descuento">
                                    <Form.Label>Descuento</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='descuento' 
                                                value={datos.descuento}
                                                onChange={handleInputChange}
                                                placeholder="Descuento">  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    { linea_adicional ?                     
                        <Button variant="info" onClick={handlerEditar}> Editar </Button> :
                        <Button variant="info" onClick={handlerGuardar}> Guardar </Button>
                    }        
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
         </Modal>
    );
}

export default LineaAdicionalForm;