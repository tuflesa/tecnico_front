import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';

const CargasFiltro = ({ actualizaFiltro }) => {
    const hoy = new Date();
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        fecha_entrada: moment(hoy).format('YYYY-MM-DD'),
        pendiente: true
    });
    const [empresas, setEmpresas] = useState([]); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        const filtro = `?empresa=${datos.empresa}&fecha_entrada=${datos.fecha_entrada}&bruto__isnull=${datos.pendiente}`;
        actualizaFiltro(filtro);
        // console.log(filtro);
    },[datos, actualizaFiltro]);

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    return (
        <Container>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.empresa}
                                            name='empresa'
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
                        <Form.Group controlId="fecha">
                            <Form.Label>Fecha entrada</Form.Label>
                            <Form.Control type="date" 
                                            name='fecha_entrada'
                                            value={datos.fecha_entrada}
                                            onChange={handleInputChange}  />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="estado">
                            <Form.Label>Estado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.pendiente}
                                            name='pendiente'
                                            onChange={handleInputChange}>
                                <option value={''}>-------</option>
                                <option value={true}>Pendiente</option>
                                <option value={false}>Finalizado</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default CargasFiltro;