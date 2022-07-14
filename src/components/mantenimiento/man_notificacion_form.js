import React, {useEffect, useState} from 'react';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const NotificacionForm = ({notificacion, user}) => {
    const [token] = useCookies(['tec-token']);

    const hoy = new Date();
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
        fecha_creacion: notificacion ? notificacion.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        para: notificacion ? notificacion.para : null,
        revisado: notificacion ? notificacion.revisado : false,
        descartado: notificacion ? notificacion.descartado : false,
        finalizado: notificacion ? notificacion.finalizado : false,
        conclusion: notificacion ? notificacion.conclusion : ''
    });
    const [empresas, setEmpresas] = useState(null);

    useEffect(() => {
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

    const handleDisabled = () => {
        return user.perfil.nivel_acceso.nombre === 'local'
    }

    return (
        <Container className="mb-5 mt-5">
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
                                        placeholder="Empresa"
                                        disabled={handleDisabled()}>
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
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Número</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        value={datos.numero}
                                        disabled={true} 
                                        placeholder="Número de notificación"
                            />
                            </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_creacion">
                            <Form.Label>Fecha Creación</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion' 
                                        value={datos.fecha_creacion}
                                        disabled={true}
                                        placeholder="Fecha creación" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="quien">
                            <Form.Label>Creado Por</Form.Label>
                            <Form.Control as="select"  
                                        name='quien' 
                                        value={datos.quien}
                                        disabled={true}>
                                        <option key={user.id} value={user.id}>
                                                {user.get_full_name}
                                            </option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default NotificacionForm