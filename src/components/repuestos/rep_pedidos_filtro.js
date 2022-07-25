import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const PedidosFiltro = ({ actualizaFiltro }) => {
    const [empresas, setEmpresas] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);

    const [datos, setDatos] = useState({
        nombre: '',
        empresa: user['tec-user'].perfil.empresa.id,
        fecha_creacion_lte:'',
        fecha_creacion_gte:'',
        finalizado: false,
        numero:'',
        creado_por: user['tec-user'].perfil.usuario,

    });

    useEffect(()=>{
        const filtro = `?proveedor__nombre__icontains=${datos.nombre}&fecha_creacion__lte=${datos.fecha_creacion_lte}&fecha_creacion__gte=${datos.fecha_creacion_gte}&finalizado=${datos.finalizado}&numero__icontains=${datos.numero}&empresa=${datos.empresa}&creado_por=${datos.creado_por}`;
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

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/administracion/usuarios/?perfil__empresa__id=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setUsuarios(res.data.sort(function(a, b){
                if(a.get_full_name > b.get_full_name){
                    return 1;
                }
                if(a.get_full_name < b.get_full_name){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.empresa]);

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
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
                                        disabled={handleDisabled()}
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
                        <Form.Group controlId="creado_por">
                            <Form.Label>Creado Por</Form.Label>
                            <Form.Control as="select"  
                                        name='creado_por' 
                                        value={datos.creado_por}
                                        onChange={handleInputChange}
                                        placeholder="Creado por"
                                        disabled={soyTecnico.length===0?true:false}>
                                        <option key={0} value={''}>Todas</option>    
                                        {usuarios && usuarios.map( usuario => {
                                            return (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.get_full_name}
                                            </option>
                                            )
                                        })}
                        </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero Pedido</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        value={datos.numero}
                                        onChange={handleInputChange} 
                                        placeholder="Numero de pedido" />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="fecha_creacion_gte">
                            <Form.Label>Fecha Creación Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_gte' 
                                        value={datos.fecha_creacion_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_creacion_lte">
                            <Form.Label>Fecha Creación Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_lte' 
                                        value={datos.fecha_creacion_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación anterior a..." />
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
            </Form>
        </Container>
    )
}

export default PedidosFiltro;