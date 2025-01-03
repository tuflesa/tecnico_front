import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ProveedorForm = ({show, handleCloseProveedor, proveedoresAsignados, repuesto_id, updateRepuesto, repuesto_nombre, repuesto_modelo, repuesto_fabricante, setShowProveedor}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        proveedor: '',
        precio:0,
        descuento:0,
        descripcion_proveedor: '',
        modelo_proveedor: '',
        fabricante: '',
    });
    const [proveedores, setProveedores] = useState(null);
    const [listaAsignados, setListaAsignados] = useState([]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            //const proveedoresDisponibles = res.data.filter(p => {return !listaAsignados.includes(p.id)});
            const proveedoresDisponibles = res.data;
            setProveedores(proveedoresDisponibles);
            if (proveedoresDisponibles.length>0){
                setDatos({
                    ...datos,
                    proveedor: proveedoresDisponibles[0].id
                });
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, listaAsignados]);

    useEffect(()=>{
        let proveedoresAsignadosID = [];
        proveedoresAsignados && proveedoresAsignados.forEach(p => {
            proveedoresAsignadosID.push(p.id);
        });
        setListaAsignados(proveedoresAsignadosID);
    },[proveedoresAsignados]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handlerCancelar = () => {
        setDatos({
            proveedor: ''
        });
        handleCloseProveedor()
    }

    const handlerGuardar = () => {
        var newProveedores=[];
        //const Proveedor_repetido = listaAsignados.filter(p => {return datos.proveedor.includes(p.id)});
        const Proveedor_repetido = listaAsignados.filter( pr => pr === datos.proveedor);
        if(Proveedor_repetido.length!==0){;
            newProveedores = [...listaAsignados]
        }
        else{
            newProveedores = [...listaAsignados, parseInt(datos.proveedor)]
        }
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuesto_id}/`, {
            proveedores: newProveedores
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            axios.post(BACKEND_SERVER + `/api/repuestos/precio/`, {
                proveedor: datos.proveedor,
                repuesto: repuesto_id,
                precio: datos.precio,
                descuento: datos.descuento,
                descripcion_proveedor: datos.descripcion_proveedor?datos.descripcion_proveedor:repuesto_nombre,
                modelo_proveedor: datos.modelo_proveedor?datos.modelo_proveedor:repuesto_modelo,
                fabricante: datos.fabricante?datos.fabricante:repuesto_fabricante,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => { 
                    handlerCancelar();
                }
            )
            .catch(err => { console.log(err);});
            updateRepuesto();
            setShowProveedor(false);
        })
        .catch(err => { console.log(err);});
        //crear tabla de precios para el articulo del proveedor
        
    }

    return (
        <Modal show={show} onHide={handleCloseProveedor} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    <Modal.Title>Añadir Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="proveedor">
                                    <Form.Label>Proveedor</Form.Label>
                                    <Form.Control as="select"  
                                                name='proveedor' 
                                                value={datos.proveedor}
                                                onChange={handleInputChange}
                                                placeholder="Proveedor">  
                                                {proveedores && proveedores.map( proveedor => {
                                                    return (
                                                    <option key={proveedor.id} value={proveedor.id}>
                                                        {proveedor.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="precio">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control type="text" 
                                                name='precio' 
                                                value={datos.precio}
                                                onChange={handleInputChange} 
                                                placeholder="Precio"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="descuento">
                                    <Form.Label>Descuento</Form.Label>
                                    <Form.Control type="text" 
                                                name='descuento' 
                                                value={datos.descuento}
                                                onChange={handleInputChange} 
                                                placeholder="Descuento"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="fabricante">
                                    <Form.Label>Fabricante</Form.Label>
                                    <Form.Control type="text" 
                                                name='fabricante' 
                                                value={datos.fabricante}
                                                onChange={handleInputChange} 
                                                placeholder="Fabricante"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="descripcion_proveedor">
                                    <Form.Label>Descripción Proveedor</Form.Label>
                                    <Form.Control as="textarea"
                                                rows={2}
                                                name='descripcion_proveedor' 
                                                value={datos.descripcion_proveedor}
                                                onChange={handleInputChange} 
                                                placeholder="Descripción proveedor"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="modelo_proveedor">
                                    <Form.Label>Modelo Proveedor</Form.Label>
                                    <Form.Control type="text" 
                                                name='modelo_proveedor' 
                                                value={datos.modelo_proveedor}
                                                onChange={handleInputChange} 
                                                placeholder="Modelo proveedor"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" onClick={handlerGuardar}>Guardar</Button>
                    <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
                </Modal.Footer>
        </Modal>
    );
}

export default ProveedorForm;