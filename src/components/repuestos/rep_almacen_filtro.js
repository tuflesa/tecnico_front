import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const AlmacenFiltro = ({ actualizaFiltro }) => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [datos, setDatos] = useState({
        nombre: '',
        empresa: '',
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
        const filtro = `?nombre__icontains=${datos.nombre}&empresa=${datos.empresa}`;
        actualizaFiltro(filtro);
    },[datos, actualizaFiltro]);

    const handleInputChange = (event) => {
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
                                        disabled={handleDisabled()}
                                        autoFocus >
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
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre Almacen</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre contiene" />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default AlmacenFiltro;