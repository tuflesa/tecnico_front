import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { strToArrBuffer } from 'react-data-export/dist/ExcelPlugin/utils/DataUtil';

const LineaTareaForm = ({linea_tarea, setLineaTarea}) => {
    const [token] = useCookies(['tec-token']);
    const [estados, setEstados] = useState(null);

    const [datos, setDatos] = useState({
        id: linea_tarea.id,
        nombre: linea_tarea.tarea.nombre,
        especialidad: linea_tarea.tarea.especialidad_nombre,
        prioridad: linea_tarea.tarea.prioridad,
        observaciones: linea_tarea.tarea.observaciones,
        fecha_plan: linea_tarea.fecha_plan,
        fecha_inicio: linea_tarea.fecha_inicio,
        fecha_fin: linea_tarea.fecha_fin,
        estado: linea_tarea.estado,
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/estados/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEstados(res.data.sort(function(a, b){
                if(a.id > b.id){
                    return 1;
                }
                if(a.id < b.id){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    } 
        
    const actualizarDatos = (event) => {
        event.preventDefault();        
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${linea_tarea.tarea.id}/`, {
            nombre: datos.nombre,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {        
            console.log(datos.fecha_inicio);    
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea_tarea.id}/`, {
                fecha_inicio:datos.fecha_inicio,
                fecha_fin:datos.fecha_fin,
                fecha_plan:datos.fecha_plan,
                estado: datos.estado,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
                console.log(res.data);
            })
            .catch(err => { console.log(err);})
        })
        .catch(err => { console.log(err);})

    }    

    return (
        <Container>
            <h5>Parte: {linea_tarea.parte.nombre}</h5>
            <Row className="justify-content-center">
                    <h5 className="pb-3 pt-1 mt-2">Detalle del Trabajo</h5>
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group id="prioridad">
                                    <Form.Label>Prioridad</Form.Label>
                                    <Form.Control type="text" 
                                                name='prioridad' 
                                                value={datos.prioridad}
                                                onChange={handleInputChange} 
                                                placeholder="Prioridad"
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="estado">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control as="select"  
                                                name='estado' 
                                                value={datos.estado}
                                                onChange={handleInputChange}
                                                disabled='true'
                                                placeholder="Estado">
                                                    <option key={0} value={''}>Todos</option>
                                                    {estados && estados.map( estado => {
                                                    return (
                                                    <option key={estado.id} value={estado.id}>
                                                        {estado.nombre}
                                                    </option>
                                                    )
                                                })}                                                
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="nombre">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="especialidad">
                                    <Form.Label>Especialidad</Form.Label>
                                    <Form.Control type="text" 
                                                name='especialidad' 
                                                value={datos.especialidad}
                                                disabled='true'
                                    />
                                </Form.Group>
                            </Col>                                          
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="fecha_plan">
                                    <Form.Label>Fecha Plan</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_plan' 
                                                value={datos.fecha_plan}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Plan" />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_inicio">
                                    <Form.Label>Fecha Inicio</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_inicio' 
                                                value={datos.fecha_inicio}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Inicio"
                                                disabled='true' />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_fin">
                                    <Form.Label>Fecha Fin</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_fin' 
                                                value={datos.fecha_fin}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Fin"
                                                disabled='true'/>
                                </Form.Group>
                            </Col> 
                        </Row>                                                  
                        <Row>                            
                            <Col>
                                <Form.Group id="observaciones">
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control type="text" 
                                                name='observaciones' 
                                                value={datos.observaciones}
                                                onChange={handleInputChange} 
                                                placeholder="Observaciones"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>                     
                        <Form.Row className="justify-content-center">
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button>
                                <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar</Button>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </Container>    
    )
}
export default LineaTareaForm;