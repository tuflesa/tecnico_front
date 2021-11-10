import React, {useEffect, useState} from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const NotificacionForm = ({notificacion, user}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        id: notificacion ? notificacion.id : null,
        que: notificacion ? notificacion.que : null,
        cuando: notificacion ? notificacion.cuando : null,
        donde: notificacion ? notificacion.donde : null,
        quien: notificacion ? notificacion.quien : user.id,
        como: notificacion ? notificacion.como : null,
        cuanto: notificacion ? notificacion.cuanto : null,
        porque: notificacion ? notificacion.porque : null,
        numero: notificacion ? notificacion.numero : null,
        empresa: notificacion ? notificacion.empresa : user.perfil.empresa.id,
        fecha_creacion: notificacion ? notificacion.fecha_creacion : null,
        para: notificacion ? notificacion.para : null,
        revisado: notificacion ? notificacion.revisado : false,
        descartado: notificacion ? notificacion.descartado : false,
        finalizado: notificacion ? notificacion.finalizado : false,
        conclusion: notificacion ? notificacion.conclusion : ''
    });
    const [empresas, setEmpresas] = useState(null);

    useEffect(() => {
        console.log('usuario ... ', user);
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }

    return (
        <Container>
            <Row className="justify-content-center"> 
                {notificacion ? <h5>Editar Notificacion</h5> : <h5>Nueva Notificacion</h5>}
            </Row>
            <Form >
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        placeholder="Empresa">
                                        {empresas && empresas.map( empresa => {
                                            return (
                                            <option key={empresa.id} value={empresa.id}>
                                                {empresa.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default NotificacionForm