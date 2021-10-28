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
        por_recibir:''
    });
    const [repuestos, setRepuestos]= useState(null);
    const[unidades, setUnidades]=useState(null);
    //const entregaTotal=null;

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

    /* const cantidadRecibida = async() => {
        // console.log(datos);
        axios.get(BACKEND_SERVER + `/api/repuestos/movimiento/?linea_pedido__id=${linea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }  
          
        })
        .then( res => {  
            setUnidades(res.data);
            
            console.log(res.data);
                       
        })
        .catch(err => { console.log(err);})
    } */

    const prueba = async() => { 
        //function prueba (){
            const res = await axios.get(BACKEND_SERVER + `/api/repuestos/movimiento/?linea_pedido__id=${linea.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }  
                
            })
                             
            const suma = datos.cantidad - total(res.data, 'cantidad');
            datos.por_recibir = suma;
            console.log('que vale datos');            
            console.log(datos.por_recibir);
            return datos.por_recibir;                     
            
                   
        }  
    function total (unidades,fn){
        return unidades.map(d => d[fn]).reduce((a,v)=> a + v,0);
    }
    
    
    const handlerEditar = async () => {
        let entregaTotal = await prueba();    
        if (datos.cantidad<linea.por_recibir){            
            alert('Cantidad erronea, revisa cantidad recibida');            
            handlerCancelar();
        }
        else{                                  
            console.log('entregaTotallllllllllll.');
            console.log(entregaTotal);
            
            //datos.por_recibir = (datos.cantidad - entregaTotal); 
            console.log('que vale datoooooossss');
            console.log(datos.por_recibir);
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`,{
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
                console.log('he entrado en el patch');
                updateLinea();
                handlerCancelar();
            })
            .catch( err => {
                console.log(err);            
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