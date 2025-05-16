import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import BuscarRepuestosPedido from './rep_pedido_linea_buscar';

const LineaForm = ({show, pedido_id, handleCloseLinea, proveedor_id, updatePedido, linea}) => {    
    const [token] = useCookies(['tec-token']);

    const [repuestos, setRepuestos]= useState(null);
    const [show_listrepuestos, setShowListRepuestos] = useState(null);
    const [tipo_unidad, setTipoUnidad]=useState([])

    const [datos, setDatos] = useState({  
        repuesto: linea ? linea.repuesto : '',
        cantidad: linea ? linea.cantidad : 0,
        precio:linea ? linea.precio : 0,
        descuento: linea ? linea.descuento : 0,
        total: linea ? linea.total : 0,
        pedido: pedido_id,
        por_recibir: linea ? linea.por_recibir : '',
        precio_recibido: linea ? linea.precio : 0,
        descuento_recibido: linea ? linea.descuento : 0,
        id_linea_precio: 0,
        descripcion_proveedor: linea ? linea.descripcion_proveedor : '',
        modelo_proveedor: linea ? linea.modelo_proveedor : '',
        tipo_unidad: linea ? linea.tipo_unidad?linea.tipo_unidad: linea.repuesto?linea.repuesto.tipo_unidad:'':'',
    });   

    useEffect(()=>{
        setDatos({  
            repuesto: linea ? linea.repuesto : '',
            cantidad: linea ? linea.cantidad : 0,
            precio:linea ? linea.precio : 0,
            descuento: linea ? linea.descuento : 0,
            total: linea ? linea.total : 0,
            pedido: pedido_id,
            por_recibir: linea ? linea.por_recibir : '',
            precio_recibido: linea ? linea.precio : 0,
            descuento_recibido: linea ? linea.descuento : 0,
            id_linea_precio: 0,
            descripcion_proveedor_recibida: linea ? linea.descripcion_proveedor : '',
            descripcion_proveedor: linea ? linea.descripcion_proveedor : '',
            modelo_proveedor_recibida: linea ? linea.modelo_proveedor : '',
            modelo_proveedor: linea ? linea.modelo_proveedor : '',
            tipo_unidad: linea ? linea.tipo_unidad?linea.tipo_unidad: linea.repuesto?linea.repuesto.tipo_unidad:'':'',
        });
    },[linea, pedido_id]);

    useEffect(()=>{ 
        datos.cantidad=Number.parseFloat(datos.cantidad).toFixed(2);
        datos.precio=Number.parseFloat(datos.precio).toFixed(4);
        datos.descuento=Number.parseFloat(datos.descuento).toFixed(2);
        datos.total = Number.parseFloat((datos.precio*datos.cantidad)-(datos.precio*datos.cantidad*datos.descuento/100)).toFixed(4);
        //datos.total=Number.parseFloat(datos.total).toFixed(2);
        datos.por_recibir = linea ? parseFloat(parseFloat(linea.por_recibir)+(parseFloat(datos.cantidad)-parseFloat(linea.cantidad))).toFixed(2) : parseFloat(datos.cantidad);
    },[datos.cantidad, datos.precio, datos.descuento]);

    useEffect(()=>{
        datos.id && proveedor_id && axios.get(BACKEND_SERVER + `/api/repuestos/lista/?proveedores__id=${proveedor_id}&descatalogado=${false}&id=${datos.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, proveedor_id, datos.repuesto]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/tipo_unidad/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTipoUnidad(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const cambiarPrecio = () => {
        axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${datos.id_linea_precio}/`,{
            precio: datos.precio,
            descuento: datos.descuento,
            descripcion_proveedor: datos.descripcion_proveedor,
            modelo_proveedor: datos.modelo_proveedor,
        }, { 
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }    
        })
        .then( res => {
            console.log(res.data);
        })
        .catch(err => { console.log(err);})
    }

    const buscarLinea = () => { //busca la linea en la tabla de precios para poder modificarla después en cambiarPrecio
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/?repuesto__id=${linea.repuesto.id}&proveedor=${proveedor_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }    
        })
        .then( res => {
            datos.id_linea_precio=res.data[0].id;
            cambiarPrecio();
        })
        .catch(err => { console.log(err);})
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
            descripcion_proveedor: datos.descripcion_proveedor,
            modelo_proveedor: datos.modelo_proveedor,
            tipo_unidad: datos.tipo_unidad,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            updatePedido();
            handlerCancelar();
            if(datos.precio!==datos.precio_recibido){
                cambiarPrecio();
            }
            if(datos.descuento!==datos.descuento_recibido){
                cambiarPrecio();
            }
            if(datos.descripcion_proveedor!==datos.descripcion_proveedor_recibida){
                cambiarPrecio();
            }
            if(datos.modelo_proveedor!==datos.modelo_proveedor_recibida){
                cambiarPrecio();
            }
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
    }
     
    const handlerEditar = async () => {   
        if (parseFloat(datos.cantidad)<(parseFloat(linea.cantidad) - parseFloat(linea.por_recibir)) ||parseFloat( datos.por_recibir)<0){            
            alert('Cantidad erronea, revisa cantidad recibida');            
            handlerCancelar();
        }
        else{              
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`,{
                cantidad: parseFloat(datos.cantidad),
                precio: datos.precio,
                descuento: datos.descuento,
                total: datos.total,
                pedido: datos.pedido,
                por_recibir: parseFloat(datos.por_recibir),
                descripcion_proveedor: datos.descripcion_proveedor,
                modelo_proveedor: datos.modelo_proveedor,
                tipo_unidad: datos.tipo_unidad,
                //descripcion_proveedor: datos.descripcion_proveedor,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                updatePedido();
                handlerCancelar();
                if(datos.precio!==datos.precio_recibido){
                    buscarLinea();
                }
                if(datos.descuento!==datos.descuento_recibido){
                    buscarLinea();
                }
                if(datos.descripcion_proveedor!==datos.descripcion_proveedor_recibida){
                    buscarLinea();
                }
                if(datos.modelo_proveedor!==datos.modelo_proveedor_recibida){
                    buscarLinea();
                }
            })
            .catch( err => {           
                handlerCancelar();
            });
        }
    }

    const abrirListRepuestos = () => {
        setShowListRepuestos(true);
    }

    const cerrarListRepuestos = () => {
        setShowListRepuestos(false);
    }

    const elegirRepuesto = (r) => { 
        datos.repuesto=r.repuesto.id;
        datos.nombre=r.repuesto.nombre;
        datos.modelo_proveedor=r.modelo_proveedor;
        datos.precio=r.precio;
        datos.precio_recibido=r.precio;
        datos.descuento=r.descuento;
        datos.descuento_recibido=r.descuento;
        datos.id_linea_precio=r.id;
        datos.descripcion_proveedor=r.descripcion_proveedor;
        datos.tipo_unidad=r.repuesto.tipo_unidad;
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
                                {linea?'':<Button variant="info" tabIndex={1} className={'btn-lg'} autoFocus onClick={event => {abrirListRepuestos()}}>Buscar Repuesto</Button>}
                                <Form.Group controlId="descripcion_proveedor">
                                    <Form.Label>Repuesto</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='descripcion_proveedor' 
                                                value={datos.descripcion_proveedor}
                                                onChange={handleInputChange}
                                                placeholder="Descripción Proveedor"
                                                tabIndex={1}
                                                disabled={linea?false:true}>  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="modelo_proveedor">
                                    <Form.Label>Modelo Repuesto</Form.Label>
                                    <Form.Control imput type="text"  
                                                name='modelo_proveedor' 
                                                value={datos.modelo_proveedor}
                                                onChange={handleInputChange}
                                                placeholder="Modelo Proveedor"
                                                disabled>  
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="tipo_unidad">
                                    <Form.Label>Medida</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_unidad' 
                                                value={datos.tipo_unidad}
                                                onChange={handleInputChange}
                                                placeholder="Unidad medida"> 
                                                <option key={0} value={''}>
                                                        ----
                                                </option>
                                                {tipo_unidad && tipo_unidad.map( medida => {
                                                    return (
                                                    <option key={medida.id} value={medida.id}>
                                                        {medida.siglas}
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
                        <Button variant="info" tabIndex={6} onClick={handlerEditar}> Editar </Button> :
                        <Button variant="info" tabIndex={5} onClick={handlerGuardar}> Guardar </Button>
                    }        
                    <Button variant="waring" tabIndex={7} onClick={handlerCancelar}>
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