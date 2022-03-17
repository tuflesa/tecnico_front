import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const TareaForm = ({tarea, setTarea}) => {
    const [token] = useCookies(['tec-token']);
    const [especialidades, setEspecialidades] = useState(null);

    const [datos, setDatos] = useState({
        id: tarea.id ? tarea.id : null,
        nombre: tarea.nombre,
        especialidad: tarea.especialidad,
        prioridad: tarea.prioridad? tarea.prioridad : null,
        observaciones: tarea.observaciones? tarea.observaciones : '',
    });

    useEffect(()=>{
        setDatos({
            id: tarea.id ? tarea.id : null,
            nombre: tarea.nombre,
            especialidad: tarea.especialidad,
            prioridad: tarea.prioridad? tarea.prioridad : null,
            observaciones: tarea.observaciones? tarea.observaciones : '',
        });
    },[tarea]);
    
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

    const crearDatos = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/mantenimiento/tareas/`, {
            nombre: datos.nombre,
            especialidad: datos.especialidad,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTarea(res.data);
            window.location.href = "/mantenimiento/tareas";
        })
        .catch(err => { console.log(err);})
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${datos.id}/`, {
            nombre: datos.nombre,
            especialidad: datos.especialidad,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTarea(res.data);
        })
        .catch(err => { console.log(err);})

    }

    const handleDisabled = () => {
        return tarea.nombre !== ''
    }

    const handleDisabled2 = () => {
        return datos.tipo!=='1'
    }  

    return (
        <Container>
            <Row className="justify-content-center"> 
                {tarea.id ?
                    <h5 className="pb-3 pt-1 mt-2">Detalle de la Tarea</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nueva Tarea</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
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
                            <Col>
                                <Form.Group id="especialidades">
                                    <Form.Label>Especialidades</Form.Label>
                                    <Form.Control as="select"  
                                                name='especialidad' 
                                                value={datos.especialidad}
                                                onChange={handleInputChange}
                                                placeholder="Especialidad">
                                                {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                        <Form.Row className="justify-content-center">
                            {tarea.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearDatos}>Guardar</Button>
                            }
                            <Link to='/mantenimiento/tareas'>
                                <Button variant="warning" >
                                    Cancelar / Cerrar
                                </Button>
                            </Link>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </Container>    
    )
}
export default TareaForm;