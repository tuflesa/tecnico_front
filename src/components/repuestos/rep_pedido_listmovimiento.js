import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Button, Row, Form, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';

const MovLista = ({linea, handleCloseListMovimiento, show}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listados, setListados] = useState(null);

    useEffect(()=>{
        linea && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_detalle/?linea_pedido__id=${linea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListados(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    },[linea, token]);

    const handlerListCancelar = () => {      
        handleCloseListMovimiento();
    } 

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="lg">
                <Modal.Header closeButton>                
                    <Modal.Title>Listado de Entregas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            { linea ? 
                            <Form.Group controlId="repuesto">
                                    <Form.Label>Repuesto</Form.Label>
                                    <Form.Control type="text"  
                                                name='repuesto' 
                                                value={linea.repuesto.nombre}
                                                disabled>  
                                    </Form.Control>
                            </Form.Group>
                            :null
                            }
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Cantidad Recibida</th>
                                        <th>Albarán</th>
                                        <th>Almacén</th>                                        
                                    </tr>
                                </thead>                                
                                <tbody>                                
                                    {listados && listados.map( lista => {
                                        return (
                                            <tr key={lista.id}>
                                                <td>{invertirFecha(String(lista.fecha))}</td>
                                                <td>{lista.cantidad}</td>
                                                <td>{lista.albaran}</td> 
                                                <td>{lista.almacen.nombre}</td>                                                                    
                                            </tr>
                                        )})
                                    }                                    
                                </tbody>                                
                            </Table>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>                                               
                    <Button variant="info" onClick={handlerListCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    )

}
export default MovLista;