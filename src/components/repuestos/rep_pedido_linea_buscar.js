import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';

const BuscarRepuestosPedido = ({cerrarListRepuestos, show, proveedor_id, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState(null);
    const [repuestos, setRepuestos] = useState(null);
    const [datos, setDatos] = useState({
        id:'',
        nombre: '', 
        modelo: '',
    });

    useEffect(()=>{
        filtro && proveedor_id && axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/?proveedor=${proveedor_id}&repuesto__descatalogado=${false}`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
        })
        .catch(err => { console.log(err);})
    },[filtro]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }  
    
    useEffect(()=>{
        const filtro = `?proveedores__id=${proveedor_id}&repuesto__descatalogado=${false}&repuesto__nombre__icontains=${datos.nombre}&repuesto__id=${datos.id}&repuesto__modelo__icontains=${datos.modelo}`;
        actualizaFiltro(filtro);
    },[datos]);

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Repuesto</Modal.Title>
            <Modal.Header>                     
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Buscar por Nombre</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene" 
                                        autoFocus
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="modelo">
                            <Form.Label>Buscar por Modelo</Form.Label>
                            <Form.Control type="text" 
                                        name='modelo' 
                                        value={datos.modelo}
                                        onChange={handleInputChange}                                        
                                        placeholder="Modelo contiene" 
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                        <Form.Label>Id Repuesto</Form.Label>
                        <Form.Control   type="text" 
                                        name='id' 
                                        value={datos.id}
                                        onChange={handleInputChange} 
                                        placeholder="Id repuesto" 
                                        />
                        </Form.Group>
                    </Col>
                    <Button variant="info" onClick={cerrarListRepuestos}>
                        Cerrar
                    </Button> 
                </Row>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Modelo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repuestos && repuestos.map( rep => {                                    
                                    return (                                                
                                        <tr key={rep.repuesto.id}>
                                            <td>{rep.repuesto.nombre}</td> 
                                            <td>{rep.repuesto.modelo}</td> 
                                            <td>
                                            <ArrowDownCircle className="mr-3 pencil" onClick={event => {elegirRepuesto(rep)}}/>
                                            </td>                                                
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                    <Button variant="info" onClick={cerrarListRepuestos}>
                        Cerrar
                    </Button>
            </Modal.Footer>
        </Modal>    
    )
}
export default BuscarRepuestosPedido;