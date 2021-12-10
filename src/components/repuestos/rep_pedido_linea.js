import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaForm = ({show, pedido_id, handleCloseLinea, proveedor_id, updatePedido, linea}) => {
    
    const [token] = useCookies(['tec-token']);

    const [repuestos, setRepuestos]= useState(null);
    //const[unidades, setUnidades]=useState(null);
    
    const [datos, setDatos] = useState({  
        repuesto: linea ? linea.repuesto : '',
        cantidad: linea ? linea.cantidad : 0,
        precio:linea ? linea.precio : 0,
        descuento: linea ? linea.descuento : 0,
        total: linea ? linea.total : 0,
        pedido: pedido_id,
        por_recibir:''
    });   

    useEffect(()=>{
        setDatos({  
            repuesto: linea ? linea.repuesto.id : 0,
            cantidad: linea ? linea.cantidad : 0,
            precio: linea ? linea.precio : 0,
            descuento: linea ? linea.descuento : 0,
            total: linea ? linea.total : 0,
            pedido: pedido_id,
        });
    },[linea, pedido_id]);

    useEffect(()=>{ 
        datos.total = ((datos.precio*datos.cantidad)-(datos.precio*datos.cantidad*datos.descuento/100));
    },[datos.cantidad, datos.precio, datos.descuento]);

    useEffect(()=>{
        proveedor_id && axios.get(BACKEND_SERVER + `/api/repuestos/lista/?proveedores__id=${proveedor_id}&descatalogado=${false}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
            console.log(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, proveedor_id]);

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

    const prueba = async() => {         
        const res = await axios.get(BACKEND_SERVER + `/api/repuestos/movimiento/?linea_pedido__id=${linea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }  
            
        })                            
        const suma = datos.cantidad - total(res.data, 'cantidad');
        datos.por_recibir = suma;
        return datos.por_recibir;                    
    }  

    function total (unidades,fn){
        return unidades.map(d => d[fn]).reduce((a,v)=> a + v,0);
    }   
    
    const handlerEditar = async () => {
        let entregaTotal = await prueba();    
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

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>  
                { linea ?               
                    <Modal.Title>Rectificar Linea</Modal.Title> :
                    <Modal.Title>Nueva Linea</Modal.Title>
                }
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                            <Form.Group controlId="repuesto">
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
                                                        {repuesto.nombre}
                                                    </option>
                                                    )
                                                })}
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
                    { linea ?                     
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

export default LineaForm;