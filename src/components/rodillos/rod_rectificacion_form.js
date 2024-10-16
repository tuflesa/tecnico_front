import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Container } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodRectificacionForm = ({rectificacion, setRectificacion}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date());
    const [zonas, setZonas] = useState([]);
    const [empresas, setEmpresas] = useState([]);

    const [datos, setDatos] = useState({
        id: rectificacion? rectificacion.id : '',
        empresa: rectificacion? rectificacion.empresa: user['tec-user'].perfil.empresa.id,
        zona: rectificacion? rectificacion.maquina.id: '',
        numero: rectificacion?rectificacion.numero:'',
        creado_por: rectificacion?rectificacion.creado_por.get_full_name:user['tec-user'].id,
        fecha: rectificacion?rectificacion.fecha: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        linea: false,
    });

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

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                maquina: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
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

    const GuardarRectificacion = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/`, {
            empresa: datos.empresa,
            fecha: datos.fecha,
            creado_por: datos.creado_por,
            maquina: datos.zona,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setDatos({
                ...datos,
                linea : true,
                numero : res.data.numero,
                id : res.data.id,
            })
        })
        .catch(err => { console.log(err);})
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${datos.id}/`, {
            fecha: datos.fecha,
            maquina: datos.zona,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
        })
        .catch(err => { console.log(err);})
    }

    return(
        <Container className='mt-5 pt-1'>
            <Form >
                <Row>
                    {rectificacion? <h5>Rectificado</h5> : <h5>Nuevo Rectificado</h5>}
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero Rectificado</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        disabled
                                        value={datos.numero}/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Creado por:</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.creado_por}
                                        onChange={handleInputChange} 
                                        placeholder="Creado por"
                                        disabled
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.empresa}
                                            name='empresa'
                                            onChange={handleInputChange}>
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
                            <Form.Label>Zona *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange}>
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
                        <Form.Group controlId="fecha">
                            <Form.Label>Fecha *</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha' 
                                        value={datos.fecha}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación" />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Row className="justify-content-center">
                    {datos.linea || rectificacion ? 
                        <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" className={'mx-2'} onClick={GuardarRectificacion}>Guardar</Button>                                
                    }
                    <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                </Form.Row> 
            </Form>
            <Form>
                {datos.linea ?                            
                    <Col>
                        <Form.Group>
                            <Form.Label className="mt-2">Codigo Barras (con lector) </Form.Label>
                            <Form.Control
                                        type="text"
                                        id="prueba"
                                        tabIndex={2}
                                        name='id' 
                                        //value={numeroBar.id}
                                        onChange={handleInputChange}
                                        placeholder="Codigo de barras" 
                                        autoFocus/>
                        </Form.Group>
                    </Col>: null} 
            </Form>
        </Container>
    );
}
export default RodRectificacionForm;