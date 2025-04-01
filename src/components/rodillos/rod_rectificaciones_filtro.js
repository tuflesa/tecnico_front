import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RodRectificacionesFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const soyTecnico = user['tec-user'].perfil.puesto.nombre==='Técnico'||user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:false;
    const [proveedores, setProveedores] = useState([]);

    const [datos, setDatos] = useState({
        id:'',
        numero: '',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'',
        creado_por: '',
        finalizado: false,
        proveedor: '',
    });

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);

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
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                maquina: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}&es_maquina_tubo=${true}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                setDatos({
                    ...datos,
                    maquina: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);
   
    useEffect(()=>{
        const filtro = `?empresa=${datos.empresa}&numero__icontains=${datos.numero}&maquina__id=${user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:datos.maquina}&full_name=${datos.creado_por?datos.creado_por:''}&finalizado=${datos.finalizado}&proveedor=${datos.proveedor}`
        actualizaFiltro(filtro);
    },[datos]);   

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/?de_rectificado=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);


    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return ( 
        <Container>
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        value={datos.numero}
                                        onChange={handleInputChange}                                        
                                        placeholder="Numero contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        placeholder="Empresa"
                                        disabled={user['tec-user'].perfil.zona?true:false}>
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
                        <Form.Group controlId="maquina">
                            <Form.Label>Máquina</Form.Label>
                            <Form.Control as="select" 
                                            value={user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:datos.maquina}
                                            name='maquina'
                                            onChange={handleInputChange}
                                            disabled={user['tec-user'].perfil.zona?true:false}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={zona.id}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="creado_por">
                            <Form.Label>Creado por</Form.Label>
                            <Form.Control type="text" 
                                        name='creado_por' 
                                        value={datos.creado_por}
                                        onChange={handleInputChange}                                        
                                        placeholder="Creado_por contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="proveedor">
                            <Form.Label>Proveedor *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.proveedor}
                                            name='proveedor'
                                            onChange={handleInputChange}
                                            disabled = {datos.activado}>
                                <option key={0} value={''}>Todas</option>
                                <option key={'sin_proveedor'} value={'sin_proveedor'}>Sin proveedor</option>
                                {proveedores && proveedores.map( proveedor => {
                                    return (
                                    <option key={proveedor.id} value={proveedor.id}>
                                        {proveedor.nombre}
                                    </option>
                                    )
                                })}
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
            </Form>
        </Container>
     );
}
 
export default RodRectificacionesFiltro;