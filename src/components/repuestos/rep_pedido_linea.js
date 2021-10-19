import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaForm = ({show, pedido_id, handleCloseLinea, proveedor_id}) => {
    
    const [token] = useCookies(['tec-token']);
    
    const [datos, setDatos] = useState({  
        repuesto: '',
        cantidad:'',
        precio:'',
        pedido: pedido_id,
        proveedor: proveedor_id
    });
    const [repuestos, setRepuestos]= useState(null);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

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
        axios.post(BACKEND_SERVER + `/api/repuestos/lista_pedidos/`,{
            repuesto: datos.repuesto,
            cantidad:datos.cantidad,
            precio:datos.precio,
            pedido: datos.pedido,
            empresa: '1'
           // proveedor: proveedor_id
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
           // updateProveedorCont();    
           console.log('hemos grabado nueva linea');
            handlerCancelar();
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
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
                                                placeholder="Repuesto">
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
                        <Button variant="info" onClick={handlerGuardar}> Guardar </Button>                
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
         </Modal>
    );
}

export default LineaForm;