import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash } from 'react-bootstrap-icons';

const PedidoForm = ({pedido}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        proveedor: pedido ? pedido.proveedor.id : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : new Date(),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null
    });
    const [proveedores, setProveedores]= useState(null);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            // console.log(res.data);
            setProveedores(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleFinalizado = (event) => {
        setDatos({
            ...datos,
            finalizado : !datos.finalizado
        })
    }

    return (
        <Container>
            <Row className="justify-content-center"> 
            {pedido.id ?
                <h5 className="pb-3 pt-1 mt-2">Pedido Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Pedido</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
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
                            <Col>
                                <Form.Group controlId="fecha_creacion">
                                    <Form.Label>Fecha Creación</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha creación" />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="fecha_cierre">
                                    <Form.Label>Fecha Cierre</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_cierre' 
                                                value={datos.fecha_cierre}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha cierre" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="finalizado">
                                    <Form.Check type="checkbox" 
                                                label="Finalizado"
                                                checked = {datos.finalizado}
                                                onChange = {handleFinalizado} />
                                </Form.Group>
                            </Col>
                        </Row>
                        {pedido.id ?
                            <React.Fragment>
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2">Lineas de pedido:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                    <PlusCircle className="plus mr-2" size={30} onClick={null}/>
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>repuesto</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.lineas_pedido && datos.lineas_pedido.map( linea => {
                                                    return (
                                                        <tr key={linea.id}>
                                                            <td>{linea.repuesto.nombre}</td>
                                                            <td>{linea.cantidad}</td>
                                                            <td>{linea.precio}</td>
                                                            <td>
                                                                <PencilFill className="mr-3 pencil"/>
                                                                {/* <Trash className="trash"  onClick={null} /> */}
                                                            </td>
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Form.Row>                                                
                            </React.Fragment>
                        : null}
                    </Form>
                </Col>
            </Row>    
        </Container>
    )
}

export default PedidoForm;