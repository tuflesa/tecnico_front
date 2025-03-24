//Modal que abre el listado de los trabajadores que han intervenido en la tarea
import React, { useEffect, useState } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';

const ListaDePersonal = ({lineas_trab, show, handlerClose}) => {
    const [token] = useCookies(['tec-token']);
    const [trabajadores_lineas, setTrabajadoresLineas] = useState([]);

    useEffect(() => {
        setTrabajadoresLineas(lineas_trab?.lineas ?? []);  // Si no existe, usa un array vacío
    }, [lineas_trab]);
            
    
    const handlerListCerrar = () => {      
        handlerClose();
    }

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Header closeButton>                
                <Modal.Title>Trabajadores en la tarea: </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Trabajador</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Observaciones Mantenimiento</th>
                                </tr>
                            </thead>                               
                            <tbody>                               
                                {trabajadores_lineas?.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.trabajador?.get_full_name || 'Sin nombre'}</td>
                                        <td>{invertirFecha(String(t.fecha_inicio))}</td>
                                        <td>{t.fecha_fin ? invertirFecha(String(t.fecha_fin)) : ''}</td>
                                        <td>{lineas_trab?.observaciones_trab || 'Sin observaciones'}</td>
                                    </tr>
                                ))}                                
                            </tbody>

                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                    <Button variant="secondary" onClick={handlerListCerrar}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ListaDePersonal;