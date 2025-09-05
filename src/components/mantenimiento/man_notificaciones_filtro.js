import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import debounce from 'lodash.debounce';

const ManNotificacionesFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [usuarios, setUsuarios] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Técnico'&&user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?true:false;

    const [datos, setDatos] = useState({
        id: '',
        quien: '',
        finalizado: false,
        revisado: '',
        descartado: false,
        empresa: user['tec-user'].perfil.empresa.id,
        zona: user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'',
        fecha_creacion_lte:'',
        fecha_creacion_gte:'',
        numero: '',
        seguridad: '',
    }); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/administracion/usuarios/?perfil__empresa__id=${user['tec-user'].perfil.empresa.id}`,{
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
    }, [token, user]);

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
        axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setZonas(res.data);
        })
        .catch( err => {
            console.log(err);
        }); 
    }, [token, datos.empresa, user]);

    useEffect(()=>{
        const filtro1 = `?empresa__id=${datos.empresa}&seguridad=${datos.seguridad} & quien=${datos.quien}&finalizado=${datos.finalizado}&revisado=${datos.revisado}&descartado=${datos.descartado}&fecha_creacion__lte=${datos.fecha_creacion_lte}&fecha_creacion__gte=${datos.fecha_creacion_gte}&numero__icontains=${datos.numero}&zona__id=${datos.zona}`;
        const camposTexto = [datos.numero]; 
        if (camposTexto.some(campo => campo !== '' && campo !== null)) {
            const debounceFiltro = debounce(() => {
                actualizaFiltro(filtro1);
            }, 500);
            debounceFiltro();
            return () => debounceFiltro.cancel();
        }else{
            actualizaFiltro(filtro1);
        }
    },[datos, actualizaFiltro, token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const desactivar = () => {
        if(nosoyTecnico){
            return true;
        }
    }

    const desactivar_zona = () => {
        if(user['tec-user'].perfil.zona){    
            return true;
        }
        else{
            return false;
        }
    }

    return (
        <Container className="mb-5 mt-5">
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>  
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero de Notificación</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        value={datos.numero}
                                        onChange={handleInputChange}                                        
                                        placeholder="Numero contiene"/>
                        </Form.Group>
                    </Col>      
                    <Col>
                        <Form.Group controlId="quien">
                            <Form.Label>Creado Por</Form.Label>
                            <Form.Control as="select"  
                                        name='quien' 
                                        value={datos.quien}
                                        onChange={handleInputChange}
                                        placeholder="Creado por">
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
                        <Form.Group controlId="seguridad">
                            <Form.Label>Seguridad</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.seguridad}
                                            name='seguridad'
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
                        <Form.Group controlId="fecha_creacion_gte">
                            <Form.Label>Fecha Notificación Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_gte' 
                                        value={datos.fecha_creacion_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_creacion_lte">
                            <Form.Label>Fecha Notificación Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_creacion_lte' 
                                        value={datos.fecha_creacion_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación anterior a..." />
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
                                        disabled={desactivar()}>
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
                        <Form.Group controlId="zona">
                            <Form.Label>Zona</Form.Label>
                            <Form.Control   as="select" 
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange}
                                            disabled={desactivar_zona()}> 
                                            <option key={0} value={''}>Seleccionar</option>                                      
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
                </Row>
            </Form>
        </Container>
    );
}
export default ManNotificacionesFiltro;