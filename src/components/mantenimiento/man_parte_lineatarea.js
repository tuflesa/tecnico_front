import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaTareaForm = ({show, handleCloseLinea, tarea, parte_id}) => {
    
    const [token] = useCookies(['tec-token']);
    const [especialidades, setEspecialidades] = useState(null);
    
    const [datos, setDatos] = useState({  
        id: null,
        nombre: '',
        especialidad: '',
        prioridad: '',
        observaciones: '',
    }); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/especialidades/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEspecialidades(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
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

    const handlerCancelar = () => {      
        handleCloseLinea();
    } 

    const handlerGuardar = () => {
        axios.post(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/`,{
            nombre: datos.nombre,
            especialidad: datos.especialidad,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            //updateTarea();
            axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`,{
                parte: parte_id,
                tarea: res.data.id,
                fecha_inicio:null,
                fecha_fin:null,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //updateTarea();
                handlerCancelar();
            })
            .catch( err => {
                console.log(err);            
                handlerCancelar();
            });
            handlerCancelar();
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });
    }
    
    return (        
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>            
            <Modal.Header closeButton>  
                <h5>Nueva Tarea </h5>
            </Modal.Header>
            <Modal.Body>
                <Form >
                    <Row>
                        <Col>
                            <Form.Group id="nombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Nombre"
                                            autoFocus
                                />
                            </Form.Group>
                        </Col>
                    </Row> 
                    <Row>
                        <Col>
                            <Form.Group id="especialidades">
                                <Form.Label>Especialidades</Form.Label>
                                    <Form.Control   as="select"  
                                                    name='especialidad' 
                                                    value={datos.especialidad}
                                                    onChange={handleInputChange}
                                                    placeholder="Especialidad">
                                                    <option key={0} value={''}>Seleccionar</option>
                                                    {especialidades && especialidades.map( especialidad => {
                                                        return (
                                                        <option key={especialidad.id} value={especialidad.id}>
                                                            {especialidad.nombre}
                                                        </option>
                                                        )
                                                    })}
                                    </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row> 
                    <Row>
                        <Col>
                            <Form.Group id="prioridad">
                                <Form.Label>Prioridad</Form.Label>
                                <Form.Control type="text" 
                                            name='prioridad' 
                                            value={datos.prioridad}
                                            onChange={handleInputChange} 
                                            placeholder="Prioridad"
                                />
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
                </Form>
            </Modal.Body>
            <Modal.Footer>                    
                <Button variant="info" onClick={handlerGuardar}> Guardar </Button>                         
                <Button variant="waring" onClick={handlerCancelar}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LineaTareaForm;