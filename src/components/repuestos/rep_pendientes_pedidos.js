//Modal que abre las lineas pendientes de recibir de este repuesto
import React, { } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const ListaPedidos = ({lineasPendientes, repuesto_id, show, handlerListCancelar}) => {

    const handlerListCerrar = () => {      
        handlerListCancelar();
    }

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Header>                
                <Modal.Title>Listado Pedidos en Curso</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th style={{width:110}}>Num-Pedido</th>
                                    <th>Proveedor</th>
                                    <th>Cant. Pendiente</th>
                                    <th style={{width:110}}>Fecha Pedido</th>
                                    <th style={{width:150}}>Fecha Prevista Entrega</th>
                                    <th>Ir al pedido</th>
                                </tr>
                            </thead>                               
                            <tbody>                                    
                                {lineasPendientes && lineasPendientes.map(lineas =>{
                                    if(lineas.por_recibir>0){
                                        if(repuesto_id===lineas.repuesto){
                                            return(
                                                <tr key={lineas.id}>
                                                    <td>{lineas.pedido.numero}</td>
                                                    <td>{lineas.pedido.proveedor.nombre}</td>
                                                    <td>{lineas.por_recibir}</td>
                                                    <td>{invertirFecha(String(lineas.pedido.fecha_creacion))}</td>
                                                    <td>{(lineas.pedido.fecha_prevista_entrega) ? (invertirFecha(String(lineas.pedido.fecha_prevista_entrega))) : ''}</td>
                                                    <td>
                                                        <Link to={`/repuestos/pedido_detalle/${lineas.pedido.id}`}><PencilFill className="mr-3 pencil"/></Link>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    }
                                })}                                
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                <Button variant="info" onClick={handlerListCerrar}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ListaPedidos;