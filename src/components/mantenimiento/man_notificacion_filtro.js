import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const NotificacionFiltro = ({ actualizaFiltro }) => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [datos, setDatos] = useState({
        que: '',
        empresa: user['tec-user'].perfil.empresa.id,
        revisado: '',
        descartado: false,
        finalizado: false
    });
    const [empresas, setEmpresas] = useState([]);

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

    useEffect(()=>{
        const filtro = `?que__icontains=${datos.que}&empresa=${datos.empresa}&revisado=${datos.revisado}&descartado=${datos.descartado}&finalizado=${datos.finalizado}`;
        console.log('filtro = ', filtro);
        actualizaFiltro(filtro);
    },[datos, actualizaFiltro]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.puesto.nombre!=='Técnico'
    }

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select" 
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange} 
                                        disabled={handleDisabled()}>
                                <option key={0} value={''}>-------</option>
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
                        <Form.Group controlId="revisado">
                            <Form.Label>Revisado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.revisado}
                                            name='revisado'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="descartado">
                            <Form.Label>Descartado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.descartado}
                                            name='descartado'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="finalizado">
                            <Form.Label>Finalizado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.finalizado}
                                            name='finalizado'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="que">
                            <Form.Label>Que</Form.Label>
                            <Form.Control type="text" 
                                        name='que' 
                                        value={datos.que}
                                        onChange={handleInputChange} 
                                        placeholder="Que contiene" />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default NotificacionFiltro;