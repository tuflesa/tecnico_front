import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import debounce from 'lodash.debounce';

const LineasPorAlbaranFiltro = ({ actualizaFiltro }) => {
    const [empresas, setEmpresas] = useState(null);
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        nombre_proveedor: '',
        empresa: user['tec-user'].perfil.empresa.id,
        numero_albaran:'',

    });

    useEffect(() => {
        const debounceFiltro = debounce(() => {
            const filtro = `?proveedor__nombre__icontains=${datos.nombre_proveedor}&empresa__id=${datos.empresa}&numero_albaran=${datos.numero_albaran}`;
            actualizaFiltro(filtro);
        }, 700); // 700ms de espera

        debounceFiltro();

        return () => {
            debounceFiltro.cancel();
        };
    }, [datos]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

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

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="nombre_proveedor">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_proveedor' 
                                        value={datos.nombre_proveedor}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre contiene" 
                                        autoFocus />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        placeholder="Empresa">
                                        <option key={0} value={''}>Todas</option>    
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
                        <Form.Group controlId="numero_albaran">
                            <Form.Label>Número Albarán</Form.Label>
                            <Form.Control type="text" 
                                        name='numero_albaran' 
                                        value={datos.numero_albaran}
                                        onChange={handleInputChange} 
                                        placeholder="Numero de albaran" />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default LineasPorAlbaranFiltro;