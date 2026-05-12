import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaMedicionNueva = ({show, handleCloseLinea, tareaAsignadas, parte, updateParte}) => {
    
    const [token] = useCookies(['tec-token']);
    const [especialidades, setEspecialidades] = useState(null);
    const [listaAsignadas, setListaAsignadas] = useState([]);
    const [enviando, setEnviando] = useState(false);
    
    const [datos, setDatos] = useState({  
        id: null,
        nombre: '',
        especialidad: '',
        prioridad: '',
        medicion: '',
        observaciones: '',
        fecha_plan: null,
        estado: parte.fecha_prevista_inicio?1:4,
        //estado: '',
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

    useEffect(()=>{
        let TareasAsignadasID = [];
        tareaAsignadas && tareaAsignadas.forEach(p => {
            TareasAsignadasID.push(p.id);
        });
        setListaAsignadas(TareasAsignadasID);
    },[tareaAsignadas]);
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handlerCancelar = () => {      
        handleCloseLinea();
    }    

    const handlerGuardar = async () => {
        if (enviando) return;
        setEnviando(true);
        try{
            // 1. Crear la tarea
            const res = await axios.post(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/`,{
                nombre: datos.nombre,
                especialidad: datos.especialidad,
                prioridad: datos.prioridad,
                trabajo: datos.trabajo,
                observaciones: datos.observaciones,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            const newTareaParte = [...listaAsignadas, parseInt(res.data.id)];
            // 2. Crear la línea
            await axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`,{
                parte: parte.id,
                tarea: res.data.id,
                fecha_inicio:null,
                fecha_fin:null,
                fecha_plan: datos.fecha_plan?datos.fecha_plan: parte.fecha_prevista_inicio,
                finalizada: false,
                estado: parte.fecha_prevista_inicio?1:4,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            // 3. Actualizar el parte
            var estado = parte.estado === 3 ? 1 : parte.estado;
            await axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{
                tarea: newTareaParte,
                fecha_finalizacion: null,
                estado: estado,
            },{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            updateParte();
            handlerCancelar();
        } catch(err) {
            console.log(err);
            setEnviando(false); // Liberar si falla
            handlerCancelar();
        }
    }
    
    return (        
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>            
            <Modal.Header closeButton>  
                <h5>Nueva Medición </h5>
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
                            <Form.Group id="trabajo">
                                <Form.Label>Trabajos a realizar</Form.Label>
                                <Form.Control type="text" 
                                            name='trabajo' 
                                            value={datos.trabajo}
                                            onChange={handleInputChange} 
                                            placeholder="Trabajos a realizar"
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
                    <Row>
                        <Col>
                            <Form.Group controlId="fecha_plan">
                                <Form.Label>Fecha Plan{parte.fecha_prevista_inicio===null?' (Parte Pendiente)':''}</Form.Label>
                                <Form.Control type="date" 
                                            name='fecha_plan' 
                                            value={datos.fecha_plan}
                                            onChange={handleInputChange} 
                                            placeholder="Fecha Plan" 
                                            disabled={parte.fecha_prevista_inicio===null?true:false}/>
                            </Form.Group>
                        </Col> 
                    </Row>                    
                </Form>
            </Modal.Body>
            <Modal.Footer>                    
                <Button variant="info" onClick={handlerGuardar} disabled={enviando} > Guardar </Button>                         
                <Button variant="waring" onClick={handlerCancelar} disabled={enviando} >Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LineaMedicionNueva;