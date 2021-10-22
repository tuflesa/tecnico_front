import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaForm = ({show, pedido_id, handleCloseLinea, proveedor_id, updateLinea, linea}) => {
    
    const [token] = useCookies(['tec-token']);
    
    const [datos, setDatos] = useState({  
        repuesto: linea ? linea.repuesto : '',
        cantidad: linea ? linea.cantidad : '',
        precio:linea ? linea.precio : '',
        pedido: pedido_id,
    });
    const [repuestos, setRepuestos]= useState(null);

    useEffect(()=>{
        setDatos({  
            repuesto: linea ? linea.repuesto.id : 0,
            cantidad: linea ? linea.cantidad : '',
            precio: linea ? linea.precio : '',
            pedido: pedido_id,
        });
    },[linea, pedido_id]);

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
        // console.log(datos);
        axios.post(BACKEND_SERVER + `/api/repuestos/linea_pedido/`,{
            repuesto: datos.repuesto,
            cantidad: datos.cantidad,
            precio: datos.precio,
            pedido: datos.pedido,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            updateLinea();
            handlerCancelar();
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
    }

    const handlerEditar = () => {
        axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`,{
            cantidad: datos.cantidad,
            precio: datos.precio,
            pedido: datos.pedido,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            updateLinea();
            handlerCancelar();
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
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
                    <Modal.Title>Nueva Linea</Modal.Title>
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