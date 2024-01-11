//Modal que abre el listado de los trabajadores que han intervenido en la tarea
import React, { useEffect, useState } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';

const ListaDePersonal = ({linea_id, show, handlerClose}) => {
    const [token] = useCookies(['tec-token']);
    const [trabajadores_lineas, setTrabajadoresLineas] = useState(null);

    useEffect(() => {
        linea_id && axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_en_linea/?linea=${linea_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setTrabajadoresLineas(res.data.sort(function(a, b){
                if(a.fecha_inicio < b.fecha_inicio){
                    return 1;
                }
                if(a.fecha_inicio > b.fecha_inicio){
                    return -1;
                }
                return 0;
            }))            
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, linea_id]); 
    
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
                                {trabajadores_lineas && trabajadores_lineas.map(t =>{
                                    return(
                                        <tr key={t.id}>
                                            <td>{t.trabajador.get_full_name}</td>
                                            <td>{invertirFecha(String(t.linea.fecha_inicio))}</td>
                                            <td>{t.linea.fecha_fin?invertirFecha(String(t.linea.fecha_fin)):''}</td>
                                            <td>{t.linea.observaciones_trab}</td>
                                        </tr>
                                    )
                                })}                                
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