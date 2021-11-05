import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaAdicionalForm = ({show, pedido_id, handleCloseLineaAdicional, updateLinea, linea_adicional}) => {
    
    const [token] = useCookies(['tec-token']);

    const [repuestos, setRepuestos]= useState(null);
    //const[unidades, setUnidades]=useState(null);
    
    const [datos, setDatos] = useState({  
        descripcion: linea_adicional ? linea_adicional.descripcion : '',
        cantidad: linea_adicional ? linea_adicional.cantidad : '',
        precio:linea_adicional ? linea_adicional.precio : '',
        pedido: pedido_id,
        por_recibir:''
    });   

    useEffect(()=>{
        setDatos({  
            descripcion: linea_adicional ? linea_adicional.descripcion : '',
            cantidad: linea_adicional ? linea_adicional.cantidad : '',
            precio: linea_adicional ? linea_adicional.precio : '',
            pedido: pedido_id,
        });
    },[linea_adicional, pedido_id]);
    
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
            pedido: datos.pedido,
            por_recibir: datos.cantidad,
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

    const prueba = async() => {         
        const res = await axios.get(BACKEND_SERVER + `/api/repuestos/entrega/?linea_adicional__id=${linea_adicional.id}`,{
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
        if (datos.cantidad<linea_adicional.por_recibir){            
            alert('Cantidad erronea, revisa cantidad recibida');            
            handlerCancelar();
        }
        else{  
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/${linea_adicional.id}/`,{
                descripcion: datos.descripcion,
                cantidad: datos.cantidad,
                precio: datos.precio,
                pedido: datos.pedido,
                por_recibir: datos.por_recibir,
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
                handlerCancelar();
            });
        }
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>  
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