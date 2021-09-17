import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ProveedorForm = ({show, handleCloseProveedor, proveedoresAsignados, repuesto_id, updateRepuesto}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        proveedor: ''
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
            // console.log(res.data);
            const proveedoresDisponibles = res.data.filter(p => {return !listaAsignados.includes(p.id)});
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
        handleCloseProveedor();
    }

    const handlerGuardar = () => {
        console.log('Guardar ...');
        // console.log(datos.proveedor);
        const newProveedores = [...listaAsignados, parseInt(datos.proveedor)];
        console.log(newProveedores);
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuesto_id}/`, {
            proveedores: newProveedores
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
                // console.log(res.data);
                updateRepuesto();
                handlerCancelar();
            }
        )
        .catch(err => { console.log(err);});
    }

    return (
        <Modal show={show} onHide={handleCloseProveedor} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" 
                        onClick={handlerGuardar}>
                        Guardar
                    </Button>
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    );
}

export default ProveedorForm;