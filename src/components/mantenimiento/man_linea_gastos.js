import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaGastosMantenimiento = ({show, cerrarListMantenimiento, linea_mantenimiento, num_parte, num_linea_tarea, agregarLineaGasto}) => {
    
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const [datos, setDatos] = useState({  
        descripcion: linea_mantenimiento ? linea_mantenimiento.descripcion : '',
        cantidad: linea_mantenimiento ? linea_mantenimiento.cantidad : 0,
        precio:linea_mantenimiento ? linea_mantenimiento.precio : 0,
        descuento: linea_mantenimiento ? linea_mantenimiento.descuento : 0,
        total: linea_mantenimiento ? linea_mantenimiento.total : 0,
        num_parte: num_parte.id,
        creado_por: linea_mantenimiento ? linea_mantenimiento.creado_por : user['tec-user'].full_name,
    });   

    useEffect(()=>{
        setDatos({  
            descripcion: linea_mantenimiento ? linea_mantenimiento.descripcion : '',
            cantidad: linea_mantenimiento ? linea_mantenimiento.cantidad : 0,
            precio: linea_mantenimiento ? linea_mantenimiento.precio : 0,
            descuento: linea_mantenimiento ? linea_mantenimiento.descuento : 0,
            total: linea_mantenimiento ? linea_mantenimiento.total : 0,
            num_parte: num_parte.id,
            creado_por: linea_mantenimiento ? linea_mantenimiento.creado_por : user['tec-user'].full_name,
        });
    },[linea_mantenimiento, num_parte.id, user]);

    useEffect(()=>{ 
        datos.cantidad=Number.parseFloat(datos.cantidad).toFixed(2);
        datos.precio=Number.parseFloat(datos.precio).toFixed(4);
        datos.descuento=Number.parseFloat(datos.descuento).toFixed(2);
        datos.total = Number.parseFloat((datos.precio*datos.cantidad)-(datos.precio*datos.cantidad*datos.descuento/100)).toFixed(4);
    },[datos.cantidad, datos.precio, datos.descuento]);
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handlerCancelar = () => {      
        cerrarListMantenimiento();
    } 

    const handlerGuardar = () => {
        // Validar campos requeridos
        if (!datos.descripcion || !datos.cantidad || !datos.precio) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Crear objeto de línea de gasto
        const nuevaLinea = {
            descripcion: datos.descripcion,
            cantidad: parseFloat(datos.cantidad),
            precio: parseFloat(datos.precio),
            descuento: parseFloat(datos.descuento),
            total: parseFloat(datos.total),
            creado_por: user['tec-user'].id,
            esNueva: true // Flag para indicar que es nueva
        };

        // Llamar a la función para agregar al estado del padre
        agregarLineaGasto(nuevaLinea);
        
        // Cerrar modal
        handlerCancelar();
    }

    const handlerEditar = () => {
        // Validar campos requeridos
        if (!datos.descripcion || !datos.cantidad || !datos.precio) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Crear objeto de línea editada (mantener el id original)
        const lineaEditada = {
            ...linea_mantenimiento, // Mantener todos los datos originales
            descripcion: datos.descripcion,
            cantidad: parseFloat(datos.cantidad),
            precio: parseFloat(datos.precio),
            descuento: parseFloat(datos.descuento),
            total: parseFloat(datos.total),
            creado_por: datos.creado_por,
        };

        // Llamar a la función para actualizar en el estado del padre
        agregarLineaGasto(lineaEditada);
        
        // Cerrar modal
        handlerCancelar();
    }

    return (
        <Modal show={show} backdrop="static" keyboard={false} animation={false}>
            <Modal.Header>  
                {linea_mantenimiento ?               
                    <Modal.Title>Rectificar Línea de Gastos</Modal.Title> :
                    <Modal.Title>Nueva Línea de Gastos</Modal.Title>
                }
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col>
                            <Form.Group controlId="descripcion">
                                <Form.Label>Descripción *</Form.Label>
                                <Form.Control 
                                    type="text"  
                                    name='descripcion' 
                                    value={datos.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción"
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="cantidad">
                                <Form.Label>Cantidad *</Form.Label>
                                <Form.Control 
                                    type="number"  
                                    step="0.01"
                                    name='cantidad' 
                                    value={datos.cantidad}
                                    onChange={handleInputChange}
                                    placeholder="Cantidad"
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="precio">
                                <Form.Label>Precio *</Form.Label>
                                <Form.Control 
                                    type="number"  
                                    step="0.01"
                                    name='precio' 
                                    value={datos.precio}
                                    onChange={handleInputChange}
                                    placeholder="Precio"
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="descuento">
                                <Form.Label>Descuento (%)</Form.Label>
                                <Form.Control 
                                    type="number"  
                                    step="0.01"
                                    name='descuento' 
                                    value={datos.descuento}
                                    onChange={handleInputChange}
                                    placeholder="Descuento"
                                />
                            </Form.Group>
                            <Form.Group controlId="total">
                                <Form.Label>Total</Form.Label>
                                <Form.Control 
                                    type="text"  
                                    name='total' 
                                    value={datos.total}
                                    disabled
                                    placeholder="Total"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {linea_mantenimiento ?                     
                    <Button variant="info" onClick={handlerEditar}>Editar</Button> :
                    <Button variant="info" onClick={handlerGuardar}>Guardar</Button>
                }        
                <Button variant="warning" onClick={handlerCancelar}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LineaGastosMantenimiento;