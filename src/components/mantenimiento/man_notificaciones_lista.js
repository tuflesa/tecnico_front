import React, {useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import NotificacionFiltro from './man_notificacion_filtro';

const NotificacionesLista = () => {
    const [token] = useCookies(['tec-token']);

    const [filtro, setFiltro] = useState('');
    const [notificaciones, setNotificaciones] = useState(null);

    useEffect(()=>{
        console.log(filtro);
        axios.get(BACKEND_SERVER + '/api/mantenimiento/notificaciones/' + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data); 
            setNotificaciones(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

    return (
        <Container>
            <Row className="justify-content-center">
                <NotificacionFiltro actualizaFiltro={setFiltro} /> 
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Notificaciones</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Numero</th>
                                <th>Fecha</th>
                                <th>Que</th>
                                <th>Quien</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notificaciones && notificaciones.map( nota => {
                                return (
                                    <tr key={nota.id}>
                                        <td>{nota.numero}</td>
                                        <td>{nota.fecha_creacion}</td>
                                        <td>{nota.que}</td>
                                        <td>{nota.quien.get_full_name}</td>
                                        <td>
                                            <Link to={`/mantenimiento/notificaciones/${nota.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={null} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default NotificacionesLista